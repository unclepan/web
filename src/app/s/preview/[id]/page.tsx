"use client";

import { useEffect, useMemo, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  FileText,
  Eye,
  Pencil,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { workApi } from "@/lib/api";
import type { WorkDetail } from "@/lib/api";
import {
  isAnswerable,
  createEmptyAnswer,
} from "@/components/survey/hooks/useSurveyAnswers";
import AnswerQuestionRenderer from "@/components/survey/components/AnswerQuestionRenderer";
import type { SurveyDocument, SurveyComponent, AnswerValue } from "@/lib/survey-types";
import { useLocale, format } from "@/i18n/useLocale";

/** 将编辑器 WorkDetail 转换为 SurveyDocument（预览用，忽略发布状态） */
function workDetailToSurvey(work: WorkDetail): SurveyDocument | null {
  if (!work.content || typeof work.content !== "object") return null;

  const content = work.content as {
    componentList?: SurveyComponent[];
    pageTotal?: number;
  };

  return {
    id: String(work.id),
    title: work.name ?? "",
    desc: work.desc ?? "",
    // 预览页不关心发布状态，统一视为 published 以跳过状态拦截
    status: "published",
    pageTotal: content.pageTotal ?? 1,
    componentList: content.componentList ?? [],
    publishedAt: work.publishedAt ?? "",
    updatedAt: work.updatedAt,
    responseCount: 0,
    settings: {},
  };
}

function PreviewErrorPage({
  title,
  desc,
  onBack,
  t,
}: {
  title: string;
  desc: string;
  onBack: () => void;
  t: ReturnType<typeof useLocale>["t"];
}) {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full bg-card rounded-lg border border-border p-6 sm:p-8">
        <div className="flex justify-center mb-4">
          <AlertCircle className="size-10 text-muted-foreground" />
        </div>
        <h1 className="text-lg font-semibold text-foreground mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground mb-6">{desc}</p>
        <Button onClick={onBack}>{t((m) => m.survey.backToHome)}</Button>
      </div>
    </div>
  );
}

export default function SurveyPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useLocale();

  const [loading, setLoading] = useState(true);
  const [survey, setSurvey] = useState<SurveyDocument | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  // 预览用的本地答案 state —— 仅在内存中，不写入 localStorage
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});

  // 加载问卷草稿内容（不依赖发布状态）
  useEffect(() => {
    async function loadSurvey() {
      try {
        const work = await workApi.find(Number(id));
        const doc = workDetailToSurvey(work);
        setSurvey(doc);

        // 初始化空答案（供 AnswerQuestionRenderer 渲染）
        if (doc) {
          const initial: Record<string, AnswerValue> = {};
          for (const comp of doc.componentList) {
            if (isAnswerable(comp.type)) {
              initial[comp.feUuid] = createEmptyAnswer(comp.type);
            }
          }
          setAnswers(initial);
        }
      } catch {
        setSurvey(null);
      } finally {
        setLoading(false);
      }
    }
    loadSurvey();
  }, [id]);

  const componentList = useMemo(() => survey?.componentList ?? [], [survey]);

  const pageComponents = useMemo(
    () => componentList.filter((c) => c.page === currentPage),
    [componentList, currentPage],
  );

  const questionIndexOffset = useMemo(
    () =>
      // 题号只数"可作答且可见"的题目，展示类组件（标题/段落/信息）不占题号
      componentList.filter(
        (c) => c.page < currentPage && !c.isHidden && isAnswerable(c.type),
      ).length,
    [componentList, currentPage],
  );

  const progress = useMemo(() => {
    if (!survey?.pageTotal) return 0;
    return Math.round((currentPage / survey.pageTotal) * 100);
  }, [survey, currentPage]);

  // 加载中
  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 加载失败
  if (!survey) {
    return (
      <PreviewErrorPage
        title={t((m) => m.survey.previewLoadFailed)}
        desc={t((m) => m.survey.previewLoadFailedDesc)}
        onBack={() => router.push("/workspace")}
        t={t}
      />
    );
  }

  // 无题目
  if (componentList.length === 0) {
    return (
      <PreviewErrorPage
        title={t((m) => m.survey.previewNoQuestions)}
        desc={t((m) => m.survey.previewNoQuestionsDesc)}
        onBack={() => router.push(`/editor/${id}`)}
        t={t}
      />
    );
  }

  function handleNext() {
    if (currentPage < survey!.pageTotal) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handlePrev() {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const isLastPage = currentPage >= survey.pageTotal;

  let questionIndex = 0;

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      {/* 顶部预览标识栏 */}
      <div className="bg-amber-500/15 border-b border-amber-200 sticky top-0 z-20">
        <div className="mx-auto max-w-2xl h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="size-4 text-amber-600 dark:text-amber-300" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
              {t((m) => m.survey.previewBadge)}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-300 hidden sm:inline">
              {t((m) => m.survey.previewHint)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-300 hover:bg-amber-500/20"
            onClick={() => router.push(`/editor/${id}`)}
          >
            <Pencil className="size-3.5" />
            {t((m) => m.survey.editInEditor)}
          </Button>
        </div>
        {survey.pageTotal > 1 && (
          <div className="h-0.5 bg-amber-500/20">
            <div
              className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex items-start justify-center px-3 sm:px-6 py-4 sm:py-6">
        <div className="w-full max-w-2xl">
          <div className="bg-card rounded-lg border border-border">
            {/* 问卷标题区 */}
            {currentPage === 1 && (
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-border">
                <h1 className="text-base sm:text-lg font-semibold text-foreground">
                  {survey.title || t((m) => m.survey.surveyDefaultName)}
                </h1>
                {survey.desc && (
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {survey.desc}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="size-3.5" />
                    {format(t((m) => m.survey.pagesTotal), { total: survey.pageTotal })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {t((m) => m.survey.estimatedTime)}
                  </span>
                </div>
              </div>
            )}

            {/* 题目区 */}
            <div className="px-4 sm:px-6 py-4 sm:py-5">
              {survey.pageTotal > 1 && currentPage !== 1 && (
                <div className="mb-4 text-xs text-muted-foreground">
                  {format(t((m) => m.survey.pageProgress), {
                    current: currentPage,
                    total: survey.pageTotal,
                  })}
                </div>
              )}

              <div>
                {pageComponents.map((comp) => {
                  if (comp.isHidden) return null;
                  const isAnswerableType = isAnswerable(comp.type);
                  const idx = isAnswerableType
                    ? ++questionIndex + questionIndexOffset
                    : 0;
                  return (
                    <AnswerQuestionRenderer
                      key={comp.feUuid}
                      type={comp.type}
                      props={comp.props as never}
                      value={answers[comp.feUuid] || { type: "none" }}
                      onChange={(v: AnswerValue) =>
                        setAnswers((prev) => ({ ...prev, [comp.feUuid]: v }))
                      }
                      index={idx}
                    />
                  );
                })}
              </div>
            </div>

            {/* 底部操作栏 —— 翻页 + 末页禁用提交按钮 */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-muted border-t border-border grid grid-cols-3 items-center gap-2">
              <div className="flex justify-start">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className="gap-1 shrink-0"
                  size="sm"
                >
                  <ChevronLeft className="size-4" />
                  <span>{t((m) => m.survey.prevPage)}</span>
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center truncate min-w-0">
                {isLastPage ? (
                  <span className="flex items-center justify-center gap-1">
                    <CheckCircle2 className="size-3.5" />
                    {t((m) => m.survey.previewEndOfSurvey)}
                  </span>
                ) : (
                  format(t((m) => m.survey.pageProgress), {
                    current: currentPage,
                    total: survey.pageTotal,
                  })
                )}
              </div>

              <div className="flex justify-end">
                {isLastPage ? (
                  <Button
                    disabled
                    className="gap-1.5 shrink-0"
                    size="sm"
                  >
                    <CheckCircle2 className="size-4" />
                    {t((m) => m.survey.submitSurvey)}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="gap-1 shrink-0"
                    size="sm"
                  >
                    <span>{t((m) => m.survey.nextPage)}</span>
                    <ChevronRight className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <p className="mt-3 sm:mt-4 text-center text-xs text-amber-400">
            {t((m) => m.survey.previewHint)}
          </p>
        </div>
      </div>

      <footer className="pb-6 pt-4 text-center text-xs text-muted-foreground">
        Powered by Survey Web
      </footer>
    </div>
  );
}
