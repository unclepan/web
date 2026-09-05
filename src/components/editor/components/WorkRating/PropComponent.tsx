"use client";
import { FC, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkRatingPropsType } from "./interface";
import { useLocale } from "@/i18n/useLocale";
import { format } from "@/i18n/locale-utils";

const PropComponent: FC<WorkRatingPropsType & { onChange?: (v: WorkRatingPropsType) => void; disabled?: boolean }> = (props) => {
  const { t } = useLocale();
  const { max, iconType, required, onChange, disabled } = props;
  const local = useMemo(() => ({ max, iconType, required }), [max, iconType, required]);
  const update = (patch: Partial<WorkRatingPropsType>) => onChange?.({ ...local, ...patch });
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="max">{t((m) => m.editor.propMaxScore)}</FieldLabel>
        <Select disabled={disabled} value={String(local.max)} onValueChange={(v) => update({ max: Number(v) })}>
          <SelectTrigger id="max" className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="3">{format(t((m) => m.editor.propScoreOption), { n: 3 })}</SelectItem>
            <SelectItem value="5">{format(t((m) => m.editor.propScoreOption), { n: 5 })}</SelectItem>
            <SelectItem value="10">{format(t((m) => m.editor.propScoreOption), { n: 10 })}</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="iconType">{t((m) => m.editor.propIconType)}</FieldLabel>
        <Select disabled={disabled} value={local.iconType || "star"} onValueChange={(v) => update({ iconType: v as "star" | "heart" | "emoji" })}>
          <SelectTrigger id="iconType" className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="star">{t((m) => m.editor.propIconStar)}</SelectItem>
            <SelectItem value="heart">{t((m) => m.editor.propIconHeart)}</SelectItem>
            <SelectItem value="emoji">{t((m) => m.editor.propIconEmoji)}</SelectItem>
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
