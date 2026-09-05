"use client";

import { Star, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocale } from "@/i18n/useLocale";
import QuestionTitle from "./QuestionTitle";
import type { AnswerValue } from "@/lib/survey-types";

type OptionType = { value: string; text: string };
type TableColumn = { key: string; label: string; type?: "text" | "number" };

type SharedProps = {
  props: Record<string, unknown>;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  error?: string;
  index: number;
};

const btnBase =
  "flex items-center justify-center rounded-md border cursor-pointer transition-all text-sm font-medium tabular-nums select-none";
const btnUnselected = "border-border text-muted-foreground hover:border-border";
const btnSelected = "border-blue-500 bg-blue-500 text-white";

/** 矩阵列最小宽度：保证列多时可横向滚动且每列不被挤压 */
const ROW_HEAD_MIN = "min-w-[110px]";
const COL_MIN = "min-w-[84px]";
const COL_INPUT_MIN = "min-w-[140px]";

/** 矩阵单选 workMatrixRadio */
export function AnswerMatrixRadio({ props, value, onChange, error, index }: SharedProps) {
  const title = props.title as string | undefined;
  const required = props.required as boolean | undefined;
  const rows = (props.rows || []) as OptionType[];
  const columns = (props.columns || []) as OptionType[];
  const matrixValue = value.type === "matrix" ? value.value : {};

  function selectCell(rowValue: string, colValue: string) {
    onChange({
      type: "matrix",
      value: { ...matrixValue, [rowValue]: colValue },
    });
  }

  return (
    <div className="mb-5">
      <QuestionTitle title={title} required={required} index={index} error={error} />
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={ROW_HEAD_MIN}></TableHead>
              {columns.map((col) => (
                <TableHead key={col.value} className={`text-center ${COL_MIN}`}>{col.text}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.value}>
                <TableCell className={`font-medium text-foreground ${ROW_HEAD_MIN}`}>{row.text}</TableCell>
                {columns.map((col) => (
                  <TableCell key={col.value} className={`text-center ${COL_MIN}`}>
                    <input
                      type="radio"
                      name={`matrix-radio-${row.value}`}
                      checked={(matrixValue[row.value] as string) === col.value}
                      onChange={() => selectCell(row.value, col.value)}
                      className="size-4 accent-blue-500"
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/** 矩阵多选 workMatrixCheckbox */
export function AnswerMatrixCheckbox({ props, value, onChange, error, index }: SharedProps) {
  const title = props.title as string | undefined;
  const required = props.required as boolean | undefined;
  const rows = (props.rows || []) as OptionType[];
  const columns = (props.columns || []) as OptionType[];
  const matrixValue = value.type === "matrix" ? value.value : {};

  function toggleCell(rowValue: string, colValue: string) {
    const current = (matrixValue[rowValue] as string[]) || [];
    const next = current.includes(colValue)
      ? current.filter((v) => v !== colValue)
      : [...current, colValue];
    onChange({
      type: "matrix",
      value: { ...matrixValue, [rowValue]: next },
    });
  }

  return (
    <div className="mb-5">
      <QuestionTitle title={title} required={required} index={index} error={error} />
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={ROW_HEAD_MIN}></TableHead>
              {columns.map((col) => (
                <TableHead key={col.value} className={`text-center ${COL_MIN}`}>{col.text}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.value}>
                <TableCell className={`font-medium text-foreground ${ROW_HEAD_MIN}`}>{row.text}</TableCell>
                {columns.map((col) => {
                  const current = (matrixValue[row.value] as string[]) || [];
                  const isChecked = current.includes(col.value);
                  return (
                    <TableCell key={col.value} className={`text-center ${COL_MIN}`}>
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleCell(row.value, col.value)}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/** 矩阵量表 workMatrixScale */
export function AnswerMatrixScale({ props, value, onChange, error, index }: SharedProps) {
  const title = props.title as string | undefined;
  const required = props.required as boolean | undefined;
  const rows = (props.rows || []) as OptionType[];
  const min = (props.min as number) ?? 1;
  const max = (props.max as number) ?? 5;
  const minLabel = (props.minLabel as string) || "";
  const maxLabel = (props.maxLabel as string) || "";
  const nums = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const matrixValue = value.type === "matrix" ? value.value : {};

  function selectCell(rowValue: string, n: number) {
    onChange({
      type: "matrix",
      value: { ...matrixValue, [rowValue]: String(n) },
    });
  }

  return (
    <div className="mb-5">
      <QuestionTitle title={title} required={required} index={index} error={error} />
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={ROW_HEAD_MIN}></TableHead>
              {nums.map((n) => (
                <TableHead key={n} className={`text-center ${COL_MIN}`}>{n}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.value}>
                <TableCell className={`font-medium text-foreground ${ROW_HEAD_MIN}`}>{row.text}</TableCell>
                {nums.map((n) => (
                  <TableCell key={n} className={`text-center ${COL_MIN}`}>
                    <button
                      type="button"
                      className={`${btnBase} h-8 w-8 mx-auto ${
                        (matrixValue[row.value] as string) === String(n)
                          ? btnSelected
                          : btnUnselected
                      }`}
                      onClick={() => selectCell(row.value, n)}
                    >
                      {n}
                    </button>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {(minLabel || maxLabel) && (
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}

/** 矩阵打分 workMatrixScore */
export function AnswerMatrixScore({ props, value, onChange, error, index }: SharedProps) {
  const { t } = useLocale();
  const title = props.title as string | undefined;
  const required = props.required as boolean | undefined;
  const rows = (props.rows || []) as OptionType[];
  const max = (props.max as number) || 5;
  const iconType = (props.iconType as "star" | "number") || "star";
  const matrixValue = value.type === "matrix" ? value.value : {};
  const nums = Array.from({ length: max }, (_, i) => i + 1);

  function setScore(rowValue: string, n: number) {
    onChange({
      type: "matrix",
      value: { ...matrixValue, [rowValue]: String(n) },
    });
  }

  return (
    <div className="mb-5">
      <QuestionTitle title={title} required={required} index={index} error={error} />
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={ROW_HEAD_MIN}></TableHead>
              <TableHead className="text-center min-w-[180px]">{t((m) => m.survey.scoringCol)}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const score = parseInt((matrixValue[row.value] as string) || "0", 10);
              return (
                <TableRow key={row.value}>
                  <TableCell className="font-medium text-foreground">{row.text}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 justify-center">
                      {nums.map((n) => (
                        <button
                          key={n}
                          type="button"
                          className="cursor-pointer p-0.5"
                          onClick={() => setScore(row.value, n)}
                        >
                          {iconType === "star" ? (
                            <Star
                              className={`size-5 ${score >= n ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                            />
                          ) : (
                            <span
                              className={`${btnBase} h-7 w-7 ${
                                score === n ? btnSelected : btnUnselected
                              }`}
                            >
                              {n}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/** 矩阵填空 workMatrixInput */
export function AnswerMatrixInput({ props, value, onChange, error, index }: SharedProps) {
  const { t } = useLocale();
  const title = props.title as string | undefined;
  const required = props.required as boolean | undefined;
  const rows = (props.rows || []) as OptionType[];
  const columns = (props.columns || []) as OptionType[];
  const matrixValue = value.type === "matrix" ? value.value : {};

  function setCell(rowValue: string, colValue: string, text: string) {
    const rowKey = `${rowValue}__${colValue}`;
    onChange({
      type: "matrix",
      value: { ...matrixValue, [rowKey]: text },
    });
  }

  return (
    <div className="mb-5">
      <QuestionTitle title={title} required={required} index={index} error={error} />
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={ROW_HEAD_MIN}></TableHead>
              {columns.map((col) => (
                <TableHead key={col.value} className={`text-center ${COL_INPUT_MIN}`}>{col.text}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.value}>
                <TableCell className={`font-medium text-foreground ${ROW_HEAD_MIN}`}>{row.text}</TableCell>
                {columns.map((col) => (
                  <TableCell key={col.value} className={COL_INPUT_MIN}>
                    <Input
                      value={(matrixValue[`${row.value}__${col.value}`] as string) || ""}
                      onChange={(e) => setCell(row.value, col.value, e.target.value)}
                      className="h-8"
                      placeholder={t((m) => m.survey.pleaseInput)}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/** 自增表格 workDynamicTable */
export function AnswerDynamicTable({ props, value, onChange, error, index }: SharedProps) {
  const { t } = useLocale();
  const title = props.title as string | undefined;
  const required = props.required as boolean | undefined;
  const columns = (props.columns || []) as TableColumn[];
  const minRows = (props.minRows as number) || 1;
  const tableValue = value.type === "table" ? value.value : [];

  // 确保至少有 minRows 行
  const rows: Record<string, string>[] =
    tableValue.length >= minRows
      ? tableValue
      : Array.from({ length: minRows }, () => ({} as Record<string, string>));

  function updateCell(rowIndex: number, colKey: string, val: string) {
    const next = [...rows];
    next[rowIndex] = { ...next[rowIndex], [colKey]: val };
    onChange({ type: "table", value: next });
  }
  function addRow() {
    onChange({ type: "table", value: [...rows, {} as Record<string, string>] });
  }
  function removeRow(rowIndex: number) {
    if (rows.length <= minRows) return;
    onChange({ type: "table", value: rows.filter((_, i) => i !== rowIndex) });
  }

  return (
    <div className="mb-5">
      <QuestionTitle title={title} required={required} index={index} error={error} />
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={COL_INPUT_MIN}>{col.label}</TableHead>
              ))}
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    <Input
                      type={col.type === "number" ? "number" : "text"}
                      value={(row[col.key] as string) || ""}
                      onChange={(e) => updateCell(rowIndex, col.key, e.target.value)}
                      className="h-8"
                      placeholder={t((m) => m.survey.pleaseInput)}
                    />
                  </TableCell>
                ))}
                <TableCell>
                  {rows.length > minRows && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-red-400"
                      onClick={() => removeRow(rowIndex)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Button variant="outline" size="sm" className="mt-2 gap-1" onClick={addRow}>
        <Plus className="size-3.5" />
        {t((m) => m.survey.addRow)}
      </Button>
    </div>
  );
}
