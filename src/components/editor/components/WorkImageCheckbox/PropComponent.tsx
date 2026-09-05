"use client";
import { FC, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkImageCheckboxPropsType } from "./interface";
import { useLocale } from "@/i18n/useLocale";

const PropComponent: FC<WorkImageCheckboxPropsType & { onChange?: (v: WorkImageCheckboxPropsType) => void; disabled?: boolean }> = (props) => {
  const { t } = useLocale();
  const { required, row, onChange, disabled } = props;
  const local = useMemo(() => ({ required, row }), [required, row]);
  const update = (patch: Partial<WorkImageCheckboxPropsType>) => onChange?.({ ...local, ...patch });
  const rowOptions = [
    { value: "24", label: t((m) => m.editor.propColumn1) },
    { value: "12", label: t((m) => m.editor.propColumn2) },
    { value: "8", label: t((m) => m.editor.propColumn3) },
    { value: "6", label: t((m) => m.editor.propColumn4) },
  ];
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="row">{t((m) => m.editor.propPerRow)}</FieldLabel>
        <Select disabled={disabled} value={String(local.row)} onValueChange={(v) => update({ row: Number(v) })}>
          <SelectTrigger id="row" className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            {rowOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
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
