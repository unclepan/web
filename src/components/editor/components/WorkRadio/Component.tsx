"use client";
import { FC } from "react";
import { X, CirclePlus} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEditor } from "@/components/editor/store/EditorProvider";
import { useLocale } from "@/i18n/useLocale";
import WorkReactQuill from "../WorkReactQuill";
import { WorkRadioPropsType, WorkRadioDefaultProps } from "./interface";
import { nanoid } from "nanoid";

const Component: FC<WorkRadioPropsType & { feUuid?: string }> = (props) => {
  const { dispatch } = useEditor();
  const { t } = useLocale();
  const { title = "", options = [], feUuid = "", row = 24 } = { ...WorkRadioDefaultProps, ...props };
  const gridCols =
    row === 24 ? "grid-cols-1" :
    row === 12 ? "grid-cols-2" :
    row === 8 ? "grid-cols-3" :
    "grid-cols-4";

  const updateProps = (newProps: Partial<WorkRadioPropsType>) => {
    if (!feUuid) return;
    dispatch({ type: "PUSH_PAST" });
    dispatch({ type: "CHANGE_COMPONENT_PROPS", payload: { feUuid, newProps } });
  };
  const handleTitle = (editorProp: string, delta: string) => {
    if (!feUuid) return;
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
      <RadioGroup className={`mt-2 ${gridCols}`}>
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center gap-3">
            <RadioGroupItem value={opt.value} id={`radio-${opt.value}`} />
            <Label htmlFor={`radio-${opt.value}`} className="sr-only">
              {opt.text}
            </Label>
            <div className="flex-1">
              <WorkReactQuill 
                value={opt.text} 
                editorProp={opt.value} 
                feUuid={feUuid} 
                onChange={handleText} 
                showHeader={false} 
                showVideo={false} 
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
      </RadioGroup>
      <div className="mt-2 border-t border-dashed border-border pt-2">
        <Button
          variant="outline" size="sm"
          onClick={add}
        >
          <CirclePlus />{t((m) => m.editor.canvasAddOption)}
        </Button>
      </div>
    </div>
  );
};
export default Component;
