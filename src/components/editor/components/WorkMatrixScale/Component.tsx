"use client";
import { FC } from "react";
import { X, CirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEditor } from "@/components/editor/store/EditorProvider";
import { useLocale } from "@/i18n/useLocale";
import { format } from "@/i18n/locale-utils";
import WorkReactQuill from "../WorkReactQuill";
import { WorkMatrixScalePropsType, WorkMatrixScaleDefaultProps } from "./interface";
import { nanoid } from "nanoid";

const Component: FC<WorkMatrixScalePropsType & { feUuid?: string }> = (props) => {
  const { dispatch } = useEditor();
  const { t } = useLocale();
  const { title = "", rows = [], min = 1, max = 5, minLabel = "", maxLabel = "", feUuid = "" } = { ...WorkMatrixScaleDefaultProps, ...props };

  const updateProps = (newProps: Partial<WorkMatrixScalePropsType>) => {
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

  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div>
      <WorkReactQuill value={title} editorProp="title" feUuid={feUuid} onChange={handleTitle} showVideo={false} />
      <div className="mt-2 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32"></TableHead>
              {numbers.map((n) => (
                <TableHead key={n} className="text-center min-w-16">{n}</TableHead>
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
                {numbers.map((n) => (
                  <TableCell key={n} className="text-center">
                    <RadioGroup className="flex justify-center">
                      <RadioGroupItem value={`${row.value}-${n}`} id={`mscale-${row.value}-${n}`} />
                    </RadioGroup>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {(minLabel || maxLabel) && (
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
      <div className="mt-2 border-t border-dashed border-border pt-2">
        <Button variant="outline" size="sm" onClick={addRow}>
          <CirclePlus />{t((m) => m.editor.canvasAddQuestion)}
        </Button>
      </div>
    </div>
  );
};
export default Component;
