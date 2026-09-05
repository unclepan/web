"use client";
import { FC } from "react";
import { useEditor } from "@/components/editor/store/EditorProvider";
import WorkReactQuill from "../WorkReactQuill";
import { WorkScalePropsType, WorkScaleDefaultProps } from "./interface";

const Component: FC<WorkScalePropsType & { feUuid?: string }> = (props) => {
  const { dispatch } = useEditor();
  const { title = "", min = 1, max = 5, minLabel = "", maxLabel = "", feUuid = "" } = { ...WorkScaleDefaultProps, ...props };

  const updateProps = (newProps: Partial<WorkScalePropsType>) => {
    if (!feUuid) return;
    dispatch({ type: "PUSH_PAST" });
    dispatch({ type: "CHANGE_COMPONENT_PROPS", payload: { feUuid, newProps } });
  };
  const handleTitle = (editorProp: string, delta: string) => {
    updateProps({ title: delta });
  };

  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div>
      <WorkReactQuill value={title} editorProp="title" feUuid={feUuid} onChange={handleTitle} showVideo={false} />
      {/* 与答题端一致：按钮行居中，两端标签在按钮行下方与最小/最大值按钮对齐 */}
      <div className="mt-4 overflow-x-auto pb-1">
        <div className="mx-auto w-max">
          <div className="flex gap-1.5">
            {numbers.map((n) => (
              <div
                key={n}
                className="flex size-9 shrink-0 items-center justify-center rounded-md border border-input text-sm font-medium cursor-pointer hover:border-primary hover:bg-primary/5"
              >
                {n}
              </div>
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
};
export default Component;
