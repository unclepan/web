"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RotateCcw, Trash2, FileText, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { workApi } from "@/lib/api";
import type { WorkListItem } from "@/lib/api";
import { toast } from "sonner";
import { useLocale, format } from "@/i18n/useLocale";

export default function TrashPage() {
  const { t } = useLocale();
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  });
  const [items, setItems] = useState<WorkListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<WorkListItem | null>(null);
  const [restoreItem, setRestoreItem] = useState<WorkListItem | null>(null);
  const [acting, setActing] = useState(false);
  const hasLoadedOnce = useRef(false);

  const loadTrash = useCallback(async () => {
    // 首次加载才显示 loading spinner，后续刷新保持现有列表不动
    if (!hasLoadedOnce.current) {
      setLoading(true);
    }
    try {
      const list = await workApi.list({ bin: true });
      setItems(list);
      hasLoadedOnce.current = true;
    } catch {
      toast.error(tRef.current((m) => m.workspace.loadTrashFailedToast));
    } finally {
      setLoading(false);
    }
  }, []);

   
  useEffect(() => {
     
    loadTrash();
  }, [loadTrash]);

  async function doRestore() {
    if (!restoreItem) return;
    setActing(true);
    try {
      await workApi.restore(restoreItem.id);
      toast.success(t((m) => m.workspace.restoredToast));
      setRestoreItem(null);
      loadTrash();
    } catch {
      toast.error(t((m) => m.workspace.restoreFailedToast));
    } finally {
      setActing(false);
    }
  }

  async function doDelete() {
    if (!confirm) return;
    setActing(true);
    try {
      await workApi.deletePermanently(confirm.id);
      toast.success(t((m) => m.workspace.permanentlyDeletedToast));
      setConfirm(null);
      loadTrash();
    } catch {
      toast.error(t((m) => m.workspace.deleteFailedToast));
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6" data-aos="fade-up">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t((m) => m.workspace.trashTitle)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t((m) => m.workspace.trashDesc)}
          </p>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="bg-card rounded-lg border border-border overflow-hidden" data-aos="fade-up" data-aos-delay="100">
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow className="bg-muted hover:bg-muted border-border">
                <TableHead className="py-3 pl-4 pr-2 text-xs uppercase tracking-wider text-muted-foreground w-full min-w-[200px]">
                  {t((m) => m.workspace.colSurvey)}
                </TableHead>
                <TableHead className="px-2 py-3 hidden sm:table-cell text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap min-w-[90px]">
                  {t((m) => m.workspace.colStatus)}
                </TableHead>
                <TableHead className="px-2 py-3 hidden md:table-cell text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap min-w-[140px]">
                  {t((m) => m.workspace.colDeletedAt)}
                </TableHead>
                <TableHead className="py-3 pl-2 pr-4 text-right text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap min-w-[160px] sticky right-0 bg-muted">
                  {t((m) => m.workspace.colActions)}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((s) => {
                const statusLabel = !s.isPublish ? t((m) => m.workspace.statusDraft) : s.isStopped ? t((m) => m.workspace.statusStopped) : t((m) => m.workspace.statusPublished);
                const statusBg = !s.isPublish ? "bg-muted text-muted-foreground" : s.isStopped ? "bg-orange-500/15 text-orange-600 dark:text-orange-300" : "bg-green-500/15 text-green-600 dark:text-green-300";
                return (
                  <TableRow key={s.id} className="group">
                    <TableCell className="py-3 pl-4 pr-2 w-full min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <FileText className="size-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            {s.name || t((m) => m.workspace.untitledSurvey)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-2 py-3 hidden sm:table-cell whitespace-nowrap min-w-[90px]">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${statusBg}`}>
                        {statusLabel}
                      </span>
                    </TableCell>
                    <TableCell className="px-2 py-3 hidden md:table-cell text-sm text-muted-foreground whitespace-nowrap min-w-[140px]">
                      {new Date(s.updatedAt).toLocaleString("zh-CN")}
                    </TableCell>
                    <TableCell className="py-3 pl-2 pr-4 text-right whitespace-nowrap min-w-[160px] sticky right-0 bg-card group-hover:bg-muted">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setRestoreItem(s)}>
                          <RotateCcw className="size-4" />
                          <span className="hidden sm:inline">{t((m) => m.workspace.restoreBtn)}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 dark:text-red-300 hover:text-red-600 dark:hover:text-red-300"
                          onClick={() => setConfirm(s)}
                        >
                          <Trash2 className="size-4" />
                          <span className="hidden sm:inline">{t((m) => m.workspace.permanentlyDeleteBtn)}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center" data-aos="fade-up">
          <div className="size-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <Trash2 className="size-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">{t((m) => m.workspace.trashEmpty)}</p>
        </div>
      )}

      {/* 恢复确认 */}
      <Dialog open={!!restoreItem} onOpenChange={(v) => !v && setRestoreItem(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t((m) => m.workspace.restoreDialogTitle)}</DialogTitle>
            <DialogDescription>
              {format(t((m) => m.workspace.restoreDialogDesc), { name: restoreItem?.name ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreItem(null)}>{t((m) => m.workspace.cancelBtn)}</Button>
            <Button onClick={doRestore} disabled={acting}>
              {acting ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
              {t((m) => m.workspace.confirmRestoreBtn)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 彻底删除确认 */}
      <Dialog open={!!confirm} onOpenChange={(v) => !v && setConfirm(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-red-500/15 flex items-center justify-center">
                <AlertTriangle className="size-4 text-red-600 dark:text-red-300" />
              </div>
              <DialogTitle>{t((m) => m.workspace.permanentlyDeleteDialogTitle)}</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              {format(t((m) => m.workspace.permanentlyDeleteDialogDesc), { name: confirm?.name ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>{t((m) => m.workspace.cancelBtn)}</Button>
            <Button variant="destructive" onClick={doDelete} disabled={acting}>
              {acting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              {t((m) => m.workspace.permanentDeleteBtn)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
