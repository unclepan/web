"use client";
import { FC } from "react";
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Settings2 } from "lucide-react";
import { useLocale } from "@/i18n/useLocale";

const PropComponent: FC = () => {
  const { t } = useLocale();
  return (
    <Empty>
      <EmptyMedia variant="icon">
        <Settings2 />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>{t((m) => m.editor.propNoProps)}</EmptyTitle>
        <EmptyDescription>{t((m) => m.editor.propNoPropsInfoDesc)}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};
export default PropComponent;
