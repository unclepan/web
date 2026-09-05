"use client";

import { useState, useEffect, useCallback } from "react";
import { History, RotateCcw, Eye, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/i18n/useLocale";
import { format as formatTemplate } from "@/i18n/locale-utils";
import { toast } from "sonner";
import { workApi } from "@/lib/api";
import type { WorkHistoryItem, WorkHistoryDetail } from "@/lib/api";

type HistoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workId: number;
  onRollbackSuccess?: () => void;
};

export default function HistoryDialog({
  open,
  onOpenChange,
  workId,
  onRollbackSuccess,
}: HistoryDialogProps) {
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);
  const [historyList, setHistoryList] = useState<WorkHistoryItem[]>([]);
  const [previewItem, setPreviewItem] = useState<WorkHistoryDetail | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [rollbackId, setRollbackId] = useState<number | null>(null);

  const loadHistory = useCallback(async () => {
    if (!workId) return;
    setLoading(true);
    try {
      const list = await workApi.history(workId);
      setHistoryList(list);
    } catch {
      toast.error(t((m) => m.editor.loadHistoryFailed));
    } finally {
      setLoading(false);
    }
  }, [workId, t]);

  useEffect(() => {
    if (open) {
       
      loadHistory();
       
      setPreviewItem(null);
    }
  }, [open, loadHistory]);

  async function handlePreview(historyId: number) {
    setPreviewLoading(true);
    try {
      const detail = await workApi.historyDetail(historyId);
      setPreviewItem(detail);
    } catch {
      toast.error(t((m) => m.editor.loadHistoryFailed));
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleRollback(historyId: number) {
    setRollbackId(historyId);
    try {
      await workApi.rollback({ workId, historyId });
      toast.success(t((m) => m.editor.rollbackSuccess));
      onOpenChange(false);
      onRollbackSuccess?.();
      // 重新加载历史列表
      loadHistory();
    } catch {
      toast.error(t((m) => m.editor.rollbackFailed));
    } finally {
      setRollbackId(null);
    }
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <History className="size-5 text-blue-600 dark:text-blue-300" />
                      {t((m) => m.editor.historyTitle)}
                    </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 min-h-[300px]">
          {/* 左侧：历史列表 */}
          <div className="w-64 shrink-0">
            <ScrollArea className="h-[360px] pr-2">
              {loading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              ) : historyList.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {t((m) => m.editor.noHistory)}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {historyList.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border p-2.5 hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => handlePreview(item.id)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium">
                            v{item.version}
                          </span>
                          {item.isAuto ? (
                            <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                              {t((m) => m.editor.auto)}
                            </Badge>
                          ) : (
                            <Badge className="text-[10px] py-0 px-1.5 bg-blue-500">
                              {t((m) => m.editor.manual)}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          {formatTime(item.createdAt)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 size-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRollback(item.id);
                        }}
                        disabled={rollbackId === item.id}
                      >
                        {rollbackId === item.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* 右侧：预览 */}
          <div className="flex-1 border-l pl-4">
            {previewLoading ? (
              <div className="flex items-center justify-center h-[360px] text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : previewItem ? (
              <div className="h-[360px]">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {formatTemplate(t((m) => m.editor.previewVersion), { version: previewItem.version ?? 0 })}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => handleRollback(previewItem.id)}
                    disabled={rollbackId === previewItem.id}
                  >
                    {rollbackId === previewItem.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="size-3.5" />
                    )}
                    {t((m) => m.editor.rollbackToVersion)}
                  </Button>
                </div>
                <ScrollArea className="h-[320px] rounded-lg bg-muted p-3">
                  <div className="text-sm space-y-2">
                    <div className="font-medium text-foreground">
                      {previewItem.name || t((m) => m.editor.unnamed)}
                    </div>
                    {Array.isArray(
                      (previewItem.content as { componentList?: unknown[] })
                        ?.componentList,
                    ) ? (
                      <div className="space-y-1.5">
                        {(
                          previewItem.content as { componentList: { title: string; type: string }[] }
                        ).componentList.map((c, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-xs text-muted-foreground"
                          >
                            <span className="size-1.5 rounded-full bg-blue-400" />
                            {c.title || c.type}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">{t((m) => m.editor.noQuestionData)}</div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[360px] text-muted-foreground">
                <Eye className="size-8 mb-2 opacity-40" />
                <span className="text-sm">{t((m) => m.editor.clickLeftToPreview)}</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t((m) => m.editor.close)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
