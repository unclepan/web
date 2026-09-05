"use client";
import { FC, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkSatisfactionPropsType } from "./interface";
import { useLocale } from "@/i18n/useLocale";
import { format } from "@/i18n/locale-utils";

const PropComponent: FC<WorkSatisfactionPropsType & { onChange?: (v: WorkSatisfactionPropsType) => void; disabled?: boolean }> = (props) => {
  const { t } = useLocale();
  const { levels, style, required, onChange, disabled } = props;
  const local = useMemo(() => ({ levels, style, required }), [levels, style, required]);
  const update = (patch: Partial<WorkSatisfactionPropsType>) => onChange?.({ ...local, ...patch });
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="levels">{t((m) => m.editor.propLevels)}</FieldLabel>
        <Select disabled={disabled} value={String(local.levels)} onValueChange={(v) => update({ levels: Number(v) })}>
          <SelectTrigger id="levels" className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="3">{format(t((m) => m.editor.propLevelOption), { n: 3 })}</SelectItem>
            <SelectItem value="5">{format(t((m) => m.editor.propLevelOption), { n: 5 })}</SelectItem>
            <SelectItem value="7">{format(t((m) => m.editor.propLevelOption), { n: 7 })}</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="style">{t((m) => m.editor.propDisplayStyle)}</FieldLabel>
        <Select disabled={disabled} value={local.style || "emoji"} onValueChange={(v) => update({ style: v as "emoji" | "text" })}>
          <SelectTrigger id="style" className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="emoji">{t((m) => m.editor.propStyleEmoji)}</SelectItem>
            <SelectItem value="text">{t((m) => m.editor.propStyleText)}</SelectItem>
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
