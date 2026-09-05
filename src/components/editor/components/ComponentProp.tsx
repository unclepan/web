"use client";

import { Component } from "lucide-react";
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { useGetComponentInfo, useEditor } from "@/components/editor/store/EditorProvider";
import { getComponentConfByType } from "../components";
import { useLocale } from "@/i18n/useLocale";

export default function ComponentProp() {
  const { t } = useLocale();
  const { dispatch } = useEditor();
  const { selectedComponent } = useGetComponentInfo();
  if (!selectedComponent) return (
    <div className="py-16">
      <Empty>
        <EmptyMedia variant="icon">
          <Component />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>{t((m) => m.editor.panelNoComponentSelected)}</EmptyTitle>
          <EmptyDescription>{t((m) => m.editor.panelSelectComponentHint)}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
  const { type, props, isLocked, isHidden } = selectedComponent;
  const conf = getComponentConfByType(type);
  if (!conf) return (
    <div className="py-16">
      <Empty>
        <EmptyMedia variant="icon">
          <Component />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>{t((m) => m.editor.panelNoComponentSelected)}</EmptyTitle>
          <EmptyDescription>{t((m) => m.editor.panelSelectComponentHint)}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );

  const changeProps = (newProps: Record<string, unknown>) => {
    dispatch({ type: "PUSH_PAST" });
    dispatch({ type: "CHANGE_COMPONENT_PROPS", payload: { feUuid: selectedComponent.feUuid, newProps } });
  };

  return <conf.PropComponent {...(props as Record<string, unknown>)} onChange={changeProps} disabled={isLocked || isHidden} />;
}
