"use client";
import { FC, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkDateTimePropsType } from "./interface";
import { useLocale } from "@/i18n/useLocale";

const PropComponent: FC<WorkDateTimePropsType & { onChange?: (v: WorkDateTimePropsType) => void; disabled?: boolean }> = (props) => {
  const { t } = useLocale();
  const { mode, required, onChange, disabled } = props;
  const local = useMemo(() => ({ mode, required }), [mode, required]);
  const update = (patch: Partial<WorkDateTimePropsType>) => onChange?.({ ...local, ...patch });
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="mode">{t((m) => m.editor.propType)}</FieldLabel>
        <Select disabled={disabled} value={local.mode || "date"} onValueChange={(v) => update({ mode: v as "date" | "time" | "datetime" })}>
          <SelectTrigger id="mode" className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="date">{t((m) => m.editor.propDateType)}</SelectItem>
            <SelectItem value="time">{t((m) => m.editor.propTimeType)}</SelectItem>
            <SelectItem value="datetime">{t((m) => m.editor.propDatetimeType)}</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field orientation="horizontal">
        <Switch
          id="required"
          disabled={disabled}
          checked={local.required || false}
          onCheckedChange={(v) => update({ required: Boolean(v) })}
        />
        <FieldLabel htmlFor="required" className="font-normal">{t((m) => m.editor.propRequired)}</FieldLabel>
      </Field>
    </FieldGroup>
  );
};
export default PropComponent;
