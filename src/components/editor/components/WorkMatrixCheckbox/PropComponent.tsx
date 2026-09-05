"use client";
import { FC, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { WorkMatrixCheckboxPropsType } from "./interface";
import { useLocale } from "@/i18n/useLocale";

const PropComponent: FC<WorkMatrixCheckboxPropsType & { onChange?: (v: WorkMatrixCheckboxPropsType) => void; disabled?: boolean }> = (props) => {
  const { t } = useLocale();
  const { required, onChange, disabled } = props;
  const local = useMemo(() => ({ required }), [required]);
  const update = (patch: Partial<WorkMatrixCheckboxPropsType>) => onChange?.({ ...local, ...patch });
  return (
    <FieldGroup>
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
