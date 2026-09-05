"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  MoreHorizontal,
  Pencil,
  BarChart3,
  Copy,
  Trash2,
  FileText,
  Eye,
  Share2,
  Play,
  Square,
  Link2,
  Check,
  Loader2,
  FileArchive,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { workApi } from "@/lib/api";
import type { WorkListItem } from "@/lib/api";
import { toast } from "sonner";
import { Field } from "@/components/ui/field";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLocale, format } from "@/i18n/useLocale";

type FilterKey = "all" | "draft" | "published" | "stopped" | "starred";

function CreateSurveyDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    const trimmed = title.trim();
    if (!trimmed) return;

    setCreating(true);
    try {
      const work = await workApi.add(trimmed);
      if (work?.id) {
        toast.success(t((m) => m.workspace.createSuccessToast));
        onOpenChange(false);
        setTitle("");
        router.push(`/editor/${work.id}`);
      } else {
        toast.error(t((m) => m.workspace.createFailedToast));
      }
    } catch {
      toast.error(t((m) => m.workspace.createFailedToast));
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{t((m) => m.workspace.createDialogTitle)}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="survey-title">{t((m) => m.workspace.createDialogLabel)}</Label>
          <Input
            id="survey-title"
            placeholder={t((m) => m.workspace.createDialogPlaceholder)}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t((m) => m.workspace.cancelBtn)}
          </Button>
          <Button
            disabled={!title.trim() || creating}
            onClick={handleCreate}
          >
            {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {t((m) => m.workspace.createAndEditBtn)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SurveyCard({
  work,
  onStatusChanged,
  onStarChanged,
  onDeleted,
  onCopied,
  role,
}: {
  work: WorkListItem;
  onStatusChanged: (isStopped: boolean) => void;
  onStarChanged: (starred: boolean) => void;
  onDeleted: () => void;
  onCopied: () => void;
  role?: string;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const status = !work.isPublish
    ? { label: t((m) => m.workspace.statusDraft), bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" }
    : work.isStopped
    ? { label: t((m) => m.workspace.statusStopped), bg: "bg-orange-500/15", text: "text-orange-600 dark:text-orange-300", dot: "bg-orange-400" }
    : { label: t((m) => m.workspace.statusPublished), bg: "bg-green-500/15", text: "text-green-600 dark:text-green-300", dot: "bg-green-500" };
  const [shareOpen, setShareOpen] = useState(false);
  const [copiedWhich, setCopiedWhich] = useState<"answer" | "stats" | null>(null);
  const [acting, setActing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WorkListItem | null>(null);
  const [copyTarget, setCopyTarget] = useState<WorkListItem | null>(null);
  const [copyName, setCopyName] = useState("");
  const [templateTarget, setTemplateTarget] = useState<WorkListItem | null>(null);

  const answerUrl = typeof window !== "undefined"
    ? `${window.location.origin}/s/${work.id}`
    : `/s/${work.id}`;
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/share/${work.id}`
    : `/share/${work.id}`;

  function handleCopyLink(url: string, which: "answer" | "stats") {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopiedWhich(which);
    setTimeout(() => setCopiedWhich(null), 2000);
    toast.success(t((m) => m.workspace.linkCopiedToast));
  }

  async function handleToggleStatus() {
    setActing(true);
    const prevStopped = work.isStopped;
    const willStop = work.isPublish && !work.isStopped;
    const newStopped = willStop ? true : false;

    // 乐观更新：先改本地状态，不请求列表接口
    onStatusChanged(newStopped);

    try {
      if (willStop) {
        await workApi.stop(work.id);
        toast.success(format(t((m) => m.workspace.stoppedCollectionToast), { name: work.name }));
      } else {
        await workApi.resume(work.id);
        toast.success(format(t((m) => m.workspace.resumedCollectionToast), { name: work.name }));
      }
    } catch {
      // 回滚
      onStatusChanged(prevStopped);
      toast.error(t((m) => m.workspace.operationFailedToast));
    } finally {
      setActing(false);
    }
  }

  async function handleToggleStar() {
    setActing(true);
    const prevStarred = work.starred;

    // 乐观更新：先改本地状态
    onStarChanged(!prevStarred);

    try {
      await workApi.toggleStar(work.id);
    } catch {
      // 回滚
      onStarChanged(prevStarred);
      toast.error(t((m) => m.workspace.operationFailedToast));
    } finally {
      setActing(false);
    }
  }

  function openCopyDialog() {
    const base =
      work.name && work.name.trim()
        ? work.name.trim()
        : t((m) => m.workspace.untitledSurvey);
    setCopyName(`${base}（副本）`);
    setCopyTarget(work);
  }

  async function doCopy() {
    if (!copyTarget) return;
    const base =
      copyTarget.name && copyTarget.name.trim()
        ? copyTarget.name.trim()
        : t((m) => m.workspace.untitledSurvey);
    const name = copyName.trim() || `${base}（副本）`;
    setActing(true);
    try {
      await workApi.copy(copyTarget.id, name);
      toast.success(t((m) => m.workspace.surveyCopiedToast));
      onCopied();
      setCopyTarget(null);
    } catch {
      toast.error(t((m) => m.workspace.copyFailedToast));
    } finally {
      setActing(false);
    }
  }

  async function doDelete() {
    if (!deleteTarget) return;
    setActing(true);
    const target = deleteTarget;
    setDeleteTarget(null);

    // 乐观更新：直接从列表移除
    onDeleted();

    try {
      await workApi.delete(target.id);
      toast.success(t((m) => m.workspace.movedToTrashToast));
    } catch {
      // 回滚：重新拉取列表
      onCopied();
      toast.error(t((m) => m.workspace.deleteFailedToast));
    } finally {
      setActing(false);
    }
  }

  async function doToTemplate() {
    if (!templateTarget) return;
    setActing(true);
    try {
      await workApi.toTemplate(templateTarget.id);
      toast.success(format(t((m) => m.workspace.convertedToTemplateToast), { name: templateTarget.name }));
      setTemplateTarget(null);
    } catch {
      toast.error(t((m) => m.workspace.operationFailedToast));
    } finally {
      setActing(false);
    }
  }

  return (
    <>
      <div className="group bg-card rounded-lg border border-border p-5 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${status.bg} ${status.text}`}
            >
              <span className={`size-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            <button onClick={handleToggleStar} disabled={acting}>
              <Star
                className={`size-4 shrink-0 transition-colors ${
                  work.starred
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-muted-foreground hover:text-yellow-400"
                }`}
              />
            </button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => router.push(`/editor/${work.id}`)}>
                <Pencil className="size-4" />
                {t((m) => m.workspace.editMenu)}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/workspace/stats/${work.id}`)}>
                <BarChart3 className="size-4" />
                {t((m) => m.workspace.viewStatsMenu)}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(`/s/preview/${work.id}`, "_blank")}>
                <Eye className="size-4" />
                {t((m) => m.workspace.previewMenu)}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShareOpen(true)}>
                <Share2 className="size-4" />
                {t((m) => m.workspace.shareMenu)}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {work.isPublish && !work.isStopped && (
                <DropdownMenuItem className="text-amber-600 dark:text-amber-300 focus:text-amber-600 dark:focus:text-amber-300" onClick={handleToggleStatus} disabled={acting}>
                  <Square className="size-4" />
                  {t((m) => m.workspace.stopCollectionMenu)}
                </DropdownMenuItem>
              )}
              {work.isStopped && (
                <DropdownMenuItem className="text-green-600 dark:text-green-300 focus:text-green-600 dark:focus:text-green-300" onClick={handleToggleStatus} disabled={acting}>
                  <Play className="size-4" />
                  {t((m) => m.workspace.resumeCollectionMenu)}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={openCopyDialog} disabled={acting}>
                <Copy className="size-4" />
                {t((m) => m.workspace.copySurveyMenu)}
              </DropdownMenuItem>
              {role === "SYSTEM_ADMIN" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setTemplateTarget(work)} disabled={acting}>
                    <FileArchive className="size-4" />
                    {t((m) => m.workspace.toTemplateMenu)}
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 dark:text-red-300 focus:text-red-600 dark:focus:text-red-300" onClick={() => setDeleteTarget(work)} disabled={acting}>
                <Trash2 className="size-4" />
                {t((m) => m.workspace.deleteMenu)}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Link href={`/editor/${work.id}`} className="block mt-3">
          <h3 className="text-base font-medium text-foreground truncate hover:text-blue-600 dark:hover:text-blue-300 transition-colors">
            {work.name || t((m) => m.workspace.untitledSurvey)}
          </h3>
        </Link>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>{new Date(work.updatedAt).toLocaleDateString("zh-CN")}</span>
          <span className="flex items-center gap-1">
            <FileText className="size-3.5" />
            {work.isPublish ? t((m) => m.workspace.statusPublished) : t((m) => m.workspace.statusDraft)}
          </span>
        </div>

        {/* 快捷操作栏 */}
        <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1"
            onClick={() => window.open(`/s/preview/${work.id}`, "_blank")}
          >
            <Eye className="size-3.5" />
            {t((m) => m.workspace.previewBtn)}
          </Button>
          {work.isPublish && !work.isStopped && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={() => setShareOpen(true)}
              >
                <Link2 className="size-3.5" />
                {t((m) => m.workspace.shareBtn)}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs gap-1 ml-auto text-amber-600 dark:text-amber-300 hover:text-amber-700 dark:hover:text-amber-300"
                onClick={handleToggleStatus}
                disabled={acting}
              >
                <Square className="size-3.5" />
                {t((m) => m.workspace.stopBtn)}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 分享弹窗 */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="size-5 text-blue-600 dark:text-blue-300" />
              {format(t((m) => m.workspace.shareDialogTitle), { name: work.name })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">{t((m) => m.workspace.answerLinkLabel)}</label>
              <div className="mt-1.5 flex gap-2">
                <Input value={answerUrl} readOnly className="flex-1 h-9 text-sm text-muted-foreground" />
                <Button variant="outline" size="sm" className="shrink-0 gap-1 w-[88px] justify-center h-9" onClick={() => handleCopyLink(answerUrl, "answer")}>
                  {copiedWhich === "answer" ? <Check className="size-3.5 text-green-600 dark:text-green-300" /> : null}
                  {copiedWhich === "answer" ? t((m) => m.workspace.copiedBtn) : t((m) => m.workspace.copyBtn)}
                </Button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t((m) => m.workspace.answerLinkDesc)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">{t((m) => m.workspace.statsLinkLabel)}</label>
              <div className="mt-1.5 flex gap-2">
                <Input value={shareUrl} readOnly className="flex-1 h-9 text-sm text-muted-foreground" />
                <Button variant="outline" size="sm" className="shrink-0 gap-1 w-[88px] justify-center h-9" onClick={() => handleCopyLink(shareUrl, "stats")}>
                  {copiedWhich === "stats" ? <Check className="size-3.5 text-green-600 dark:text-green-300" /> : null}
                  {copiedWhich === "stats" ? t((m) => m.workspace.copiedBtn) : t((m) => m.workspace.copyBtn)}
                </Button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t((m) => m.workspace.statsLinkDesc)}</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 gap-1.5" onClick={() => window.open(`/s/${work.id}`, "_blank")}>
                <Eye className="size-4" />
                {t((m) => m.workspace.openAnswerPageBtn)}
              </Button>
              <Button variant="outline" className="flex-1 gap-1.5" onClick={() => window.open(`/share/${work.id}`, "_blank")}>
                <BarChart3 className="size-4" />
                {t((m) => m.workspace.openSharePageBtn)}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t((m) => m.workspace.deleteMenu)}</DialogTitle>
            <DialogDescription>
              {format(t((m) => m.workspace.deleteDialogDesc), { name: deleteTarget?.name ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>{t((m) => m.workspace.cancelBtn)}</Button>
            <Button variant="destructive" onClick={doDelete} disabled={acting}>
              {acting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              {t((m) => m.workspace.deleteConfirmBtn)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 复制问卷 - 可改名 */}
      <Dialog open={!!copyTarget} onOpenChange={(v) => !v && setCopyTarget(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{t((m) => m.workspace.copyDialogTitle)}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-1">
            <Label htmlFor="copy-name">{t((m) => m.workspace.copyDialogLabel)}</Label>
            <Input
              id="copy-name"
              placeholder={t((m) => m.workspace.copyDialogPlaceholder)}
              value={copyName}
              onChange={(e) => setCopyName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") doCopy(); }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCopyTarget(null)}>{t((m) => m.workspace.cancelBtn)}</Button>
            <Button onClick={doCopy} disabled={acting}>
              {acting ? <Loader2 className="size-4 animate-spin" /> : <Copy className="size-4" />}
              {t((m) => m.workspace.copyConfirmBtn)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 转为模板确认 */}
      <Dialog open={!!templateTarget} onOpenChange={(v) => !v && setTemplateTarget(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t((m) => m.workspace.toTemplateMenu)}</DialogTitle>
            <DialogDescription>
              {t((m) => m.workspace.confirmToTemplate)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateTarget(null)}>{t((m) => m.workspace.cancelBtn)}</Button>
            <Button onClick={doToTemplate} disabled={acting}>
              {acting ? <Loader2 className="size-4 animate-spin" /> : <FileArchive className="size-4" />}
              {t((m) => m.workspace.toTemplateMenu)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function WorkspaceHomePage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  });
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [works, setWorks] = useState<WorkListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const hasLoadedOnce = useRef(false);

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: t((m) => m.workspace.filterAll) },
    { key: "draft", label: t((m) => m.workspace.filterDraft) },
    { key: "published", label: t((m) => m.workspace.filterPublished) },
    { key: "stopped", label: t((m) => m.workspace.filterStopped) },
    { key: "starred", label: t((m) => m.workspace.filterStarred) },
  ];

  const loadWorks = useCallback(async () => {
    // 首次加载才显示 loading spinner，后续刷新保持现有列表不动，静默更新数据
    if (!hasLoadedOnce.current) {
      setLoading(true);
    }
    try {
      const list = await workApi.list({
        keyword: keyword || undefined,
        status: filter !== "all" ? filter : undefined,
      });
      setWorks(list);
      hasLoadedOnce.current = true;
    } catch {
      toast.error(tRef.current((m) => m.workspace.loadListFailedToast));
    } finally {
      setLoading(false);
    }
  }, [keyword, filter]);

  /** 就地更新列表中某一条数据，避免请求列表接口 */
  const updateWork = useCallback((id: number, patch: Partial<WorkListItem>) => {
    setWorks((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  }, []);

  /** 就地移除列表中某一条数据 */
  const removeWork = useCallback((id: number) => {
    setWorks((prev) => prev.filter((w) => w.id !== id));
  }, []);

   
  useEffect(() => {
     
    loadWorks();
  }, [loadWorks]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6" data-aos="fade-up">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t((m) => m.workspace.homeTitle)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t((m) => m.workspace.homeDesc)}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-1 shrink-0">
          <Plus className="size-4" />
          {t((m) => m.workspace.newSurveyBtn)}
        </Button>
      </div>

      <CreateSurveyDialog open={createOpen} onOpenChange={(v) => { setCreateOpen(v); if (!v) loadWorks(); }} />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5" data-aos="fade-up" data-aos-delay="100">
        <div className="w-full sm:flex-1 sm:max-w-sm">
          <Field orientation="horizontal">
            <Input
              type="search"
              placeholder={t((m) => m.workspace.searchPlaceholder)}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Button onClick={loadWorks}>{t((m) => m.workspace.searchBtn)}</Button>
          </Field>
        </div>
        <div className="flex items-center gap-1 flex-wrap sm:ml-auto">
          {filters.map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : works.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {works.map((work, i) => (
            <div key={work.id} data-aos="fade-up" data-aos-delay={String(i * 50)}>
              <SurveyCard
                work={work}
                onStatusChanged={(isStopped) => updateWork(work.id, { isStopped })}
                onStarChanged={(starred) => updateWork(work.id, { starred })}
                onDeleted={() => removeWork(work.id)}
                onCopied={loadWorks}
                role={user?.role ?? ""}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center" data-aos="fade-up">
          <div className="size-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="size-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">{t((m) => m.workspace.noMatchingSurveys)}</p>
          <Button variant="outline" onClick={() => { setKeyword(""); setFilter("all"); }}>
            {t((m) => m.workspace.clearFiltersBtn)}
          </Button>
        </div>
      )}
    </div>
  );
}
