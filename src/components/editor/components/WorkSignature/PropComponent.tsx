"use client";
import { FC, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { WorkSignaturePropsType } from "./interface";
import { useLocale } from "@/i18n/useLocale";

const PropComponent: FC<WorkSignaturePropsType & { onChange?: (v: WorkSignaturePropsType) => void; disabled?: boolean }> = (props) => {
  const { t } = useLocale();
  const { width, height, required, onChange, disabled } = props;
  const local = useMemo(() => ({ width, height, required }), [width, height, required]);
  const update = (patch: Partial<WorkSignaturePropsType>) => onChange?.({ ...local, ...patch });
  return (
    <FieldGroup>
      <div className="flex gap-2">
        <Field className="flex-1">
          <FieldLabel htmlFor="width">{t((m) => m.editor.propCanvasWidth)}</FieldLabel>
          <Input
            id="width"
            type="number"
            disabled={disabled}
            value={String(local.width ?? 400)}
            onChange={(e) => update({ width: Number(e.target.value) })}
          />
        </Field>
        <Field className="flex-1">
          <FieldLabel htmlFor="height">{t((m) => m.editor.propCanvasHeight)}</FieldLabel>
          <Input
            id="height"
            type="number"
            disabled={disabled}
            value={String(local.height ?? 200)}
            onChange={(e) => update({ height: Number(e.target.value) })}
          />
        </Field>
      </div>
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
