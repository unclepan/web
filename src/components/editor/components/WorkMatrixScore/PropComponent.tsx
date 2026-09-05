"use client";
import { FC, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkMatrixScorePropsType } from "./interface";
import { useLocale } from "@/i18n/useLocale";

const PropComponent: FC<WorkMatrixScorePropsType & { onChange?: (v: WorkMatrixScorePropsType) => void; disabled?: boolean }> = (props) => {
  const { t } = useLocale();
  const { max, iconType, required, onChange, disabled } = props;
  const local = useMemo(() => ({ max, iconType, required }), [max, iconType, required]);
  const update = (patch: Partial<WorkMatrixScorePropsType>) => onChange?.({ ...local, ...patch });
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="max">{t((m) => m.editor.propMaxScore)}</FieldLabel>
        <Input id="max" type="number" min={1} disabled={disabled} value={String(local.max ?? 5)} onChange={(e) => update({ max: Number(e.target.value) })} />
      </Field>
      <Field>
        <FieldLabel htmlFor="iconType">{t((m) => m.editor.propIconType)}</FieldLabel>
        <Select disabled={disabled} value={local.iconType || "star"} onValueChange={(v) => update({ iconType: v as "star" | "number" })}>
          <SelectTrigger id="iconType" className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="star">{t((m) => m.editor.propIconStar)}</SelectItem>
            <SelectItem value="number">{t((m) => m.editor.propIconNumber)}</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field orientation="horizontal">
        <Switch id="required" disabled={disabled} checked={local.required || false} onCheckedChange={(v) => update({ required: Boolean(v) })} />
        <FieldLabel htmlFor="required" className="font-normal">{t((m) => m.editor.propRequired)}</FieldLabel>
      </Field>
    </FieldGroup>
  );
};
export default PropComponent;
