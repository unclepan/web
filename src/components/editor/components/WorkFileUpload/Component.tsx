"use client";
import { FC } from "react";
import { Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEditor } from "@/components/editor/store/EditorProvider";
import { useLocale } from "@/i18n/useLocale";
import { format } from "@/i18n/locale-utils";
import WorkReactQuill from "../WorkReactQuill";
import { WorkFileUploadPropsType, WorkFileUploadDefaultProps } from "./interface";

const Component: FC<WorkFileUploadPropsType & { feUuid?: string }> = (props) => {
  const { dispatch } = useEditor();
  const { t } = useLocale();
  const { title = "", maxFiles = 1, accept = "image/*", maxSize = 10, feUuid = "" } = { ...WorkFileUploadDefaultProps, ...props };

  const updateProps = (newProps: Partial<WorkFileUploadPropsType>) => {
    if (!feUuid) return;
    dispatch({ type: "PUSH_PAST" });
    dispatch({ type: "CHANGE_COMPONENT_PROPS", payload: { feUuid, newProps } });
  };
  const handleTitle = (editorProp: string, delta: string) => {
    updateProps({ title: delta });
  };

  const hintText = accept === "image/*"
    ? format(t((m) => m.editor.canvasUploadImageHint), { maxFiles, maxSize })
    : format(t((m) => m.editor.canvasUploadFileHint), { maxFiles, maxSize });

  return (
    <div>
      <WorkReactQuill value={title} editorProp="title" feUuid={feUuid} onChange={handleTitle} showVideo={false} />
      <div className="mt-2">
        <Card className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-muted-foreground/30 bg-muted/30 py-8">
          <Upload className="size-8 text-muted-foreground/50" />
          <span className="text-sm font-medium text-muted-foreground">{t((m) => m.editor.canvasUploadHint)}</span>
          <span className="text-xs text-muted-foreground/70">{hintText}</span>
        </Card>
      </div>
    </div>
  );
};
export default Component;
