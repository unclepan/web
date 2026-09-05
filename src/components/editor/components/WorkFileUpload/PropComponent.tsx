"use client";
import { FC, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkFileUploadPropsType } from "./interface";
import { useLocale } from "@/i18n/useLocale";

const PropComponent: FC<WorkFileUploadPropsType & { onChange?: (v: WorkFileUploadPropsType) => void; disabled?: boolean }> = (props) => {
  const { t } = useLocale();
  const { maxFiles, accept, maxSize, required, onChange, disabled } = props;
  const local = useMemo(() => ({ maxFiles, accept, maxSize, required }), [maxFiles, accept, maxSize, required]);
  const update = (patch: Partial<WorkFileUploadPropsType>) => onChange?.({ ...local, ...patch });

  const acceptLabel = local.accept === "image/*" ? "image" : local.accept === "*/*" ? "file" : "custom";

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="maxFiles">{t((m) => m.editor.propMaxFiles)}</FieldLabel>
        <Input
          id="maxFiles"
          type="number"
          min={1}
          disabled={disabled}
          value={String(local.maxFiles ?? 1)}
          onChange={(e) => update({ maxFiles: Number(e.target.value) })}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="accept">{t((m) => m.editor.propAcceptType)}</FieldLabel>
        <Select
          disabled={disabled}
          value={acceptLabel}
          onValueChange={(v) => {
            const acceptMap: Record<string, string> = { image: "image/*", file: "*/*", custom: local.accept || "*/*" };
            update({ accept: acceptMap[v] });
          }}
        >
          <SelectTrigger id="accept" className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="image">{t((m) => m.editor.propAcceptImage)}</SelectItem>
            <SelectItem value="file">{t((m) => m.editor.propAcceptFile)}</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="maxSize">{t((m) => m.editor.propMaxSize)}</FieldLabel>
        <Input
          id="maxSize"
          type="number"
          min={1}
          disabled={disabled}
          value={String(local.maxSize ?? 10)}
          onChange={(e) => update({ maxSize: Number(e.target.value) })}
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
