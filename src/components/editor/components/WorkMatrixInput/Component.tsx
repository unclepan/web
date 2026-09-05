"use client";
import { FC } from "react";
import { X, CirclePlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useEditor } from "@/components/editor/store/EditorProvider";
import { useLocale } from "@/i18n/useLocale";
import { format } from "@/i18n/locale-utils";
import WorkReactQuill from "../WorkReactQuill";
import { WorkMatrixInputPropsType, WorkMatrixInputDefaultProps } from "./interface";
import { nanoid } from "nanoid";

const Component: FC<WorkMatrixInputPropsType & { feUuid?: string }> = (props) => {
  const { dispatch } = useEditor();
  const { t } = useLocale();
  const { title = "", rows = [], columns = [], feUuid = "" } = { ...WorkMatrixInputDefaultProps, ...props };

  const updateProps = (newProps: Partial<WorkMatrixInputPropsType>) => {
    if (!feUuid) return;
    dispatch({ type: "PUSH_PAST" });
    dispatch({ type: "CHANGE_COMPONENT_PROPS", payload: { feUuid, newProps } });
  };
  const handleTitle = (editorProp: string, delta: string) => {
    updateProps({ title: delta });
  };

  const updateRowText = (value: string, text: string) => {
    updateProps({ rows: rows.map((r) => (r.value === value ? { ...r, text } : r)) });
  };
  const updateColText = (value: string, text: string) => {
    updateProps({ columns: columns.map((c) => (c.value === value ? { ...c, text } : c)) });
  };
  const addRow = () => updateProps({ rows: [...rows, { value: nanoid(5), text: format(t((m) => m.editor.canvasQuestionN), { n: rows.length + 1 }) }] });
  const addCol = () => updateProps({ columns: [...columns, { value: nanoid(5), text: format(t((m) => m.editor.canvasColumnN), { n: columns.length + 1 }) }] });
  const removeRow = (value: string) => { if (rows.length > 1) updateProps({ rows: rows.filter((r) => r.value !== value) }); };
  const removeCol = (value: string) => { if (columns.length > 1) updateProps({ columns: columns.filter((c) => c.value !== value) }); };

  return (
    <div>
      <WorkReactQuill value={title} editorProp="title" feUuid={feUuid} onChange={handleTitle} showVideo={false} />
      <div className="mt-2 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32"></TableHead>
              {columns.map((col) => (
                <TableHead key={col.value} className="text-center min-w-24">
                  <div className="flex items-center justify-center gap-1">
                    <Input
                      value={col.text}
                      onChange={(e) => updateColText(col.value, e.target.value)}
                      className="h-7 text-center text-xs"
                    />
                    {columns.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeCol(col.value)} className="size-5 shrink-0 text-muted-foreground hover:text-red-500">
                        <X size={10} />
                      </Button>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.value}>
                <TableCell className="w-32">
                  <div className="flex items-center gap-1">
                    <Input
                      value={row.text}
                      onChange={(e) => updateRowText(row.value, e.target.value)}
                      className="h-7 text-xs"
                    />
                    {rows.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeRow(row.value)} className="size-5 shrink-0 text-muted-foreground hover:text-red-500">
                        <X size={10} />
                      </Button>
                    )}
                  </div>
                </TableCell>
                {columns.map((col) => (
                  <TableCell key={col.value}>
                    <Input disabled placeholder={t((m) => m.editor.canvasPleaseInput)} className="h-7 text-xs" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-2 flex gap-2 border-t border-dashed border-border pt-2">
        <Button variant="outline" size="sm" onClick={addRow}>
          <CirclePlus />{t((m) => m.editor.canvasAddQuestion)}
        </Button>
        <Button variant="outline" size="sm" onClick={addCol}>
          <Plus />{t((m) => m.editor.canvasAddColumn)}
        </Button>
      </div>
    </div>
  );
};
export default Component;
