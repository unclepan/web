"use client";

import { FC } from "react";
import { useEditor } from "@/components/editor/store/EditorProvider";
import WorkReactQuill from "../WorkReactQuill";
import { WorkInfoPropsType, WorkInfoDefaultProps } from "./interface";

const Component: FC<WorkInfoPropsType & { feUuid?: string }> = (props) => {
  const { dispatch } = useEditor();
  const { title = "", desc = "", feUuid = "" } = { ...WorkInfoDefaultProps, ...props };

  const handleTitle = (editorProp: string, delta: string) => {
    if (!feUuid) return;
    dispatch({ type: "PUSH_PAST" });
    dispatch({ type: "CHANGE_COMPONENT_PROPS", payload: { feUuid, newProps: { title: delta } } });
  };
  const handleDesc = (editorProp: string, delta: string) => {
    if (!feUuid) return;
    dispatch({ type: "PUSH_PAST" });
    dispatch({ type: "CHANGE_COMPONENT_PROPS", payload: { feUuid, newProps: { desc: delta } } });
  };

  return (
    <div>
      <WorkReactQuill value={title} editorProp="title" feUuid={feUuid} onChange={handleTitle} />
      <WorkReactQuill value={desc} editorProp="desc" feUuid={feUuid} onChange={handleDesc}  />
    </div>
  );
};

export default Component;
