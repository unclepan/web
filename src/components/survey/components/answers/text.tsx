"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocale } from "@/i18n/useLocale";
import { format } from "@/i18n/locale-utils";
import QuestionTitle from "./QuestionTitle";
import type { AnswerValue } from "@/lib/survey-types";

type SharedProps = {
  props: Record<string, unknown>;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  error?: string;
  index: number;
};

/** 单行输入 workInput */
export function AnswerInput({ props, value, onChange, error, index }: SharedProps) {
  const { t } = useLocale();
  const title = props.title as string | undefined;
  const placeholder = props.placeholder as string | undefined;
  const required = props.required as boolean | undefined;
  const textValue = value.type === "text" ? value.value : "";

  return (
    <div className="mb-5">
      <QuestionTitle title={title} required={required} index={index} error={error} />
      <Input
        value={textValue}
        onChange={(e) => onChange({ type: "text", value: e.target.value })}
        placeholder={placeholder || t((m) => m.survey.pleaseInput)}
        className={error ? "border-red-300" : ""}
      />
    </div>
  );
}

/** 多行输入 workTextarea */
export function AnswerTextarea({ props, value, onChange, error, index }: SharedProps) {
  const { t } = useLocale();
  const title = props.title as string | undefined;
  const placeholder = props.placeholder as string | undefined;
  const required = props.required as boolean | undefined;
  const row = (props.row as number) || 3;
  const textValue = value.type === "text" ? value.value : "";

  return (
    <div className="mb-5">
      <QuestionTitle title={title} required={required} index={index} error={error} />
      <Textarea
        value={textValue}
        onChange={(e) => onChange({ type: "text", value: e.target.value })}
        placeholder={placeholder || t((m) => m.survey.pleaseInput)}
        rows={row}
        className={error ? "border-red-300" : ""}
      />
    </div>
  );
}

/** 多项填空 workBlanks */
export function AnswerBlanks({ props, value, onChange, error, index }: SharedProps) {
  const { t } = useLocale();
  const title = props.title as string | undefined;
  const required = props.required as boolean | undefined;

  // 从 title 的 Quill Delta 中提取填空数量
  const blankCount = useMemo(() => {
    if (!title) return 0;
    try {
      const delta = JSON.parse(title);
      return (delta.ops || []).filter(
        (op: { insert: unknown }) =>
          typeof op.insert === "object" && op.insert !== null && (op.insert as { type: string }).type === "blanks",
      ).length;
    } catch {
      return 0;
    }
  }, [title]);

  const blanksValue = value.type === "blanks" ? value.value : [];
  const optionClass =
    "flex items-center gap-2.5 px-3.5 py-2.5 rounded-md border border-border";

  return (
    <div className="mb-5">
      <QuestionTitle title={title} required={required} index={index} error={error} />
      <div className="space-y-2">
        {Array.from({ length: blankCount }).map((_, i) => (
          <div key={i} className={optionClass}>
            <span className="text-xs text-muted-foreground shrink-0 w-12">{format(t((m) => m.survey.blankN), { n: i + 1 })}</span>
            <Input
              value={blanksValue[i] || ""}
              onChange={(e) => {
                const next = [...blanksValue];
                next[i] = e.target.value;
                onChange({ type: "blanks", value: next });
              }}
              placeholder={t((m) => m.survey.pleaseInput)}
              className="border-0 shadow-none focus-visible:ring-0 px-0"
            />
          </div>
        ))}
        {blankCount === 0 && (
          <p className="text-xs text-muted-foreground">{t((m) => m.survey.noBlanksDetected)}</p>
        )}
      </div>
    </div>
  );
}
