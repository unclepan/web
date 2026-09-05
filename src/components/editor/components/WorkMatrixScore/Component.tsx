"use client";
import { FC } from "react";
import { X, CirclePlus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useEditor } from "@/components/editor/store/EditorProvider";
import { useLocale } from "@/i18n/useLocale";
import { format } from "@/i18n/locale-utils";
import WorkReactQuill from "../WorkReactQuill";
import { WorkMatrixScorePropsType, WorkMatrixScoreDefaultProps } from "./interface";
import { nanoid } from "nanoid";

const Component: FC<WorkMatrixScorePropsType & { feUuid?: string }> = (props) => {
  const { dispatch } = useEditor();
  const { t } = useLocale();
  const { title = "", rows = [], max = 5, iconType = "star", feUuid = "" } = { ...WorkMatrixScoreDefaultProps, ...props };

  const updateProps = (newProps: Partial<WorkMatrixScorePropsType>) => {
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
  const addRow = () => updateProps({ rows: [...rows, { value: nanoid(5), text: format(t((m) => m.editor.canvasQuestionN), { n: rows.length + 1 }) }] });
  const removeRow = (value: string) => { if (rows.length > 1) updateProps({ rows: rows.filter((r) => r.value !== value) }); };

  const renderCell = () => {
    if (iconType === "number") {
      return <span className="text-xs text-muted-foreground">{t((m) => m.editor.canvasScore)}</span>;
    }
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: max }, (_, i) => (
          <Star key={i} className="size-3 text-muted-foreground" />
        ))}
      </div>
    );
  };

  return (
    <div>
      <WorkReactQuill value={title} editorProp="title" feUuid={feUuid} onChange={handleTitle} showVideo={false} />
      <div className="mt-2 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32"></TableHead>
              <TableHead className="text-center">{t((m) => m.editor.canvasScoring)}</TableHead>
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
                <TableCell className="text-center">
                  <div className="flex justify-center">{renderCell()}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-2 border-t border-dashed border-border pt-2">
        <Button variant="outline" size="sm" onClick={addRow}>
          <CirclePlus />{t((m) => m.editor.canvasAddQuestion)}
        </Button>
      </div>
    </div>
  );
};
export default Component;
