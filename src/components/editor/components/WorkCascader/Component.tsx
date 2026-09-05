"use client";
import { FC } from "react";
import { X, CirclePlus, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEditor } from "@/components/editor/store/EditorProvider";
import { useLocale } from "@/i18n/useLocale";
import { format } from "@/i18n/locale-utils";
import WorkReactQuill from "../WorkReactQuill";
import { WorkCascaderPropsType, WorkCascaderDefaultProps, CascaderLevel } from "./interface";

const Component: FC<WorkCascaderPropsType & { feUuid?: string }> = (props) => {
  const { dispatch } = useEditor();
  const { t } = useLocale();
  const { title = "", levels = [], feUuid = "" } = { ...WorkCascaderDefaultProps, ...props };

  const updateProps = (newProps: Partial<WorkCascaderPropsType>) => {
    if (!feUuid) return;
    dispatch({ type: "PUSH_PAST" });
    dispatch({ type: "CHANGE_COMPONENT_PROPS", payload: { feUuid, newProps } });
  };
  const handleTitle = (editorProp: string, delta: string) => {
    updateProps({ title: delta });
  };

  const updateLevel = (idx: number, patch: Partial<CascaderLevel>) => {
    updateProps({ levels: levels.map((l, i) => (i === idx ? { ...l, ...patch } : l)) });
  };
  const addLevel = () => {
    updateProps({ levels: [...levels, { name: format(t((m) => m.editor.canvasCascaderLevelN), { n: levels.length + 1 }), options: [format(t((m) => m.editor.canvasOptionN), { n: 1 }), format(t((m) => m.editor.canvasOptionN), { n: 2 })] }] });
  };
  const removeLevel = (idx: number) => {
    if (levels.length <= 1) return;
    updateProps({ levels: levels.filter((_, i) => i !== idx) });
  };
  const addOption = (idx: number) => {
    updateProps({ levels: levels.map((l, i) => (i === idx ? { ...l, options: [...l.options, format(t((m) => m.editor.canvasOptionN), { n: l.options.length + 1 })] } : l)) });
  };
  const removeOption = (idx: number, optIdx: number) => {
    updateProps({ levels: levels.map((l, i) => (i === idx ? { ...l, options: l.options.filter((_, j) => j !== optIdx) } : l)) });
  };
  const updateOption = (idx: number, optIdx: number, value: string) => {
    updateProps({ levels: levels.map((l, i) => (i === idx ? { ...l, options: l.options.map((o, j) => (j === optIdx ? value : o)) } : l)) });
  };

  return (
    <div>
      <WorkReactQuill value={title} editorProp="title" feUuid={feUuid} onChange={handleTitle} showVideo={false} />
      {/* 级联 Select 占位 */}
      <div className="mt-2 flex gap-2">
        {levels.map((level, idx) => (
          <Select key={idx} disabled>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={`${t((m) => m.editor.canvasPleaseSelect)} ${level.name}`} />
            </SelectTrigger>
            <SelectContent>
              {level.options.map((opt, i) => (
                <SelectItem key={i} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>
      {/* 级别编辑 */}
      <div className="mt-3 space-y-3 border-t border-dashed border-border pt-3">
        {levels.map((level, idx) => (
          <div key={idx} className="rounded-lg border border-border p-2 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={level.name}
                onChange={(e) => updateLevel(idx, { name: e.target.value })}
                className="h-7 text-sm font-medium"
              />
              {levels.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLevel(idx)}
                  className="size-7 text-muted-foreground hover:text-red-500 shrink-0"
                >
                  <Minus size={14} />
                </Button>
              )}
            </div>
            <div className="space-y-1 pl-2">
              {level.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-1">
                  <Input
                    value={opt}
                    onChange={(e) => updateOption(idx, optIdx, e.target.value)}
                    className="h-6 text-xs"
                  />
                  {level.options.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(idx, optIdx)}
                      className="size-6 text-muted-foreground hover:text-red-500 shrink-0"
                    >
                      <X size={12} />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => addOption(idx)} className="h-6 text-xs">
                <Plus size={12} />{t((m) => m.editor.canvasAddOption)}
              </Button>
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addLevel}>
          <CirclePlus />{t((m) => m.editor.canvasAddLevel)}
        </Button>
      </div>
    </div>
  );
};
export default Component;
