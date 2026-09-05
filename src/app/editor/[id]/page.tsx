"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useEditor } from "@/components/editor/store/EditorProvider";
import { useLocale } from "@/i18n/useLocale";
import EditHeader from "@/components/editor/components/EditHeader";
import EditCanvas from "@/components/editor/components/EditCanvas";
import LeftPanel from "@/components/editor/components/LeftPanel";
import RightPanel from "@/components/editor/components/RightPanel";
import CanvasTool from "@/components/editor/components/CanvasTool";

export default function EditorPage() {
  const { dispatch, setWorkId, isLoading } = useEditor();
  const { t } = useLocale();
  const params = useParams();
  const id = Number(params?.id);

  useEffect(() => {
    if (id && !Number.isNaN(id)) {
      setWorkId(id);
    }
  }, [id, setWorkId]);

  function clearSelectedId() {
    dispatch({ type: "CHANGE_SELECTED_ID", payload: "" });
    dispatch({ type: "CHANGE_EDITOR_SELECTED_ID", payload: "" });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-muted">
        <div className="text-muted-foreground">{t((m) => m.editor.loading)}</div>
      </div>
    );
  }

  return (
    <div className={"flex flex-col h-screen bg-muted"}>
      <div className="shrink-0">
        <EditHeader />
      </div>
      <div className="flex-auto py-4 px-4 sm:px-6">
        <div className="h-full relative">

          <div className="absolute top-0 bottom-0 left-0 w-72 bg-card p-3 rounded z-20 hidden lg:block">
            <LeftPanel />
          </div>

          <div className="max-w-[1520px] mx-auto absolute left-0 top-0 bottom-0 right-0 z-10">
            <div className="px-0 pb-3 lg:px-80">
              <CanvasTool />
            </div>
            <div className="px-0 lg:px-80" style={{ height: "calc(100% - 60px)" }} onClick={clearSelectedId}>
              <EditCanvas loading={isLoading} />
            </div>
          </div>

          <div className="absolute top-0 bottom-0 right-0 w-72 bg-card p-3 rounded z-20 hidden lg:block">
            <RightPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
