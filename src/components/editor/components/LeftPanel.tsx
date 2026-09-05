"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ComponentLib from "./ComponentLib";
import Layers from "./Layers";
import { useLocale } from "@/i18n/useLocale";

export default function LeftPanel() {
  const { t } = useLocale();
  const [tab, setTab] = useState<"lib" | "layers">("lib");
  return (
    <Tabs value={tab} onValueChange={(v: string) => setTab(v as "lib" | "layers")} className="h-full">
      <TabsList className="w-full mb-3">
        <TabsTrigger value="lib">{t((m) => m.editor.panelComponentLib)}</TabsTrigger>
        <TabsTrigger value="layers">{t((m) => m.editor.panelLayers)}</TabsTrigger>
      </TabsList>
      <TabsContent value="lib" className="overflow-y-auto scrollbar-thin" style={{ height: "calc(100% - 40px)" }}><ComponentLib /></TabsContent>
      <TabsContent value="layers" className="overflow-y-auto scrollbar-thin" style={{ height: "calc(100% - 40px)" }}><Layers /></TabsContent>
    </Tabs>
  );
}
