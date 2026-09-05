"use client";

import { useLocale } from "@/i18n/useLocale";
import { format } from "@/i18n/locale-utils";
import type { AnswerValue } from "@/lib/survey-types";
import { DisplayTitle, DisplayParagraph, DisplayInfo } from "./answers/display";
import { AnswerInput, AnswerTextarea, AnswerBlanks } from "./answers/text";
import {
  AnswerRadio,
  AnswerCheckbox,
  AnswerSelect,
  AnswerImageRadio,
  AnswerImageCheckbox,
} from "./answers/choice";
import {
  AnswerScale,
  AnswerNps,
  AnswerEffort,
  AnswerSatisfaction,
  AnswerRating,
} from "./answers/scale";
import {
  AnswerRanking,
  AnswerFileUpload,
  AnswerCascader,
  AnswerDateTime,
  AnswerSignature,
  AnswerLocation,
  AnswerMaxDiff,
} from "./answers/advanced";
import {
  AnswerMatrixRadio,
  AnswerMatrixCheckbox,
  AnswerMatrixScale,
  AnswerMatrixScore,
  AnswerMatrixInput,
  AnswerDynamicTable,
} from "./answers/matrix";

type AnswerQuestionRendererProps = {
  type: string;
  props: Record<string, unknown>;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  error?: string;
  index: number;
};

/** 题型 → 答题组件 映射表 */
const ANSWER_COMPONENT_MAP: Record<
  string,
  (p: AnswerQuestionRendererProps) => React.ReactNode
> = {
  // 显示类（无需作答）
  workTitle: DisplayTitle,
  workParagraph: DisplayParagraph,
  workInfo: DisplayInfo,
  // 文本输入
  workInput: AnswerInput,
  workTextarea: AnswerTextarea,
  workBlanks: AnswerBlanks,
  // 选择类
  workRadio: AnswerRadio,
  workCheckbox: AnswerCheckbox,
  workSelect: AnswerSelect,
  workImageRadio: AnswerImageRadio,
  workImageCheckbox: AnswerImageCheckbox,
  // 量表评价
  workScale: AnswerScale,
  workNps: AnswerNps,
  workEffort: AnswerEffort,
  workSatisfaction: AnswerSatisfaction,
  workRating: AnswerRating,
  // 高级题型
  workRanking: AnswerRanking,
  workFileUpload: AnswerFileUpload,
  workCascader: AnswerCascader,
  workDateTime: AnswerDateTime,
  workSignature: AnswerSignature,
  workLocation: AnswerLocation,
  workMaxDiff: AnswerMaxDiff,
  // 矩阵类
  workMatrixRadio: AnswerMatrixRadio,
  workMatrixCheckbox: AnswerMatrixCheckbox,
  workMatrixScale: AnswerMatrixScale,
  workMatrixScore: AnswerMatrixScore,
  workMatrixInput: AnswerMatrixInput,
  workDynamicTable: AnswerDynamicTable,
};

/**
 * 答题端题目渲染调度器
 * 根据题型 type 分发到 answers/ 目录下对应的子组件
 */
export default function AnswerQuestionRenderer(props: AnswerQuestionRendererProps) {
  const { type } = props;
  const { t } = useLocale();
  const Component = ANSWER_COMPONENT_MAP[type];

  if (Component) {
    return <>{Component(props)}</>;
  }

  // 未知题型兜底
  return (
    <div className="mb-5 rounded-md border border-amber-200 bg-amber-500/15 px-3 py-2 text-xs text-amber-600 dark:text-amber-300">
      {format(t((m) => m.survey.unknownQuestionType), { type })}
    </div>
  );
}
