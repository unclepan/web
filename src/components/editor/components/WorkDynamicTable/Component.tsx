"use client";
import { FC } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useEditor } from "@/components/editor/store/EditorProvider";
import { useLocale } from "@/i18n/useLocale";
import { format } from "@/i18n/locale-utils";
import WorkReactQuill from "../WorkReactQuill";
import { WorkDynamicTablePropsType, WorkDynamicTableDefaultProps } from "./interface";
import { nanoid } from "nanoid";

const Component: FC<WorkDynamicTablePropsType & { feUuid?: string }> = (props) => {
  const { dispatch } = useEditor();
  const { t } = useLocale();
  const { title = "", columns = [], minRows = 1, feUuid = "" } = { ...WorkDynamicTableDefaultProps, ...props };

  const updateProps = (newProps: Partial<WorkDynamicTablePropsType>) => {
    if (!feUuid) return;
    dispatch({ type: "PUSH_PAST" });
    dispatch({ type: "CHANGE_COMPONENT_PROPS", payload: { feUuid, newProps } });
  };
  const handleTitle = (editorProp: string, delta: string) => {
    updateProps({ title: delta });
  };

  const updateColLabel = (key: string, label: string) => {
    updateProps({ columns: columns.map((c) => (c.key === key ? { ...c, label } : c)) });
  };
  const addCol = () => updateProps({ columns: [...columns, { key: nanoid(5), label: format(t((m) => m.editor.canvasColumnN), { n: columns.length + 1 }), type: "text" as const }] });
  const removeCol = (key: string) => { if (columns.length > 1) updateProps({ columns: columns.filter((c) => c.key !== key) }); };

  return (
    <div>
      <WorkReactQuill value={title} editorProp="title" feUuid={feUuid} onChange={handleTitle} showVideo={false} />
      <div className="mt-2 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-center">#</TableHead>
              {columns.map((col) => (
                <TableHead key={col.key} className="min-w-24">
                  <div className="flex items-center gap-1">
                    <Input
                      value={col.label}
                      onChange={(e) => updateColLabel(col.key, e.target.value)}
                      className="h-7 text-xs"
                    />
                    {columns.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeCol(col.key)} className="size-5 shrink-0 text-muted-foreground hover:text-red-500">
                        <X size={10} />
                      </Button>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: minRows }, (_, i) => (
              <TableRow key={i}>
                <TableCell className="w-10 text-center text-xs text-muted-foreground">{i + 1}</TableCell>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    <Input disabled placeholder={t((m) => m.editor.canvasPleaseInput)} className="h-7 text-xs" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-2 flex gap-2 border-t border-dashed border-border pt-2">
        <Button variant="outline" size="sm" onClick={addCol}>
          <Plus />{t((m) => m.editor.canvasAddColumn)}
        </Button>
        <span className="text-xs text-muted-foreground self-center">{t((m) => m.editor.canvasAutoAddRow)}</span>
      </div>
    </div>
  );
};
export default Component;
