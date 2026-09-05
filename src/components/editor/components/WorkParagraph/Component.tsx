"use client";
import { FC } from "react";
import { useEditor } from "@/components/editor/store/EditorProvider";
import WorkReactQuill from "../WorkReactQuill";
import { WorkParagraphPropsType, WorkParagraphDefaultProps } from "./interface";

const Component: FC<WorkParagraphPropsType & { feUuid?: string }> = (props) => {
  const { dispatch } = useEditor();
  const { text = "", feUuid = "" } = { ...WorkParagraphDefaultProps, ...props };
  const handleInput = (editorProp: string, delta: string) => {
    if (!feUuid) return;
    dispatch({ type: "PUSH_PAST" });
    dispatch({ type: "CHANGE_COMPONENT_PROPS", payload: { feUuid, newProps: { text: delta } } });
  };
  return <WorkReactQuill value={text} editorProp="text" feUuid={feUuid} onChange={handleInput} />;
};
export default Component;
