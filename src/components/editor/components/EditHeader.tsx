"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, SquarePen, History, Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useGetPageInfo, useEditor } from "@/components/editor/store/EditorProvider";
import { useLocale } from "@/i18n/useLocale";
import EditToolbar from "./EditToolbar";
import PublishDialog from "./PublishDialog";
import HistoryDialog from "./HistoryDialog";
import { toast } from "sonner";

function TitleElem() {
  const { t } = useLocale();
  const { dispatch } = useEditor();
  const { name } = useGetPageInfo();
  const [open, setOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(name);

  const handleOpen = () => {
    setEditTitle(name);
    setOpen(true);
  };

  const handleConfirm = () => {
    const v = editTitle.trim();
    if (!v) return;
    dispatch({ type: "CHANGE_PAGE_NAME", payload: v });
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <p className="m-0 max-w-40 truncate" title={name}>{name || t((m) => m.editor.untitled)}</p>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpen}
        className="size-6 text-muted-foreground hover:text-muted-foreground cursor-pointer"
      >
        <SquarePen size={14} />
      </Button>
      <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) setOpen(false); }}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>{t((m) => m.editor.changeSurveyTitle)}</DialogTitle>
          </DialogHeader>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); }}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{t((m) => m.editor.cancel)}</Button>
            <Button onClick={handleConfirm} disabled={!editTitle.trim()}>{t((m) => m.editor.confirm)}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SaveStatusIndicator() {
  const { t } = useLocale();
  const { saveStatus } = useEditor();

  if (saveStatus === "saving") {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="size-3 animate-spin" />
        {t((m) => m.editor.saving)}
      </span>
    );
  }
  if (saveStatus === "saved") {
    return (
      <span className="flex items-center gap-1 text-xs text-green-500">
        <Check className="size-3" />
        {t((m) => m.editor.saved)}
      </span>
    );
  }
  if (saveStatus === "error") {
    return (
      <span className="flex items-center gap-1 text-xs text-red-500">
        <AlertCircle className="size-3" />
        {t((m) => m.editor.saveFailed)}
      </span>
    );
  }
  return null;
}

export default function EditHeader() {
  const { t } = useLocale();
  const { workId, saveContent, saveStatus } = useEditor();

  const [publishOpen, setPublishOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { name } = useGetPageInfo();

  const handleSaveDraft = async () => {
    if (!workId) return;
    setSaving(true);
    const ok = await saveContent(false);
    setSaving(false);
    if (ok) {
      toast.success(t((m) => m.editor.draftSaved));
    } else {
      toast.error(t((m) => m.editor.draftSaveFailed));
    }
  };

  return (
    <header className="bg-card h-20">
      <div className="mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          <div className="w-72 flex items-center gap-3">
            <Link href="/workspace" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft size={18} />
            </Link>
            <TitleElem />
            <SaveStatusIndicator />
          </div>
          <div className="hidden lg:block"><EditToolbar /></div>
          <div className="w-72 flex justify-end gap-2">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setHistoryOpen(true)}
              disabled={!workId}
              title={t((m) => m.editor.history)}
            >
              <History className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleSaveDraft}
              disabled={!workId || saving || saveStatus === "saving"}
            >
              {saving || saveStatus === "saving" ? (
                <Loader2 className="size-4 animate-spin mr-1" />
              ) : null}
              {t((m) => m.editor.saveDraft)}
            </Button>
            <Button
              size="lg"
              onClick={async () => {
                await saveContent(false);
                setPublishOpen(true);
              }}
              disabled={!workId}
            >
              {t((m) => m.editor.publish)}
            </Button>
          </div>
        </div>
      </div>

      {workId && (
        <>
          <PublishDialog
            open={publishOpen}
            onOpenChange={setPublishOpen}
            workId={workId}
            surveyTitle={name || t((m) => m.editor.untitledSurvey)}
          />
          <HistoryDialog
            open={historyOpen}
            onOpenChange={setHistoryOpen}
            workId={workId}
          />
        </>
      )}
    </header>
  );
}
