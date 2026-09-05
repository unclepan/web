"use client";
import { FC } from "react";
import { X, CirclePlus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEditor } from "@/components/editor/store/EditorProvider";
import { useLocale } from "@/i18n/useLocale";
import WorkReactQuill from "../WorkReactQuill";
import { WorkSelectPropsType, WorkSelectDefaultProps } from "./interface";
import { nanoid } from "nanoid";

const Component: FC<WorkSelectPropsType & { feUuid?: string }> = (props) => {
  const { dispatch } = useEditor();
  const { t } = useLocale();
  const { title = "", options = [], placeholder = t((m) => m.editor.canvasPleaseSelect), feUuid = "" } = { ...WorkSelectDefaultProps, ...props };

  const updateProps = (newProps: Partial<WorkSelectPropsType>) => {
    if (!feUuid) return;
    dispatch({ type: "PUSH_PAST" });
    dispatch({ type: "CHANGE_COMPONENT_PROPS", payload: { feUuid, newProps } });
  };
  const handleTitle = (editorProp: string, delta: string) => {
    updateProps({ title: delta });
  };
  const handleText = (value: string, delta: string) => {
    updateProps({ options: options.map((o) => (o.value === value ? { ...o, text: delta } : o)) });
  };
  const add = () => updateProps({ options: [...options, { text: t((m) => m.editor.canvasOption), value: nanoid(5) }] });
  const remove = (value: string) => updateProps({ options: options.filter((o) => o.value !== value) });

  return (
    <div>
      <WorkReactQuill value={title} editorProp="title" feUuid={feUuid} onChange={handleTitle} />
      <div className="mt-2">
        <Select disabled>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.text}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mt-2 space-y-2 border-t border-dashed border-border pt-2">
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input bg-muted/40 text-muted-foreground">
              <ChevronDown size={14} />
            </div>
            <div className="flex-1">
              <WorkReactQuill
                value={opt.text}
                editorProp={opt.value}
                feUuid={feUuid}
                onChange={handleText}
                showHeader={false}
                showVideo={false}
                showImage={false}
                showLink={false}
                showAlign={false}
              />
            </div>
            {options.length > 2 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove(opt.value)}
                className="size-6 text-muted-foreground hover:text-red-500 shrink-0"
                data-no-drag="true"
              >
                <X size={14} />
              </Button>
            )}
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={add}>
          <CirclePlus />{t((m) => m.editor.canvasAddOption)}
        </Button>
      </div>
    </div>
  );
};
export default Component;
