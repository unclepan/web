"use client";

import { nanoid } from "nanoid";
import { useLocale } from "@/i18n/useLocale";
import type { TranslateFn } from "@/i18n/useLocale";
import { useGetComponentInfo, useEditor } from "@/components/editor/store/EditorProvider";
import { MAX_COMPONENTS_PER_PAGE, isPageFull } from "@/components/editor/store/constants";
import { componentConfGroup, type ComponentConfType } from "../components";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { format } from "@/i18n/locale-utils";

function getComponentTitle(type: string, t: TranslateFn): string {
  switch (type) {
    case "workInfo": return t((m) => m.editor.ctWorkInfo);
    case "workTitle": return t((m) => m.editor.ctWorkTitle);
    case "workParagraph": return t((m) => m.editor.ctWorkParagraph);
    case "workInput": return t((m) => m.editor.ctWorkInput);
    case "workTextarea": return t((m) => m.editor.ctWorkTextarea);
    case "workBlanks": return t((m) => m.editor.ctWorkBlanks);
    case "workRadio": return t((m) => m.editor.ctWorkRadio);
    case "workCheckbox": return t((m) => m.editor.ctWorkCheckbox);
    case "workSelect": return t((m) => m.editor.ctWorkSelect);
    case "workImageRadio": return t((m) => m.editor.ctWorkImageRadio);
    case "workImageCheckbox": return t((m) => m.editor.ctWorkImageCheckbox);
    case "workScale": return t((m) => m.editor.ctWorkScale);
    case "workNps": return t((m) => m.editor.ctWorkNps);
    case "workEffort": return t((m) => m.editor.ctWorkEffort);
    case "workSatisfaction": return t((m) => m.editor.ctWorkSatisfaction);
    case "workRating": return t((m) => m.editor.ctWorkRating);
    case "workRanking": return t((m) => m.editor.ctWorkRanking);
    case "workFileUpload": return t((m) => m.editor.ctWorkFileUpload);
    case "workCascader": return t((m) => m.editor.ctWorkCascader);
    case "workDateTime": return t((m) => m.editor.ctWorkDateTime);
    case "workSignature": return t((m) => m.editor.ctWorkSignature);
    case "workLocation": return t((m) => m.editor.ctWorkLocation);
    case "workMaxDiff": return t((m) => m.editor.ctWorkMaxDiff);
    case "workMatrixRadio": return t((m) => m.editor.ctWorkMatrixRadio);
    case "workMatrixCheckbox": return t((m) => m.editor.ctWorkMatrixCheckbox);
    case "workMatrixScale": return t((m) => m.editor.ctWorkMatrixScale);
    case "workMatrixScore": return t((m) => m.editor.ctWorkMatrixScore);
    case "workMatrixInput": return t((m) => m.editor.ctWorkMatrixInput);
    case "workDynamicTable": return t((m) => m.editor.ctWorkDynamicTable);
    default: return type;
  }
}

function getComponentDescribe(type: string, t: TranslateFn): string {
  switch (type) {
    case "workInfo": return t((m) => m.editor.cdWorkInfo);
    case "workTitle": return t((m) => m.editor.cdWorkTitle);
    case "workParagraph": return t((m) => m.editor.cdWorkParagraph);
    case "workInput": return t((m) => m.editor.cdWorkInput);
    case "workTextarea": return t((m) => m.editor.cdWorkTextarea);
    case "workBlanks": return t((m) => m.editor.cdWorkBlanks);
    case "workRadio": return t((m) => m.editor.cdWorkRadio);
    case "workCheckbox": return t((m) => m.editor.cdWorkCheckbox);
    case "workSelect": return t((m) => m.editor.cdWorkSelect);
    case "workImageRadio": return t((m) => m.editor.cdWorkImageRadio);
    case "workImageCheckbox": return t((m) => m.editor.cdWorkImageCheckbox);
    case "workScale": return t((m) => m.editor.cdWorkScale);
    case "workNps": return t((m) => m.editor.cdWorkNps);
    case "workEffort": return t((m) => m.editor.cdWorkEffort);
    case "workSatisfaction": return t((m) => m.editor.cdWorkSatisfaction);
    case "workRating": return t((m) => m.editor.cdWorkRating);
    case "workRanking": return t((m) => m.editor.cdWorkRanking);
    case "workFileUpload": return t((m) => m.editor.cdWorkFileUpload);
    case "workCascader": return t((m) => m.editor.cdWorkCascader);
    case "workDateTime": return t((m) => m.editor.cdWorkDateTime);
    case "workSignature": return t((m) => m.editor.cdWorkSignature);
    case "workLocation": return t((m) => m.editor.cdWorkLocation);
    case "workMaxDiff": return t((m) => m.editor.cdWorkMaxDiff);
    case "workMatrixRadio": return t((m) => m.editor.cdWorkMatrixRadio);
    case "workMatrixCheckbox": return t((m) => m.editor.cdWorkMatrixCheckbox);
    case "workMatrixScale": return t((m) => m.editor.cdWorkMatrixScale);
    case "workMatrixScore": return t((m) => m.editor.cdWorkMatrixScore);
    case "workMatrixInput": return t((m) => m.editor.cdWorkMatrixInput);
    case "workDynamicTable": return t((m) => m.editor.cdWorkDynamicTable);
    default: return "";
  }
}

function ComponentItem({ c, t }: { c: ComponentConfType; t: TranslateFn }) {
  const { dispatch } = useEditor();
  const { currentPage, componentList } = useGetComponentInfo();
  const title = getComponentTitle(c.type, t);
  const describe = getComponentDescribe(c.type, t);
  // 每页最多 MAX_COMPONENTS_PER_PAGE 个组件（不区分组件类型），超限禁止新增
  const pageFull = currentPage !== -1 && isPageFull(componentList, currentPage);
  const disabled = currentPage === -1 || pageFull;
  const handleClick = () => {
    if (disabled) {
      if (pageFull) toast.error(format(t((m) => m.editor.maxComponentsPerPageReached), { max: MAX_COMPONENTS_PER_PAGE }));
      return;
    }
    dispatch({ type: "PUSH_PAST" });
    dispatch({ type: "ADD_COMPONENT", payload: { feUuid: nanoid(), title, type: c.type, props: c.defaultProps, page: currentPage, isHidden: false, isLocked: false } });
    toast.success(format(t((m) => m.editor.addedComponent), { title }));
  };
  const btn = (
    <Button
      variant="outline"
      disabled={disabled}
      onClick={handleClick}
      className="flex items-center gap-2 justify-start"
    >
      <c.Icon />
      {title}
    </Button>
  );
  const tip = pageFull ? format(t((m) => m.editor.maxComponentsPerPageReached), { max: MAX_COMPONENTS_PER_PAGE }) : describe;
  return tip ? (
    <Tooltip>
      <TooltipTrigger asChild>{btn}</TooltipTrigger>
      <TooltipContent>{tip}</TooltipContent>
    </Tooltip>
  ) : (
    btn
  );
}

function getGroupName(groupId: string, t: TranslateFn): string {
  switch (groupId) {
    case "textGroup": return t((m) => m.editor.groupTextDisplay);
    case "inputGroup": return t((m) => m.editor.groupUserInput);
    case "chooseGroup": return t((m) => m.editor.groupUserChoice);
    case "scaleGroup": return t((m) => m.editor.groupScale);
    case "advancedGroup": return t((m) => m.editor.groupAdvanced);
    case "matrixGroup": return t((m) => m.editor.groupMatrix);
    default: return groupId;
  }
}

export default function ComponentLib() {
  const { t } = useLocale();
  return (
    <div className="space-y-4">
      {componentConfGroup.map((group, i) => (
        <div key={group.groupId}>
          <h3 className={`text-sm font-bold text-foreground ${i > 0 ? "mt-5" : ""}`}>{getGroupName(group.groupId, t)}</h3>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {group.components.map((c) => <ComponentItem key={c.type} c={c} t={t} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
