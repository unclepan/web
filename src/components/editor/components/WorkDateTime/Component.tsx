"use client";
import { FC } from "react";
import { Calendar, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEditor } from "@/components/editor/store/EditorProvider";
import { useLocale } from "@/i18n/useLocale";
import WorkReactQuill from "../WorkReactQuill";
import { WorkDateTimePropsType, WorkDateTimeDefaultProps } from "./interface";

const Component: FC<WorkDateTimePropsType & { feUuid?: string }> = (props) => {
  const { dispatch } = useEditor();
  const { t } = useLocale();
  const { title = "", mode = "date", feUuid = "" } = { ...WorkDateTimeDefaultProps, ...props };

  const updateProps = (newProps: Partial<WorkDateTimePropsType>) => {
    if (!feUuid) return;
    dispatch({ type: "PUSH_PAST" });
    dispatch({ type: "CHANGE_COMPONENT_PROPS", payload: { feUuid, newProps } });
  };
  const handleTitle = (editorProp: string, delta: string) => {
    updateProps({ title: delta });
  };

  const placeholder = mode === "time" ? t((m) => m.editor.canvasSelectTime) : mode === "datetime" ? t((m) => m.editor.canvasSelectDateTime) : t((m) => m.editor.canvasSelectDate);
  const Icon = mode === "time" ? Clock : Calendar;

  return (
    <div>
      <WorkReactQuill value={title} editorProp="title" feUuid={feUuid} onChange={handleTitle} showVideo={false} />
      <div className="mt-2 relative">
        <Input disabled placeholder={placeholder} className="pr-9" />
        <Icon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      </div>
    </div>
  );
};
export default Component;
