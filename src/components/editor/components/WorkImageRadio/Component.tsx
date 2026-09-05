"use client";
import { FC } from "react";
import { X, CirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEditor } from "@/components/editor/store/EditorProvider";
import { useLocale } from "@/i18n/useLocale";
import WorkReactQuill from "../WorkReactQuill";
import ImageOptionUploader from "../common/ImageOptionUploader";
import { WorkImageRadioPropsType, WorkImageRadioDefaultProps } from "./interface";
import { nanoid } from "nanoid";

const Component: FC<WorkImageRadioPropsType & { feUuid?: string }> = (props) => {
  const { dispatch } = useEditor();
  const { t } = useLocale();
  const { title = "", options = [], feUuid = "", row = 12 } = { ...WorkImageRadioDefaultProps, ...props };
  const gridCols =
    row === 24 ? "grid-cols-1" :
    row === 12 ? "grid-cols-2" :
    row === 8 ? "grid-cols-3" :
    "grid-cols-4";

  const updateProps = (newProps: Partial<WorkImageRadioPropsType>) => {
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
  const setImage = (value: string, url: string) => {
    updateProps({ options: options.map((o) => (o.value === value ? { ...o, image: url } : o)) });
  };
  const add = () => updateProps({ options: [...options, { text: t((m) => m.editor.canvasOption), value: nanoid(5), image: "" }] });
  const remove = (value: string) => updateProps({ options: options.filter((o) => o.value !== value) });

  return (
    <div>
      <WorkReactQuill value={title} editorProp="title" feUuid={feUuid} onChange={handleTitle} />
      <RadioGroup className={`mt-2 grid ${gridCols} gap-2`}>
        {options.map((opt) => (
          <div key={opt.value} className="relative group">
            <Card className="gap-0 p-0">
              <ImageOptionUploader image={opt.image} onUploaded={(url) => setImage(opt.value, url)} />
              <div className="p-2">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value={opt.value} id={`img-radio-${opt.value}`} />
                  <div className="flex-1 min-w-0">
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
                </div>
              </div>
            </Card>
            {options.length > 2 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove(opt.value)}
                className="absolute top-1 right-1 size-6 text-muted-foreground hover:text-red-500 z-10"
                data-no-drag="true"
              >
                <X size={14} />
              </Button>
            )}
          </div>
        ))}
      </RadioGroup>
      <div className="mt-2 border-t border-dashed border-border pt-2">
        <Button variant="outline" size="sm" onClick={add}>
          <CirclePlus />{t((m) => m.editor.canvasAddOption)}
        </Button>
      </div>
    </div>
  );
};
export default Component;
