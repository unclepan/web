"use client";
import { FC } from "react";
import { useEditor } from "@/components/editor/store/EditorProvider";
import WorkReactQuill from "../WorkReactQuill";
import { Input } from "@/components/ui/input";
import { WorkInputPropsType, WorkInputDefaultProps } from "./interface";

const Component: FC<WorkInputPropsType & { feUuid?: string }> = (props) => {
  const { dispatch } = useEditor();
  const { title = "", placeholder, feUuid = "" } = { ...WorkInputDefaultProps, ...props };
  const handleChange = (editorProp: string, delta: string) => {
    if (!feUuid) return;
    dispatch({ type: "PUSH_PAST" });
    dispatch({ type: "CHANGE_COMPONENT_PROPS", payload: { feUuid, newProps: { title: delta } } });
  };
  return (
    <div>
      <WorkReactQuill value={title} editorProp="title" feUuid={feUuid} onChange={handleChange} showBlanks={false} />
      <div className="px-1 mt-1">
        <Input type="text" placeholder={placeholder} readOnly className="pointer-events-none" />
      </div>
    </div>
  );
};
export default Component;
