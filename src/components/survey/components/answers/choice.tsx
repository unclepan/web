"use client";

import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useLocale } from "@/i18n/useLocale";
import QuestionTitle from "./QuestionTitle";
import { useQuillHTML } from "./display";
import type { AnswerValue } from "@/lib/survey-types";

type OptionType = { value: string; text: string };
type ImageOptionType = { value: string; text: string; image: string };

type SharedProps = {
  props: Record<string, unknown>;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  error?: string;
  index: number;
};

const optionClass =
  "flex items-center gap-2.5 px-3.5 py-3 sm:py-2.5 rounded-md border cursor-pointer transition-colors touch-manipulation";

/**
 * 选项文字渲染：编辑端选项用 Quill 编辑（delta JSON），需转换后展示
 * 纯文本（默认数据）原样返回，不受影响
 */
export function OptionText({ raw, className }: { raw: string; className?: string }) {
  const html = useQuillHTML(raw);
  return (
    <span
      className={`min-w-0 [&_p]:m-0 [&_.ql-align-center]:text-center [&_.ql-align-right]:text-right ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** 编辑端 row 属性（24/12/8/6）→ 列数 class，与编辑端保持一致 */
function rowToGridCols(row?: number): string {
  switch (row) {
    case 24:
      return "grid-cols-1";
    case 8:
      return "grid-cols-3";
    case 6:
      return "grid-cols-4";
    case 12:
    default:
      return "grid-cols-2";
  }
}

/** 单选 workRadio */
export function AnswerRadio({ props, value, onChange, error, index }: SharedProps) {
  const title = props.title as string | undefined;
  const required = props.required as boolean | undefined;
  const options = (props.options || []) as OptionType[];
  const row = props.row as number | undefined;
  const singleValue = value.type === "single" ? value.value : "";

  return (
    <div className="mb-5">
      <QuestionTitle title={title} required={required} index={index} error={error} />
      <RadioGroup
        value={singleValue}
        onValueChange={(v) => onChange({ type: "single", value: v })}
        className={`grid gap-2 ${rowToGridCols(row ?? 24)}`}
      >
        {options.map((opt) => {
          const isSelected = singleValue === opt.value;
          return (
            <label
              key={opt.value}
              className={`${optionClass} ${isSelected ? "border-blue-400 bg-blue-500/15" : "border-border hover:border-border"}`}
            >
              <RadioGroupItem value={opt.value} className="shrink-0" />
              <OptionText raw={opt.text} className={`text-sm ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-foreground"}`} />
            </label>
          );
        })}
      </RadioGroup>
    </div>
  );
}

/** 多选 workCheckbox */
export function AnswerCheckbox({ props, value, onChange, error, index }: SharedProps) {
  const title = props.title as string | undefined;
  const required = props.required as boolean | undefined;
  const list = (props.list || []) as OptionType[];
  const row = props.row as number | undefined;
  const multipleValue = value.type === "multiple" ? value.value : [];

  return (
    <div className="mb-5">
      <QuestionTitle title={title} required={required} index={index} error={error} />
      <div className={`grid gap-2 ${rowToGridCols(row ?? 24)}`}>
        {list.map((opt) => {
          const isChecked = multipleValue.includes(opt.value);
          return (
            <label
              key={opt.value}
              className={`${optionClass} ${isChecked ? "border-blue-400 bg-blue-500/15" : "border-border hover:border-border"}`}
            >
              <Checkbox
                className="shrink-0"
                checked={isChecked}
                onCheckedChange={(checked) => {
                  const next = checked
                    ? [...multipleValue, opt.value]
                    : multipleValue.filter((v) => v !== opt.value);
                  onChange({ type: "multiple", value: next });
                }}
              />
              <OptionText raw={opt.text} className={`text-sm ${isChecked ? "text-blue-700 dark:text-blue-300" : "text-foreground"}`} />
            </label>
          );
        })}
      </div>
    </div>
  );
}

/** 下拉选择 workSelect */
export function AnswerSelect({ props, value, onChange, error, index }: SharedProps) {
  const { t } = useLocale();
  const title = props.title as string | undefined;
  const required = props.required as boolean | undefined;
  const placeholder = (props.placeholder as string) || t((m) => m.survey.pleaseSelect);
  const options = (props.options || []) as OptionType[];
  const singleValue = value.type === "single" ? value.value : "";

  return (
    <div className="mb-5">
      <QuestionTitle title={title} required={required} index={index} error={error} />
      <Select value={singleValue} onValueChange={(v) => onChange({ type: "single", value: v })}>
        <SelectTrigger className={`w-full ${error ? "border-red-300" : ""}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <OptionText raw={opt.text} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** 图片单选 workImageRadio */
export function AnswerImageRadio({ props, value, onChange, error, index }: SharedProps) {
  const { t } = useLocale();
  const title = props.title as string | undefined;
  const required = props.required as boolean | undefined;
  const options = (props.options || []) as ImageOptionType[];
  const row = props.row as number | undefined;
  const singleValue = value.type === "single" ? value.value : "";

  return (
    <div className="mb-5">
      <QuestionTitle title={title} required={required} index={index} error={error} />
      <div className={`grid gap-3 ${rowToGridCols(row ?? 12)}`}>
        {options.map((opt) => {
          const isSelected = singleValue === opt.value;
          return (
            <Card
              key={opt.value}
              className={`p-3 cursor-pointer transition-all ${isSelected ? "ring-2 ring-blue-400 bg-blue-500/15" : "hover:border-border"}`}
              onClick={() => onChange({ type: "single", value: opt.value })}
            >
              <div className="aspect-square bg-muted rounded-md mb-2 flex items-center justify-center overflow-hidden">
                {opt.image ? (
                  <Image src={opt.image} alt={opt.text} width={200} height={200} className="w-full h-full object-cover" unoptimized />
                ) : (
                  <span className="text-xs text-muted-foreground">{t((m) => m.survey.noImage)}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center justify-center w-4 h-4 rounded-full border-2 shrink-0 ${
                    isSelected ? "border-blue-500" : "border-border"
                  }`}
                >
                  {isSelected && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                </span>
                <OptionText raw={opt.text} className={`text-xs ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-foreground"}`} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/** 图片多选 workImageCheckbox */
export function AnswerImageCheckbox({ props, value, onChange, error, index }: SharedProps) {
  const { t } = useLocale();
  const title = props.title as string | undefined;
  const required = props.required as boolean | undefined;
  const options = (props.options || []) as ImageOptionType[];
  const row = props.row as number | undefined;
  const multipleValue = value.type === "multiple" ? value.value : [];

  return (
    <div className="mb-5">
      <QuestionTitle title={title} required={required} index={index} error={error} />
      <div className={`grid gap-3 ${rowToGridCols(row ?? 12)}`}>
        {options.map((opt) => {
          const isChecked = multipleValue.includes(opt.value);
          return (
            <Card
              key={opt.value}
              className={`p-3 cursor-pointer transition-all ${isChecked ? "ring-2 ring-blue-400 bg-blue-500/15" : "hover:border-border"}`}
              onClick={() => {
                const next = isChecked
                  ? multipleValue.filter((v) => v !== opt.value)
                  : [...multipleValue, opt.value];
                onChange({ type: "multiple", value: next });
              }}
            >
              <div className="aspect-square bg-muted rounded-md mb-2 flex items-center justify-center overflow-hidden">
                {opt.image ? (
                  <Image src={opt.image} alt={opt.text} width={200} height={200} className="w-full h-full object-cover" unoptimized />
                ) : (
                  <span className="text-xs text-muted-foreground">{t((m) => m.survey.noImage)}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={isChecked} onCheckedChange={() => {}} />
                <OptionText raw={opt.text} className={`text-xs ${isChecked ? "text-blue-700 dark:text-blue-300" : "text-foreground"}`} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
