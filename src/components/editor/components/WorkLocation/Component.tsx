"use client";
import { FC } from "react";
import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEditor } from "@/components/editor/store/EditorProvider";
import { useLocale } from "@/i18n/useLocale";
import WorkReactQuill from "../WorkReactQuill";
import { WorkLocationPropsType, WorkLocationDefaultProps } from "./interface";

const Component: FC<WorkLocationPropsType & { feUuid?: string }> = (props) => {
  const { dispatch } = useEditor();
  const { t } = useLocale();
  const { title = "", feUuid = "" } = { ...WorkLocationDefaultProps, ...props };

  const updateProps = (newProps: Partial<WorkLocationPropsType>) => {
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
      <div className="mt-2">
        <Card className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-muted-foreground/30 bg-muted/30 py-8">
          <MapPin className="size-8 text-muted-foreground/50" />
          <span className="text-sm text-muted-foreground">{t((m) => m.editor.canvasGetLocation)}</span>
        </Card>
      </div>
    </div>
  );
};
export default Component;
