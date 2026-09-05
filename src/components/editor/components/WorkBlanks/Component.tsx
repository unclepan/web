"use client";
import { FC } from "react";
import { useEditor } from "@/components/editor/store/EditorProvider";
import WorkReactQuill from "../WorkReactQuill";
import { WorkBlanksPropsType, WorkBlanksDefaultProps } from "./interface";

const Component: FC<WorkBlanksPropsType & { feUuid?: string }> = (props) => {
  const { dispatch } = useEditor();
  const { title = "", feUuid = "" } = { ...WorkBlanksDefaultProps, ...props };

  const updateProps = (newProps: Partial<WorkBlanksPropsType>) => {
    if (!feUuid) return;
    dispatch({ type: "PUSH_PAST" });
    dispatch({ type: "CHANGE_COMPONENT_PROPS", payload: { feUuid, newProps } });
  };
  const handleTitle = (editorProp: string, delta: string) => {
    updateProps({ title: delta });
  };

  return (
    <div>
      <WorkReactQuill
        value={title}
        editorProp="title"
        feUuid={feUuid}
        onChange={handleTitle}
        showBlanks
        showVideo={false}
      />
    </div>
  );
};
export default Component;
