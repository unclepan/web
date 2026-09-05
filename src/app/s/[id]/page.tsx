"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  use,
} from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  FileText,
  Ban,
  Loader2,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { workApi, answerApi } from "@/lib/api";
import type { PublishedWork, PublishSettings } from "@/lib/api";
import {
  useSurveyAnswers,
  isAnswerable,
  isAnswerEmpty,
  markSurveySubmitted,
  clearSurveyDraft,
  saveSurveyAnswered,
} from "@/components/survey/hooks/useSurveyAnswers";
import AnswerQuestionRenderer from "@/components/survey/components/AnswerQuestionRenderer";
import type { SurveyDocument, SurveySettings, AnswerValue } from "@/lib/survey-types";
import { toast } from "sonner";
import { useLocale, format } from "@/i18n/useLocale";
import { useAuth } from "@/lib/auth/AuthContext";

/** 将 API 返回的 PublishedWork 转换为 SurveyDocument */
function publishedWorkToSurvey(work: PublishedWork): SurveyDocument | null {
  if (!work.publishedContent) return null;

  const content = work.publishedContent as {
    title?: string;
    desc?: string;
    componentList?: SurveyDocument["componentList"];
    pageTotal?: number;
  };

  const settings: PublishSettings = (work.settings ?? { requireLogin: false }) as PublishSettings;

  // 映射 PublishSettings → SurveySettings
  const surveySettings: SurveySettings = {
    showProgressBar: settings.showProgress,
    showPublicResults: settings.showPublicResults,
    maxResponses: settings.maxCount,
    deadline: settings.deadline ? new Date(settings.deadline).toISOString() : undefined,
  };

  return {
    id: String(work.id),
    title: content.title ?? work.name ?? "问卷",
    desc: content.desc ?? "",
    status: work.isStopped ? "stopped" : "published",
    pageTotal: content.pageTotal ?? 1,
    componentList: content.componentList ?? [],
    publishedAt: work.publishedAt ?? "",
    updatedAt: work.publishedAt ?? "",
    responseCount: 0,
    settings: surveySettings,
  };
}

function StatusPage({
  icon,
  title,
  desc,
  actions,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full bg-card rounded-lg border border-border p-6 sm:p-8">
        <div className="flex justify-center mb-4">{icon}</div>
        <h1 className="text-lg font-semibold text-foreground mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground mb-6">{desc}</p>
        <div className="flex flex-col gap-2">{actions}</div>
      </div>
    </div>
  );
}

const FALLBACK_SURVEY: SurveyDocument = {
  id: "",
  title: "",
  desc: "",
  status: "stopped",
  pageTotal: 0,
  componentList: [],
  publishedAt: "",
  updatedAt: "",
  responseCount: 0,
  settings: {},
};

export default function SurveyAnswerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useLocale();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [survey, setSurvey] = useState<SurveyDocument | null>(null);
  const [requireLogin, setRequireLogin] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const startTimeRef = useRef(0);
  const [duration, setDuration] = useState(0);

  // 加载问卷
  useEffect(() => {
    async function loadSurvey() {
      try {
        const work = await workApi.findPublished(Number(id));
        if (!work || !work.isPublish) {
          setSurvey(null);
          return;
        }
        const settings = (work.settings ?? { requireLogin: false }) as PublishSettings;
        setRequireLogin(!!settings.requireLogin);

        const doc = publishedWorkToSurvey(work);
        // 截止时间校验（加载时判定一次即可，避免渲染期调用 Date.now）
        if (doc?.settings.deadline) {
          const dl = new Date(doc.settings.deadline).getTime();
          if (!Number.isNaN(dl) && Date.now() > dl) {
            setIsExpired(true);
          }
        }
        setSurvey(doc);
      } catch {
        setSurvey(null);
      } finally {
        setLoading(false);
      }
    }
    loadSurvey();
  }, [id]);

  const effectiveSurvey = survey || FALLBACK_SURVEY;

  const {
    answers,
    errors,
    updateAnswer,
    validatePage,
    validateAll,
    shuffledComponentList,
  } = useSurveyAnswers(effectiveSurvey, { user, authLoading });

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (submitted || !survey) return;
    const hasContent = Object.values(answers).some((a) => !isAnswerEmpty(a));
    if (!hasContent) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [answers, submitted, survey]);

  const componentList = shuffledComponentList;

  const pageComponents = useMemo(() => {
    return componentList.filter((c) => c.page === currentPage);
  }, [componentList, currentPage]);

  const questionIndexOffset = useMemo(() => {
    // 题号只数"可作答且可见"的题目，展示类组件（标题/段落/信息）不占题号
    return componentList.filter(
      (c) => c.page < currentPage && !c.isHidden && isAnswerable(c.type),
    ).length;
  }, [componentList, currentPage]);

  const progress = useMemo(() => {
    if (!effectiveSurvey.pageTotal) return 0;
    return Math.round((currentPage / effectiveSurvey.pageTotal) * 100);
  }, [effectiveSurvey, currentPage]);

  const answeredCount = useMemo(() => {
    // 只统计当前可见题目的已答数（隐藏题不计入）
    const visibleUuids = new Set(
      componentList.filter((c) => !c.isHidden).map((c) => c.feUuid),
    );
    return Object.entries(answers).filter(
      ([uuid, a]) => visibleUuids.has(uuid) && !isAnswerEmpty(a),
    ).length;
  }, [answers, componentList]);

  // 加载中（问卷数据或认证信息还在加载）
  if (loading || (requireLogin && authLoading)) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 问卷不存在或未发布
  if (!survey) {
    return (
      <StatusPage
        icon={<FileText className="size-10 text-muted-foreground" />}
        title={t((m) => m.survey.surveyNotFound)}
        desc={t((m) => m.survey.surveyNotFoundDesc)}
        actions={<Button onClick={() => router.push("/")}>{t((m) => m.survey.backToHome)}</Button>}
      />
    );
  }

  // 需要登录但未登录（AuthContext 已完成加载，user 为空则未登录）
  if (requireLogin && !user) {
    return (
      <StatusPage
        icon={<UserCheck className="size-10 text-blue-400" />}
        title={t((m) => m.survey.loginRequiredTitle)}
        desc={t((m) => m.survey.loginRequiredDesc)}
        actions={
          <>
            <Button onClick={() => router.push(`/login?redirect=/s/${id}`)}>
              {t((m) => m.survey.goLogin)}
            </Button>
            <Button variant="ghost" onClick={() => router.push("/")}>
              {t((m) => m.survey.backToHome)}
            </Button>
          </>
        }
      />
    );
  }

  // 已停止收集
  if (survey.status === "stopped") {
    return (
      <StatusPage
        icon={<Ban className="size-10 text-amber-500" />}
        title={t((m) => m.survey.surveyStoppedTitle)}
        desc={t((m) => m.survey.surveyStoppedDesc)}
        actions={<Button variant="ghost" onClick={() => router.push("/")}>{t((m) => m.survey.backToHome)}</Button>}
      />
    );
  }

  // 已过截止时间（发布设置中的 deadline 需要真正生效）
  if (isExpired) {
    return (
      <StatusPage
        icon={<Clock className="size-10 text-amber-500" />}
        title={t((m) => m.survey.surveyDeadlineTitle)}
        desc={t((m) => m.survey.surveyDeadlineDesc)}
        actions={<Button variant="ghost" onClick={() => router.push("/")}>{t((m) => m.survey.backToHome)}</Button>}
      />
    );
  }

  // 提交成功
  if (submitted) {
    return (
      <StatusPage
        icon={<CheckCircle2 className="size-10 text-green-500" />}
        title={t((m) => m.survey.submitSuccess)}
        desc={survey.settings.thankYouText || t((m) => m.survey.thankYouDefault)}
        actions={
          <>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground py-2">
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {format(t((m) => m.survey.durationValue), { value: `${Math.floor(duration / 60)}′${duration % 60}″` })}
              </span>
              <span className="flex items-center gap-1">
                <FileText className="size-3.5" />
                {format(t((m) => m.survey.pagesTotal), { total: survey.pageTotal })}
              </span>
            </div>
            {survey.settings.showPublicResults && (
              <Button
                variant="outline"
                onClick={() => router.push(`/share/${survey.id}`)}
              >
                {t((m) => m.survey.viewStatsResults)}
              </Button>
            )}
            <Button variant="ghost" onClick={() => router.push("/")}>
              {t((m) => m.survey.closeBtn)}
            </Button>
          </>
        }
      />
    );
  }

  function handleNext() {
    const result = validatePage(currentPage, componentList);
    if (!result.valid) return;
    if (currentPage < effectiveSurvey.pageTotal) {
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

  async function handleSubmit() {
    const result = validateAll(componentList);
    if (!result.valid) {
      const firstErrorUuid = Object.keys(result.errors)[0];
      const errorComp = componentList.find((c) => c.feUuid === firstErrorUuid);
      if (errorComp) {
        setCurrentPage(errorComp.page);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    setSubmitting(true);
    const submitDuration = Math.round((Date.now() - startTimeRef.current) / 1000);

    try {
      await answerApi.add({
        workId: Number(survey!.id),
        content: answers as Record<string, unknown>,
        duration: submitDuration,
      });

      markSurveySubmitted(survey!.id);
      // 保存已提交答卷快照（未登录用户回显用；登录用户以服务器为准，此快照仅做备份）
      saveSurveyAnswered(survey!.id, answers);
      clearSurveyDraft(survey!.id);
      setDuration(submitDuration);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error(t((m) => m.survey.submitFailed));
    } finally {
      setSubmitting(false);
    }
  }

  let questionIndex = 0;

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      {/* 顶部导航栏 */}
      <div className="bg-card border-b border-border sticky top-0 z-20">
        <div className="mx-auto max-w-2xl h-12 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{t((m) => m.survey.surveyFillTitle)}</span>
          {survey.pageTotal > 1 && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {format(t((m) => m.survey.pageProgress), { current: currentPage, total: survey.pageTotal })}
            </span>
          )}
        </div>
        {survey.settings.showProgressBar !== false && (
          <div className="h-0.5 bg-muted">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
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
                  {survey.title}
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
                  {requireLogin && (
                    <span className="flex items-center gap-1 text-blue-500">
                      <UserCheck className="size-3.5" />
                      {t((m) => m.survey.loginToAnswer)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 题目区 */}
            <div className="px-4 sm:px-6 py-4 sm:py-5">
              {survey.pageTotal > 1 && currentPage !== 1 && (
                <div className="mb-4 text-xs text-muted-foreground">
                  {format(t((m) => m.survey.pageProgress), { current: currentPage, total: survey.pageTotal })}
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
                        updateAnswer(comp.feUuid, v)
                      }
                      error={errors[comp.feUuid]}
                      index={idx}
                    />
                  );
                })}
              </div>
            </div>

            {/* 底部操作栏 */}
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
                {format(t((m) => m.survey.answeredCount), { count: answeredCount })}
              </div>

              <div className="flex justify-end">
                {currentPage < survey.pageTotal ? (
                  <Button
                    onClick={handleNext}
                    className="gap-1 shrink-0"
                    size="sm"
                  >
                    <span>{t((m) => m.survey.nextPage)}</span>
                    <ChevronRight className="size-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="gap-1.5 shrink-0"
                    size="sm"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        {t((m) => m.survey.submittingBtn)}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-4" />
                        {t((m) => m.survey.submitSurvey)}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <p className="mt-3 sm:mt-4 text-center text-xs text-muted-foreground">
            {t((m) => m.survey.autoSaveHint)}
          </p>
        </div>
      </div>

      <footer className="pb-6 pt-4 text-center text-xs text-muted-foreground">
        Powered by Survey Web
      </footer>
    </div>
  );
}
