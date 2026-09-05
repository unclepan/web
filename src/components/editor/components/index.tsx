import type { FC } from "react";
import WorkInfoConf from "./WorkInfo";
import WorkTitleConf from "./WorkTitle";
import WorkParagraphConf from "./WorkParagraph";
import WorkInputConf from "./WorkInput";
import WorkTextareaConf from "./WorkTextarea";
import WorkRadioConf from "./WorkRadio";
import WorkCheckboxConf from "./WorkCheckbox";
// 选择类
import WorkSelectConf from "./WorkSelect";
import WorkImageRadioConf from "./WorkImageRadio";
import WorkImageCheckboxConf from "./WorkImageCheckbox";
// 文本输入类
import WorkBlanksConf from "./WorkBlanks";
// 量表评价类
import WorkScaleConf from "./WorkScale";
import WorkNpsConf from "./WorkNps";
import WorkEffortConf from "./WorkEffort";
import WorkSatisfactionConf from "./WorkSatisfaction";
import WorkRatingConf from "./WorkRating";
// 高级题型
import WorkRankingConf from "./WorkRanking";
import WorkFileUploadConf from "./WorkFileUpload";
import WorkCascaderConf from "./WorkCascader";
import WorkDateTimeConf from "./WorkDateTime";
import WorkSignatureConf from "./WorkSignature";
import WorkLocationConf from "./WorkLocation";
import WorkMaxDiffConf from "./WorkMaxDiff";
// 矩阵类
import WorkMatrixRadioConf from "./WorkMatrixRadio";
import WorkMatrixCheckboxConf from "./WorkMatrixCheckbox";
import WorkMatrixScaleConf from "./WorkMatrixScale";
import WorkMatrixScoreConf from "./WorkMatrixScore";
import WorkMatrixInputConf from "./WorkMatrixInput";
import WorkDynamicTableConf from "./WorkDynamicTable";

export type ComponentConfType = {
  title: string;
  type: string;
  describe: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: FC<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PropComponent: FC<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultProps: any;
  Icon: FC;
};

const componentConfList: ComponentConfType[] = [
  // 文本显示
  WorkInfoConf, WorkTitleConf, WorkParagraphConf,
  // 用户输入
  WorkInputConf, WorkTextareaConf, WorkBlanksConf,
  // 用户选择
  WorkRadioConf, WorkCheckboxConf, WorkSelectConf, WorkImageRadioConf, WorkImageCheckboxConf,
  // 量表评价
  WorkScaleConf, WorkNpsConf, WorkEffortConf, WorkSatisfactionConf, WorkRatingConf,
  // 高级题型
  WorkRankingConf, WorkFileUploadConf, WorkCascaderConf, WorkDateTimeConf, WorkSignatureConf, WorkLocationConf, WorkMaxDiffConf,
  // 矩阵类
  WorkMatrixRadioConf, WorkMatrixCheckboxConf, WorkMatrixScaleConf, WorkMatrixScoreConf, WorkMatrixInputConf, WorkDynamicTableConf,
];

export const componentConfGroup = [
  { groupId: "textGroup", groupName: "", groupKey: "groupTextDisplay", components: [WorkInfoConf, WorkTitleConf, WorkParagraphConf] },
  { groupId: "inputGroup", groupName: "", groupKey: "groupUserInput", components: [WorkInputConf, WorkTextareaConf, WorkBlanksConf] },
  { groupId: "chooseGroup", groupName: "", groupKey: "groupUserChoice", components: [WorkRadioConf, WorkCheckboxConf, WorkSelectConf, WorkImageRadioConf, WorkImageCheckboxConf] },
  { groupId: "scaleGroup", groupName: "", groupKey: "groupScale", components: [WorkScaleConf, WorkNpsConf, WorkEffortConf, WorkSatisfactionConf, WorkRatingConf] },
  { groupId: "advancedGroup", groupName: "", groupKey: "groupAdvanced", components: [WorkRankingConf, WorkFileUploadConf, WorkCascaderConf, WorkDateTimeConf, WorkSignatureConf, WorkLocationConf, WorkMaxDiffConf] },
  { groupId: "matrixGroup", groupName: "", groupKey: "groupMatrix", components: [WorkMatrixRadioConf, WorkMatrixCheckboxConf, WorkMatrixScaleConf, WorkMatrixScoreConf, WorkMatrixInputConf, WorkDynamicTableConf] },
];

export function getComponentConfByType(type: string) {
  return componentConfList.find((c) => c.type === type);
}
