"use client";
import { FC } from "react";
import { useEditor } from "@/components/editor/store/EditorProvider";
import { useLocale } from "@/i18n/useLocale";
import WorkReactQuill from "../WorkReactQuill";
import { WorkEffortPropsType, WorkEffortDefaultProps } from "./interface";

const Component: FC<WorkEffortPropsType & { feUuid?: string }> = (props) => {
  const { dispatch } = useEditor();
  const { t } = useLocale();
  const { title = "", levels = 5, feUuid = "" } = { ...WorkEffortDefaultProps, ...props };

  const updateProps = (newProps: Partial<WorkEffortPropsType>) => {
    if (!feUuid) return;
    dispatch({ type: "PUSH_PAST" });
    dispatch({ type: "CHANGE_COMPONENT_PROPS", payload: { feUuid, newProps } });
  };
  const handleTitle = (editorProp: string, delta: string) => {
    updateProps({ title: delta });
  };

  return (
    <div>
      <WorkReactQuill value={title} editorProp="title" feUuid={feUuid} onChange={handleTitle} showVideo={false} />
      <div className="mt-4 flex justify-center gap-1.5">
        {Array.from({ length: levels }, (_, i) => i + 1).map((n) => (
          <div
            key={n}
            className="flex size-9 items-center justify-center rounded-lg border border-input bg-background text-sm font-medium cursor-pointer hover:border-primary hover:bg-primary/5"
          >
            {n}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{t((m) => m.editor.canvasVeryDifficult)}</span>
        <span>{t((m) => m.editor.canvasVeryEasy)}</span>
      </div>
    </div>
  );
};
export default Component;
