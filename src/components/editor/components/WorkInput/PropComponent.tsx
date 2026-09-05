"use client";
import { FC, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkInputPropsType } from "./interface";
import { useLocale } from "@/i18n/useLocale";

const PropComponent: FC<WorkInputPropsType & { onChange?: (v: WorkInputPropsType) => void; disabled?: boolean }> = (props) => {
  const { t } = useLocale();
  const { placeholder, required, rule, onChange, disabled } = props;
  const local = useMemo(() => ({ placeholder, required, rule }), [placeholder, required, rule]);
  const update = (patch: Partial<WorkInputPropsType>) => onChange?.({ ...local, ...patch });
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
      <Field>
        <FieldLabel htmlFor="rule">{t((m) => m.editor.propTextFormat)}</FieldLabel>
        <Select disabled={disabled} value={local.rule} onValueChange={(v) => update({ rule: v })}>
          <SelectTrigger id="rule" className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="null">{t((m) => m.editor.propFormatNone)}</SelectItem>
            <SelectItem value="email">{t((m) => m.editor.propFormatEmail)}</SelectItem>
            <SelectItem value="phone">{t((m) => m.editor.propFormatPhone)}</SelectItem>
            <SelectItem value="url">{t((m) => m.editor.propFormatUrl)}</SelectItem>
            <SelectItem value="number">{t((m) => m.editor.propFormatNumber)}</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field orientation="horizontal">
        <Checkbox
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
