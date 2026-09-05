"use client";
import { FC, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { WorkScalePropsType } from "./interface";
import { useLocale } from "@/i18n/useLocale";

const PropComponent: FC<WorkScalePropsType & { onChange?: (v: WorkScalePropsType) => void; disabled?: boolean }> = (props) => {
  const { t } = useLocale();
  const { min, max, minLabel, maxLabel, required, onChange, disabled } = props;
  const local = useMemo(() => ({ min, max, minLabel, maxLabel, required }), [min, max, minLabel, maxLabel, required]);
  const update = (patch: Partial<WorkScalePropsType>) => onChange?.({ ...local, ...patch });
  // 保证 min < max，否则画布/答题端会渲染出空量表
  const updateMin = (v: number) => {
    const nextMax = local.max ?? 5;
    update({ min: v, ...(v >= nextMax ? { max: v + 1 } : {}) });
  };
  const updateMax = (v: number) => {
    const nextMin = local.min ?? 1;
    update({ max: v, ...(v <= nextMin ? { min: v - 1 } : {}) });
  };
  return (
    <FieldGroup>
      <div className="flex gap-2">
        <Field className="flex-1">
          <FieldLabel htmlFor="min">{t((m) => m.editor.propMinValue)}</FieldLabel>
          <Input
            id="min"
            type="number"
            disabled={disabled}
            value={String(local.min ?? 1)}
            onChange={(e) => updateMin(Number(e.target.value))}
          />
        </Field>
        <Field className="flex-1">
          <FieldLabel htmlFor="max">{t((m) => m.editor.propMaxValue)}</FieldLabel>
          <Input
            id="max"
            type="number"
            disabled={disabled}
            value={String(local.max ?? 5)}
            onChange={(e) => updateMax(Number(e.target.value))}
          />
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor="minLabel">{t((m) => m.editor.propMinLabel)}</FieldLabel>
        <Input
          id="minLabel"
          disabled={disabled}
          value={local.minLabel || ""}
          onChange={(e) => update({ minLabel: e.target.value })}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="maxLabel">{t((m) => m.editor.propMaxLabel)}</FieldLabel>
        <Input
          id="maxLabel"
          disabled={disabled}
          value={local.maxLabel || ""}
          onChange={(e) => update({ maxLabel: e.target.value })}
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
