"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ComponentProp from "./ComponentProp";
import PageSetting from "./PageSetting";
import { useGetComponentInfo } from "@/components/editor/store/EditorProvider";
import { useLocale } from "@/i18n/useLocale";

export default function RightPanel() {
  const { t } = useLocale();
  const { selectedId } = useGetComponentInfo();
  const [manualTab, setManualTab] = useState<"prop" | "setting" | null>(null);
  const [lastSelectedId, setLastSelectedId] = useState<string | null | undefined>(selectedId);

  // 当 selectedId 变化时重置手动选择（在渲染阶段安全地更新 state）
  if (selectedId !== lastSelectedId) {
    setLastSelectedId(selectedId);
    setManualTab(null);
  }

  const tab: "prop" | "setting" = manualTab ?? (selectedId ? "prop" : "setting");
  const setTab = (v: "prop" | "setting") => setManualTab(v);

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as "prop" | "setting")} className="h-full">
      <TabsList className="w-full mb-3">
        <TabsTrigger value="prop">{t((m) => m.editor.panelProperties)}</TabsTrigger>
        <TabsTrigger value="setting">{t((m) => m.editor.panelPageSettings)}</TabsTrigger>
      </TabsList>
      <TabsContent value="prop" style={{ height: "calc(100% - 40px)" }}><ComponentProp /></TabsContent>
      <TabsContent value="setting" style={{ height: "calc(100% - 40px)" }}><PageSetting /></TabsContent>
    </Tabs>
  );
}
