"use client";

import { Star, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocale } from "@/i18n/useLocale";
import QuestionTitle from "./QuestionTitle";
import type { AnswerValue } from "@/lib/survey-types";

type SharedProps = {
  props: Record<string, unknown>;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  error?: string;
  index: number;
};

const btnBase =
  "flex items-center justify-center rounded-md border cursor-pointer transition-all text-sm font-medium tabular-nums select-none";
const btnUnselected = "border-border text-muted-foreground hover:border-border";
const btnSelected = "border-blue-500 bg-blue-500 text-white";

/** 量表 workScale —— 整体居中，两端标签分别与最小/最大值按钮左右对齐 */
export function AnswerScale({ props, value, onChange, error, index }: SharedProps) {
  const title = props.title as string | undefined;
  const required = props.required as boolean | undefined;
  const min = (props.min as number) ?? 1;
  const max = (props.max as number) ?? 5;
  const minLabel = (props.minLabel as string) || "";
  const maxLabel = (props.maxLabel as string) || "";
  const scaleValue = value.type === "scale" ? value.value : null;
  const nums = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="mb-5">
      <QuestionTitle title={title} required={required} index={index} error={error} />
      <div className="overflow-x-auto pb-1">
        {/* w-max：容器宽度=按钮行宽度，mx-auto 居中；标签行 justify-between 即与两端按钮边缘对齐 */}
        <div className="mx-auto w-max">
          <div className="flex gap-1.5">
            {nums.map((n) => (
              <button
                key={n}
                type="button"
                className={`${btnBase} h-9 w-9 shrink-0 ${scaleValue === n ? btnSelected : btnUnselected}`}
                onClick={() => onChange({ type: "scale", value: n })}
              >
                {n}
              </button>
            ))}
          </div>
          {(minLabel || maxLabel) && (
            <div className="mt-2 flex justify-between gap-4 text-xs text-muted-foreground">
              <span className="text-left">{minLabel}</span>
              <span className="text-right">{maxLabel}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** NPS workNps —— 整体居中，按钮自适应铺满，两端标签与 0/10 按钮左右对齐 */
export function AnswerNps({ props, value, onChange, error, index }: SharedProps) {
  const { t } = useLocale();
  const title = props.title as string | undefined;
  const required = props.required as boolean | undefined;
  const scaleValue = value.type === "scale" ? value.value : null;
  const nums = Array.from({ length: 11 }, (_, i) => i);

  const colorClass = (n: number) => {
    if (n <= 6) return "border-red-300 text-red-600 dark:text-red-300 hover:bg-red-500/15";
    if (n <= 8) return "border-yellow-300 text-yellow-600 dark:text-yellow-300 hover:bg-yellow-500/15";
    return "border-green-300 text-green-600 dark:text-green-300 hover:bg-green-500/15";
  };

  return (
    <div className="mb-5">
      <QuestionTitle title={title} required={required} index={index} error={error} />
      <div className="flex justify-center">
        <div className="w-full max-w-[560px]">
          <div className="flex gap-1 sm:gap-1.5">
            {nums.map((n) => (
              <button
                key={n}
                type="button"
                className={`${btnBase} h-9 flex-1 min-w-0 px-0 ${
                  scaleValue === n
                    ? "border-blue-500 bg-blue-500 text-white"
                    : colorClass(n)
                }`}
                onClick={() => onChange({ type: "scale", value: n })}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="mt-2 flex justify-between gap-4 text-xs text-muted-foreground">
            <span className="text-left">{t((m) => m.survey.npsMin)}</span>
            <span className="text-right">{t((m) => m.survey.npsMax)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 费力度 workEffort —— 与编辑端一致：左侧（小分值）= 费力，右侧（大分值）= 轻松 */
export function AnswerEffort({ props, value, onChange, error, index }: SharedProps) {
  const { t } = useLocale();
  const title = props.title as string | undefined;
  const required = props.required as boolean | undefined;
  const levels = (props.levels as number) || 5;
  const scaleValue = value.type === "scale" ? value.value : null;
  const nums = Array.from({ length: levels }, (_, i) => i + 1);

  return (
    <div className="mb-5">
      <QuestionTitle title={title} required={required} index={index} error={error} />
      <div className="flex items-center gap-1.5">
        {nums.map((n) => (
          <button
            key={n}
            type="button"
            className={`${btnBase} h-9 w-9 ${scaleValue === n ? btnSelected : btnUnselected}`}
            onClick={() => onChange({ type: "scale", value: n })}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-2">
        <Badge variant="outline" className="text-red-600 dark:text-red-300 border-red-200">{t((m) => m.survey.effortHard)}</Badge>
        <Badge variant="outline" className="text-green-600 dark:text-green-300 border-green-200">{t((m) => m.survey.effortEasy)}</Badge>
      </div>
    </div>
  );
}

/** 满意度 workSatisfaction —— 与编辑端一致：只展示表情/文字盒，文字说明用 tooltip 悬浮显示 */
const satisfactionEmojiSets: Record<number, string[]> = {
  3: ["😞", "😐", "😄"],
  5: ["😞", "😕", "😐", "🙂", "😄"],
  7: ["😞", "😕", "🙁", "😐", "🙂", "😊", "😄"],
};

export function AnswerSatisfaction({ props, value, onChange, error, index }: SharedProps) {
  const { t } = useLocale();
  const title = props.title as string | undefined;
  const required = props.required as boolean | undefined;
  const levels = (props.levels as number) || 5;
  const style = (props.style as "emoji" | "text") || "emoji";
  const scaleValue = value.type === "scale" ? value.value : null;
  const nums = Array.from({ length: levels }, (_, i) => i + 1);

  // 文字说明（tooltip 用），与编辑端共用同一组文案
  const textSets: Record<number, string[]> = {
    3: [t((m) => m.editor.satDissatisfied), t((m) => m.editor.satNeutral), t((m) => m.editor.satSatisfied)],
    5: [t((m) => m.editor.satVeryDissatisfied), t((m) => m.editor.satDissatisfied), t((m) => m.editor.satNeutral), t((m) => m.editor.satSatisfied), t((m) => m.editor.satVerySatisfied)],
    7: [t((m) => m.editor.satVeryDissatisfied), t((m) => m.editor.satDissatisfied), t((m) => m.editor.satSomewhatDissatisfied), t((m) => m.editor.satNeutral), t((m) => m.editor.satSomewhatSatisfied), t((m) => m.editor.satSatisfied), t((m) => m.editor.satVerySatisfied)],
  };
  const emojis = satisfactionEmojiSets[levels] || satisfactionEmojiSets[5];
  const labels = textSets[levels] || textSets[5];

  return (
    <div className="mb-5">
      <QuestionTitle title={title} required={required} index={index} error={error} />
      <TooltipProvider delayDuration={200}>
        <div className="flex justify-center gap-2 sm:gap-3 overflow-x-auto pb-1">
          {nums.map((n) => {
            const isSelected = scaleValue === n;
            return (
              <Tooltip key={n}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className={`flex size-12 shrink-0 items-center justify-center rounded-lg border cursor-pointer transition-all ${
                      style === "emoji" ? "text-2xl" : "text-xs font-medium px-3 w-auto min-w-12"
                    } ${
                      isSelected
                        ? "border-blue-500 bg-blue-500/15 ring-1 ring-blue-300"
                        : "border-border bg-background hover:border-blue-300 hover:bg-blue-500/15/50"
                    }`}
                    onClick={() => onChange({ type: "scale", value: n })}
                  >
                    {style === "emoji" ? emojis[n - 1] || "😐" : labels[n - 1] || n}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <span>{labels[n - 1] || ""}</span>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}

/** 评价/打分 workRating */
export function AnswerRating({ props, value, onChange, error, index }: SharedProps) {
  const title = props.title as string | undefined;
  const required = props.required as boolean | undefined;
  const max = (props.max as number) || 5;
  const iconType = (props.iconType as "star" | "heart" | "emoji") || "star";
  const scaleValue = value.type === "scale" ? value.value : null;
  const nums = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className="mb-5">
      <QuestionTitle title={title} required={required} index={index} error={error} />
      <div className="flex items-center justify-start gap-1">
        {nums.map((n) => {
          const isActive = (scaleValue ?? 0) >= n;
          return (
            <button
              key={n}
              type="button"
              className="cursor-pointer p-1 transition-transform hover:scale-110"
              onClick={() => onChange({ type: "scale", value: n })}
            >
              {iconType === "star" && (
                <Star
                  className={`size-7 ${isActive ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                />
              )}
              {iconType === "heart" && (
                <Heart
                  className={`size-7 ${isActive ? "fill-red-400 text-red-400" : "text-muted-foreground"}`}
                />
              )}
              {iconType === "emoji" && (
                <span className="text-2xl">{isActive ? "⭐" : "☆"}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
