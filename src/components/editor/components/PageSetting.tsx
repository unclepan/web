"use client";

import { useGetPageInfo, useEditor } from "@/components/editor/store/EditorProvider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocale } from "@/i18n/useLocale";

export default function PageSetting() {
  const { t } = useLocale();
  const { dispatch } = useEditor();
  const pageInfo = useGetPageInfo();
  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-sm text-muted-foreground mb-1 block">{t((m) => m.editor.panelWorkTitle)}</span>
        <Input value={pageInfo.name}
          onChange={(e) => dispatch({ type: "CHANGE_PAGE_NAME", payload: e.target.value })} placeholder={t((m) => m.editor.panelWorkTitlePlaceholder)} />
      </label>
      <label className="block">
        <span className="text-sm text-muted-foreground mb-1 block">{t((m) => m.editor.panelWorkDesc)}</span>
        <Textarea rows={3} value={pageInfo.desc || ""}
          onChange={(e) => dispatch({ type: "CHANGE_PAGE_DESC", payload: e.target.value })} placeholder={t((m) => m.editor.panelWorkDescPlaceholder)} />
      </label>
    </div>
  );
}
