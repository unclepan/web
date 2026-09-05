"use client";
import { FC, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { WorkSelectPropsType } from "./interface";
import { useLocale } from "@/i18n/useLocale";

const PropComponent: FC<WorkSelectPropsType & { onChange?: (v: WorkSelectPropsType) => void; disabled?: boolean }> = (props) => {
  const { t } = useLocale();
  const { placeholder, required, onChange, disabled } = props;
  const local = useMemo(() => ({ placeholder, required }), [placeholder, required]);
  const update = (patch: Partial<WorkSelectPropsType>) => onChange?.({ ...local, ...patch });
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="placeholder">{t((m) => m.editor.propPlaceholder)}</FieldLabel>
        <Input
          id="placeholder"
          disabled={disabled}
          value={local.placeholder || ""}
          onChange={(e) => update({ placeholder: e.target.value })}
        />
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
