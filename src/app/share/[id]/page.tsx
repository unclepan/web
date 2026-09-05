"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Clock,
  Users,
  TrendingUp,
  Share2,
  Copy,
  Check,
  ArrowLeft,
  FileText,
  Calendar,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Lock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCode } from "@/components/ui/qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { analyseApi } from "@/lib/api/modules/analyse";
import { workApi } from "@/lib/api/modules/work";
import type {
  PublicStats,
  QuestionStat,
} from "@/lib/api/modules/analyse.types";
import type { PublishedWork } from "@/lib/api/modules/work.types";
import { toast } from "sonner";
import { useLocale, format } from "@/i18n/useLocale";

export default function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { t } = useLocale();
  const [id, setId] = useState<string>("");

  // Resolve params promise
  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const [stats, setStats] = useState<PublicStats | null>(null);
  const [published, setPublished] = useState<PublishedWork | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );

  // Load public stats + published work info
  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [statsRes, pubRes] = await Promise.all([
        analyseApi.publicStats(Number(id)),
        workApi.findPublished(Number(id)),
      ]);
      setStats(statsRes);
      setPublished(pubRes);
    } catch {
      // If either call fails, show not-found state
      setStats(null);
      setPublished(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
     
    loadData();
  }, [loadData]);

  const maxOptionCount = useCallback((q: QuestionStat) => {
    if (!q.options || q.options.length === 0) return 1;
    return Math.max(...q.options.map((o) => o.count), 1);
  }, []);

  function toggleQuestion(questionId: string) {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  }

  function handleCopyLink() {
    if (typeof window === "undefined" || !id) return;
    const url = `${window.location.origin}/s/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(t((m) => m.survey.linkCopiedToast));
  }

  function formatDuration(seconds: number): string {
    if (!seconds || seconds <= 0) return "—";
    if (seconds < 60) return format(t((m) => m.survey.secondUnit), { seconds: Math.round(seconds) });
    const min = Math.floor(seconds / 60);
    const sec = Math.round(seconds % 60);
    return format(t((m) => m.survey.minuteSecondUnit), { m: min, s: sec });
  }

  function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    } catch {
      return "—";
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin" />
          <p className="text-sm">{t((m) => m.survey.loadingStats)}</p>
        </div>
      </div>
    );
  }

  // Stats not allowed (showPublicResults disabled)
  if (stats && !stats.allowed) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full bg-card rounded-lg border border-border p-8">
          <div className="flex justify-center mb-4">
            <Lock className="size-10 text-muted-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground mb-2">
            {t((m) => m.survey.statsNotPublicTitle)}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {stats.message || t((m) => m.survey.statsNotPublicDesc)}
          </p>
          <Button onClick={() => router.push("/workspace")}>{t((m) => m.survey.backToWorkspace)}</Button>
        </div>
      </div>
    );
  }

  // Survey not found
  if (!stats && !published) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full bg-card rounded-lg border border-border p-8">
          <div className="flex justify-center mb-4">
            <FileText className="size-10 text-muted-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground mb-2">{t((m) => m.survey.surveyNotFound)}</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {t((m) => m.survey.surveyNotFoundDesc)}
          </p>
          <Button onClick={() => router.push("/workspace")}>{t((m) => m.survey.backToWorkspace)}</Button>
        </div>
      </div>
    );
  }

  const workName = stats?.workName || published?.name || t((m) => m.survey.surveyDefaultName2);
  const overview = stats?.overview;
  const questions = stats?.questions || [];

  // Extract desc & pageTotal from publishedContent JSON
  const publishedContent = published?.publishedContent as
    | { desc?: string; pageTotal?: number }
    | null;
  const workDesc = publishedContent?.desc ?? "";
  const pageTotal = publishedContent?.pageTotal;

  return (
    <div className="min-h-screen bg-muted">
      {/* 顶部导航 */}
      <header className="bg-card border-b border-border sticky top-0 z-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push("/workspace")}
              className="size-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-medium text-foreground truncate">
                {workName}
              </h1>
              <p className="text-xs text-muted-foreground">{t((m) => m.survey.statsResultLabel)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQR(true)}
              className="gap-1.5"
            >
              <FileText className="size-4" />
              <span className="hidden sm:inline">{t((m) => m.survey.qrCodeBtn)}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-1.5"
            >
              {copied ? (
                <Check className="size-4 text-green-600 dark:text-green-300" />
              ) : (
                <Copy className="size-4" />
              )}
              <span className="hidden sm:inline">
                {copied ? t((m) => m.survey.copiedBtn) : t((m) => m.survey.copyLinkBtn)}
              </span>
            </Button>
            <Button
              size="sm"
              onClick={() => window.open(`/s/${id}`, "_blank")}
              className="gap-1.5"
            >
              <Share2 className="size-4" />
              <span className="hidden sm:inline">{t((m) => m.survey.goToAnswerBtn)}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-4 sm:py-6">
        {/* 问卷信息卡片 */}
        <div className="bg-card rounded-lg border border-border p-4 sm:p-6 mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">
            {workName}
          </h2>
          {workDesc && (
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              {workDesc}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {overview?.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                {format(t((m) => m.survey.publishedOn), { date: formatDate(overview.publishedAt) })}
              </span>
            )}
            {overview?.isStopped ? (
              <span className="flex items-center gap-1 text-orange-500">
                <Clock className="size-3.5" />
                {t((m) => m.survey.collectionStopped)}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-green-500">
                <Clock className="size-3.5" />
                {t((m) => m.survey.collecting)}
              </span>
            )}
            {pageTotal && (
              <span className="flex items-center gap-1">
                <FileText className="size-3.5" />
                {format(t((m) => m.survey.pagesTotal), { total: pageTotal })}
              </span>
            )}
          </div>
        </div>

        {/* 概览数据卡片 */}
        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <StatCard
              icon={<Users className="size-4 text-blue-500" />}
              label={t((m) => m.survey.totalResponsesLabel)}
              value={String(overview.total)}
            />
            <StatCard
              icon={<TrendingUp className="size-4 text-green-500" />}
              label={t((m) => m.survey.todayNewLabel)}
              value={String(overview.todayCount)}
            />
            <StatCard
              icon={<Clock className="size-4 text-purple-500" />}
              label={t((m) => m.survey.avgDurationLabel)}
              value={formatDuration(overview.avgDuration)}
            />
          </div>
        )}

        {/* 题目统计列表 */}
        {questions.length > 0 ? (
          <div className="space-y-3">
            {questions.map((stat, idx) => (
              <QuestionStatCard
                key={stat.questionId}
                stat={stat}
                index={idx + 1}
                maxCount={maxOptionCount(stat)}
                expanded={expandedQuestions.has(stat.questionId)}
                onToggle={() => toggleQuestion(stat.questionId)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <BarChart3 className="size-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {t((m) => m.survey.noStatsYet)}
            </p>
          </div>
        )}

        {/* 底部操作 */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => window.open(`/s/${id}`, "_blank")}
            className="w-full sm:w-auto"
          >
            <Share2 className="size-4" />
            {t((m) => m.survey.goToAnswerBtn2)}
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push("/workspace")}
            className="w-full sm:w-auto"
          >
            {t((m) => m.survey.backToWorkspace)}
          </Button>
        </div>
      </div>

      <footer className="py-4 text-center text-xs text-muted-foreground">
        Powered by Survey Web
      </footer>

      {/* 二维码弹窗 */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>{t((m) => m.survey.scanToAnswerTitle)}</DialogTitle>
            <DialogDescription>
              {t((m) => m.survey.scanToAnswerDesc)}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <QRCode
              value={
                typeof window !== "undefined"
                  ? `${window.location.origin}/s/${id}`
                  : `/s/${id}`
              }
              size={220}
              className="border border-border"
            />
            <p className="mt-4 text-sm text-muted-foreground text-center">{workName}</p>
          </div>
          <DialogFooter>
            <Button onClick={handleCopyLink} className="w-full gap-1.5">
              <Copy className="size-4" />
              {t((m) => m.survey.copyLinkBtn)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** 概览统计卡片 */
function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-xl font-semibold text-foreground tabular-nums">
        {value}
      </div>
    </div>
  );
}

/** 单题统计卡片 */
function QuestionStatCard({
  stat,
  index,
  maxCount,
  expanded,
  onToggle,
}: {
  stat: QuestionStat;
  index: number;
  maxCount: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { t } = useLocale();
  const hasOptions =
    stat.options && stat.options.length > 0;
  const hasTexts = stat.texts && stat.texts.length > 0;
  const isOptionType = ["radio", "checkbox", "star", "rate", "dropdown"].includes(
    stat.type
  );
  const isTextType = ["text", "textarea"].includes(stat.type);

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* 题目头部 */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-4 text-left hover:bg-muted transition-colors"
      >
        <div className="flex items-start gap-2 min-w-0">
          <span className="text-sm text-muted-foreground shrink-0">Q{index}</span>
          <span className="text-sm font-medium text-foreground truncate">
            {stat.title}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground">{format(t((m) => m.survey.peopleAnswered), { total: stat.total })}</span>
          {expanded ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* 展开内容 */}
      {expanded && (
        <div className="px-4 sm:px-5 pb-4 border-t border-border pt-3 sm:pt-4">
          {isOptionType && hasOptions && (
            <div className="space-y-3">
              {stat
                .options!.slice()
                .sort((a, b) => b.count - a.count)
                .map((opt, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">{opt.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(t((m) => m.survey.votesCount), { count: opt.count, percentage: opt.percentage.toFixed(1) })}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${(opt.count / maxCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}

          {isTextType && (
            <div className="space-y-2">
              {hasTexts ? (
                stat.texts!.map((text, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-3 bg-muted rounded-md"
                  >
                    <MessageSquare className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{text}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t((m) => m.survey.noTextAnswers)}
                </p>
              )}
            </div>
          )}

          {/* 未知题型兜底 */}
          {!isOptionType && !isTextType && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t((m) => m.survey.unsupportedStatsType)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
