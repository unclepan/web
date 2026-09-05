"use client";
import { FC } from "react";
import { useEditor } from "@/components/editor/store/EditorProvider";
import { useLocale } from "@/i18n/useLocale";
import WorkReactQuill from "../WorkReactQuill";
import { WorkNpsPropsType, WorkNpsDefaultProps } from "./interface";

const Component: FC<WorkNpsPropsType & { feUuid?: string }> = (props) => {
  const { dispatch } = useEditor();
  const { t } = useLocale();
  const { title = "", feUuid = "" } = { ...WorkNpsDefaultProps, ...props };

  const updateProps = (newProps: Partial<WorkNpsPropsType>) => {
    if (!feUuid) return;
    dispatch({ type: "PUSH_PAST" });
    dispatch({ type: "CHANGE_COMPONENT_PROPS", payload: { feUuid, newProps } });
  };
  const handleTitle = (editorProp: string, delta: string) => {
    updateProps({ title: delta });
  };

  const getSegmentClass = (n: number) => {
    if (n <= 6) return "border-red-400 text-red-500 hover:border-red-500 hover:bg-red-500/15";
    if (n <= 8) return "border-yellow-400 text-yellow-500 hover:border-yellow-500 hover:bg-yellow-500/15";
    return "border-green-400 text-green-500 hover:border-green-500 hover:bg-green-500/15";
  };

  return (
    <div>
      <WorkReactQuill value={title} editorProp="title" feUuid={feUuid} onChange={handleTitle} showVideo={false} />
      <div className="mt-4 flex justify-center gap-1">
        {Array.from({ length: 11 }, (_, i) => i).map((n) => (
          <div
            key={n}
            className={`flex size-9 items-center justify-center rounded-lg border bg-background text-sm font-medium cursor-pointer ${getSegmentClass(n)}`}
          >
            {n}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{t((m) => m.editor.canvasExtremelyUnlikely)}</span>
        <span>{t((m) => m.editor.canvasExtremelyLikely)}</span>
      </div>
    </div>
  );
};
export default Component;
