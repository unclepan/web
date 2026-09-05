"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown, Upload, MapPin, Calendar, Clock, Pen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/i18n/useLocale";
import { format } from "@/i18n/locale-utils";
import QuestionTitle from "./QuestionTitle";
import { OptionText } from "./choice";
import type { AnswerValue } from "@/lib/survey-types";

type OptionType = { value: string; text: string };
type CascaderLevel = { name: string; options: string[] };

type SharedProps = {
  props: Record<string, unknown>;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  error?: string;
  index: number;
};

/** 排序 workRanking */
export function AnswerRanking({ props, value, onChange, error, index }: SharedProps) {
  const { t } = useLocale();
  const title = props.title as string | undefined;
  const required = props.required as boolean | undefined;
  const options = (props.options || []) as OptionType[];
  const rankingValue = value.type === "ranking" ? value.value : [];

  // 未排序项 = 所有选项 - 已排序项
  const remaining = options.filter((opt) => !rankingValue.includes(opt.value));
  const ranked = rankingValue
    .map((v) => options.find((o) => o.value === v))
    .filter(Boolean) as OptionType[];

  function moveUp(i: number) {
    if (i === 0) return;
    const next = [...rankingValue];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    onChange({ type: "ranking", value: next });
  }
  function moveDown(i: number) {
    if (i === ranked.length - 1) return;
    const next = [...rankingValue];
    [next[i + 1], next[i]] = [next[i], next[i + 1]];
    onChange({ type: "ranking", value: next });
  }
  function add(value: string) {
    onChange({ type: "ranking", value: [...rankingValue, value] });
  }
  function remove(value: string) {
    onChange({ type: "ranking", value: rankingValue.filter((v) => v !== value) });
  }

  return (
    <div className="mb-5">
      <QuestionTitle title={title} required={required} index={index} error={error} />
      {/* 已排序 */}
      {ranked.length > 0 && (
        <div className="space-y-2 mb-3">
          {ranked.map((opt, i) => (
            <div
              key={opt.value}
              className="flex items-center gap-2 px-3 py-2 rounded-md border border-blue-200 bg-blue-500/15"
            >
              <Badge className="bg-blue-500 shrink-0">{i + 1}</Badge>
              <OptionText raw={opt.text} className="text-sm text-foreground flex-1" />
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="size-7" onClick={() => moveUp(i)}>
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="size-7" onClick={() => moveDown(i)}>
                  <ArrowDown className="size-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="size-7 text-red-400" onClick={() => remove(opt.value)}>
                  ✕
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* 待排序 */}
      {remaining.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{t((m) => m.survey.clickToAddRank)}</p>
          {remaining.map((opt) => (
            <div
              key={opt.value}
              className="flex items-center gap-2 px-3 py-2 rounded-md border border-border cursor-pointer hover:border-border"
              onClick={() => add(opt.value)}
            >
              <OptionText raw={opt.text} className="text-sm text-muted-foreground flex-1" />
              <ArrowUp className="size-3.5 text-muted-foreground rotate-90" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** 图片/文件上传 workFileUpload —— 遵循编辑端 maxFiles / accept / maxSize 配置 */
export function AnswerFileUpload({ props, value, onChange, error, index }: SharedProps) {
  const { t } = useLocale();
  const title = props.title as string | undefined;
  const required = props.required as boolean | undefined;
  const maxFiles = (props.maxFiles as number) || 1;
  const accept = (props.accept as string) || "";
  const maxSize = (props.maxSize as number) || 10;
  const fileValue = value.type === "file" ? value.value : [];
  const [localError, setLocalError] = useState("");

  function handleFiles(files: FileList | null) {
    if (!files) return;
    setLocalError("");
    // 与编辑端一致：限制文件类型与单文件大小，总数封顶 maxFiles
    const oversized = Array.from(files).find((f) => f.size > maxSize * 1024 * 1024);
    if (oversized) {
      setLocalError(
        format(t((m) => m.survey.fileTooLarge), { name: oversized.name, maxSize }),
      );
      return;
    }
    const remaining = Math.max(maxFiles - fileValue.length, 0);
    const names = Array.from(files).slice(0, remaining).map((f) => f.name);
    if (names.length > 0) {
      onChange({ type: "file", value: [...fileValue, ...names] });
    }
  }

  const hintParts = [format(t((m) => m.survey.maxFilesCount), { maxFiles })];
  if (accept === "image/*") hintParts.push(t((m) => m.survey.imageOnlyHint));
  hintParts.push(format(t((m) => m.survey.maxFileSize), { maxSize }));

  return (
    <div className="mb-5">
      <QuestionTitle title={title} required={required} index={index} error={error} />
      <Card className="p-0 overflow-hidden">
        <label className="flex flex-col items-center justify-center gap-2 py-8 cursor-pointer hover:bg-muted transition-colors">
          <Upload className="size-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{t((m) => m.survey.clickToUpload)}</span>
          <span className="text-xs text-muted-foreground">{hintParts.join(" · ")}</span>
          <input
            type="file"
            className="hidden"
            accept={accept || undefined}
            multiple={maxFiles > 1}
            onChange={(e) => {
              handleFiles(e.target.files);
              // 允许重复选择同一文件
              e.target.value = "";
            }}
          />
        </label>
      </Card>
      {localError && <p className="mt-1.5 text-xs text-red-500">{localError}</p>}
      {fileValue.length > 0 && (
        <div className="mt-2 space-y-1">
          {fileValue.map((name, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground px-2 py-1 rounded bg-muted">
              <span className="flex-1 truncate">{name}</span>
              <button
                className="text-red-400 hover:text-red-500"
                onClick={() => onChange({ type: "file", value: fileValue.filter((_, idx) => idx !== i) })}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** 多级联动 workCascader */
export function AnswerCascader({ props, value, onChange, error, index }: SharedProps) {
  const { t } = useLocale();
  const title = props.title as string | undefined;
  const required = props.required as boolean | undefined;
  const levels = (props.levels || []) as CascaderLevel[];
  const cascaderValue = value.type === "cascader" ? value.value : [];

  function selectLevel(levelIndex: number, option: string) {
    const next = [...cascaderValue];
    next[levelIndex] = option;
    // 清空后续已选
    next.length = levelIndex + 1;
    onChange({ type: "cascader", value: next });
  }

  return (
    <div className="mb-5">
      <QuestionTitle title={title} required={required} index={index} error={error} />
      <div className="space-y-2">
        {levels.map((level, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-16 shrink-0">{level.name}</span>
            <Select
              value={cascaderValue[i] || ""}
              onValueChange={(v) => selectLevel(i, v)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={format(t((m) => m.survey.pleaseSelectLevel), { name: level.name })} />
              </SelectTrigger>
              <SelectContent>
                {level.options.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 日期/时间 workDateTime */
export function AnswerDateTime({ props, value, onChange, error, index }: SharedProps) {
  const title = props.title as string | undefined;
  const required = props.required as boolean | undefined;
  const mode = (props.mode as "date" | "time" | "datetime") || "date";
  const dtValue = value.type === "datetime" ? value.value : "";

  const inputType = mode === "date" ? "date" : mode === "time" ? "time" : "datetime-local";
  const Icon = mode === "time" ? Clock : Calendar;

  return (
    <div className="mb-5">
      <QuestionTitle title={title} required={required} index={index} error={error} />
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          type={inputType}
          value={dtValue}
          onChange={(e) => onChange({ type: "datetime", value: e.target.value })}
          className={`pl-9 ${error ? "border-red-300" : ""}`}
        />
      </div>
    </div>
  );
}

/** 手写签名 workSignature */
export function AnswerSignature({ props, value, onChange, error, index }: SharedProps) {
  const { t } = useLocale();
  const title = props.title as string | undefined;
  const required = props.required as boolean | undefined;
  const sigValue = value.type === "signature" ? value.value : "";
  const [drawing, setDrawing] = useState(false);

  return (
    <div className="mb-5">
      <QuestionTitle title={title} required={required} index={index} error={error} />
      <Card className="p-0 overflow-hidden">
        {sigValue ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sigValue} alt={t((m) => m.survey.signatureAlt)} className="w-full" style={{ maxHeight: 200 }} />
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => onChange({ type: "signature", value: "" })}
            >
              {t((m) => m.survey.resign)}
            </Button>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center gap-2 py-12 cursor-pointer hover:bg-muted"
            onClick={() => setDrawing(!drawing)}
          >
            <Pen className="size-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{t((m) => m.survey.clickToSign)}</span>
            <span className="text-xs text-muted-foreground">{t((m) => m.survey.signHint)}</span>
          </div>
        )}
      </Card>
      {/* 签名画布占位 — 实际项目中接入 canvas 签名库 */}
      {drawing && !sigValue && (
        <div className="mt-2 p-3 rounded-md border border-dashed border-border text-center text-xs text-muted-foreground">
          {t((m) => m.survey.signatureCanvasPlaceholder)}
        </div>
      )}
    </div>
  );
}

/** 地理位置 workLocation */
export function AnswerLocation({ props, value, onChange, error, index }: SharedProps) {
  const { t } = useLocale();
  const title = props.title as string | undefined;
  const required = props.required as boolean | undefined;
  const locValue = value.type === "location" ? value.value : "";

  function getLocation() {
    if (!navigator.geolocation) {
      onChange({ type: "location", value: t((m) => m.survey.geolocationUnsupported) });
      return;
    }
    onChange({ type: "location", value: t((m) => m.survey.gettingLocation) });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          type: "location",
          value: `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`,
        });
      },
      () => {
        onChange({ type: "location", value: t((m) => m.survey.getLocationFailed) });
      },
    );
  }

  return (
    <div className="mb-5">
      <QuestionTitle title={title} required={required} index={index} error={error} />
      <Card className="p-0">
        <div className="flex items-center gap-3 p-4">
          <div className="size-10 rounded-full bg-blue-500/15 flex items-center justify-center shrink-0">
            <MapPin className="size-5 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            {locValue ? (
              <p className="text-sm text-foreground truncate">{locValue}</p>
            ) : (
              <p className="text-sm text-muted-foreground">{t((m) => m.survey.locationNotObtained)}</p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={getLocation}>
            {t((m) => m.survey.getLocation)}
          </Button>
        </div>
      </Card>
    </div>
  );
}

/** MaxDiff workMaxDiff */
export function AnswerMaxDiff({ props, value, onChange, error, index }: SharedProps) {
  const { t } = useLocale();
  const title = props.title as string | undefined;
  const required = props.required as boolean | undefined;
  const options = (props.options || []) as OptionType[];
  const maxdiffValue = value.type === "maxdiff" ? value.value : { best: "", worst: "" };

  return (
    <div className="mb-5">
      <QuestionTitle title={title} required={required} index={index} error={error} />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">{t((m) => m.survey.optionCol)}</th>
              <th className="text-center py-2 px-3 text-green-600 dark:text-green-300 font-medium w-24">{t((m) => m.survey.mostImportant)}</th>
              <th className="text-center py-2 px-3 text-red-600 dark:text-red-300 font-medium w-24">{t((m) => m.survey.leastImportant)}</th>
            </tr>
          </thead>
          <tbody>
            {options.map((opt) => {
              const isBest = maxdiffValue.best === opt.value;
              const isWorst = maxdiffValue.worst === opt.value;
              return (
                <tr key={opt.value} className="border-b last:border-0">
                  <td className="py-2.5 px-3 text-foreground">
                    <OptionText raw={opt.text} />
                  </td>
                  <td className="text-center py-2.5 px-3">
                    <input
                      type="radio"
                      name="maxdiff-best"
                      checked={isBest}
                      onChange={() =>
                        onChange({
                          type: "maxdiff",
                          // 同一选项不能同时是最重要和最不重要：选新值时清掉冲突端
                          value: {
                            best: opt.value,
                            worst: maxdiffValue.worst === opt.value ? "" : maxdiffValue.worst,
                          },
                        })
                      }
                      className="size-4 accent-green-500"
                    />
                  </td>
                  <td className="text-center py-2.5 px-3">
                    <input
                      type="radio"
                      name="maxdiff-worst"
                      checked={isWorst}
                      onChange={() =>
                        onChange({
                          type: "maxdiff",
                          value: {
                            best: maxdiffValue.best === opt.value ? "" : maxdiffValue.best,
                            worst: opt.value,
                          },
                        })
                      }
                      className="size-4 accent-red-500"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
