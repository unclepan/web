"use client";
import { FC } from "react";
import { X, CirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEditor } from "@/components/editor/store/EditorProvider";
import { useLocale } from "@/i18n/useLocale";
import WorkReactQuill from "../WorkReactQuill";
import { WorkMaxDiffPropsType, WorkMaxDiffDefaultProps } from "./interface";
import { nanoid } from "nanoid";

const Component: FC<WorkMaxDiffPropsType & { feUuid?: string }> = (props) => {
  const { dispatch } = useEditor();
  const { t } = useLocale();
  const { title = "", options = [], feUuid = "" } = { ...WorkMaxDiffDefaultProps, ...props };

  const updateProps = (newProps: Partial<WorkMaxDiffPropsType>) => {
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
      <WorkReactQuill value={title} editorProp="title" feUuid={feUuid} onChange={handleTitle} showVideo={false} />
      {/* 最重要 / 最不重要 选择器 */}
      <div className="mt-2 grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{t((m) => m.editor.canvasMostImportant)}</label>
          <Select disabled>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t((m) => m.editor.canvasPleaseSelect)} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.text}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{t((m) => m.editor.canvasLeastImportant)}</label>
          <Select disabled>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t((m) => m.editor.canvasPleaseSelect)} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.text}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* 选项编辑 */}
      <div className="mt-3 space-y-2 border-t border-dashed border-border pt-2">
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center gap-3">
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
