"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Plus, FileText, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { workApi } from "@/lib/api";
import type {
  WorkTemplateListItem,
  WorkTemplateDetail,
} from "@/lib/api/modules/work.types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useLocale, format } from "@/i18n/useLocale";
import AnswerQuestionRenderer from "@/components/survey/components/AnswerQuestionRenderer";
import {
  isAnswerable,
  createEmptyAnswer,
} from "@/components/survey/hooks/useSurveyAnswers";
import type { SurveyComponent, AnswerValue } from "@/lib/survey-types";

// 默认封面渐变（按 id 哈希固定）
const COVERS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-purple-500 to-pink-600",
  "from-rose-500 to-red-600",
  "from-cyan-500 to-blue-600",
];

/** 模板内容预览弹窗：复用答题端渲染器，只读展示，答案不落库 */
function TemplatePreviewDialog({
  templateId,
  open,
  onOpenChange,
}: {
  templateId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<WorkTemplateDetail | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!open || templateId == null) return;
    setLoading(true);
    setLoadError(false);
    setDetail(null);
    workApi
      .templateDetail(templateId)
      .then(setDetail)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [open, templateId]);

  const componentList = useMemo<SurveyComponent[]>(() => {
    const content = detail?.content as
      | { componentList?: SurveyComponent[] }
      | undefined;
    return (content?.componentList ?? []).filter((c) => !c.isHidden);
  }, [detail]);

  const answerableCount = useMemo(
    () => componentList.filter((c) => isAnswerable(c.type)).length,
    [componentList]
  );

  // 空答案，仅用于渲染（预览可交互但不提交）
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  useEffect(() => {
    const initial: Record<string, AnswerValue> = {};
    for (const comp of componentList) {
      if (isAnswerable(comp.type)) {
        initial[comp.feUuid] = createEmptyAnswer(comp.type);
      }
    }
    setAnswers(initial);
  }, [componentList]);

  let questionIndex = 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border">
          <DialogTitle className="truncate">
            {detail?.name ?? t((m) => m.workspace.previewTemplateTitle)}
          </DialogTitle>
          <DialogDescription>
            {t((m) => m.workspace.previewTemplateDesc)}
            {answerableCount > 0 && (
              <span className="ml-2 text-muted-foreground">
                {format(t((m) => m.workspace.questionCount), {
                  count: answerableCount,
                })}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 bg-muted/50">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : loadError ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              {t((m) => m.workspace.previewTemplateLoadFailed)}
            </div>
          ) : componentList.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              {t((m) => m.workspace.noTemplates)}
            </div>
          ) : (
            <div>
              {componentList.map((comp) => {
                const idx = isAnswerable(comp.type) ? ++questionIndex : 0;
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TemplateCard({
  template,
  onPreview,
}: {
  template: WorkTemplateListItem;
  onPreview: (id: number) => void;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const cover = COVERS[template.id % COVERS.length];

  const handleUse = async () => {
    try {
      const work = await workApi.createFromTemplate(template.id);
      toast.success(t((m) => m.workspace.createdFromTemplateToast));
      router.push(`/editor/${work.id}`);
    } catch {
      toast.error(t((m) => m.workspace.createFailedToast2));
    }
  };

  return (
    <div className="group bg-card rounded-lg border border-border overflow-hidden transition-shadow hover:shadow-md">
      {/* 封面：悬停出现预览入口 */}
      <div
        className={`h-32 bg-gradient-to-br ${cover} relative flex items-center justify-center`}
      >
        <FileText className="size-10 text-white/80" />
        <button
          type="button"
          onClick={() => onPreview(template.id)}
          className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/40 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          <Eye className="size-4" />
          {t((m) => m.workspace.previewBtn)}
        </button>
      </div>

      {/* 内容 */}
      <div className="p-5">
        <h3 className="text-base font-medium text-foreground truncate">{template.name}</h3>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {format(t((m) => m.workspace.createdBy), { name: template.createUser?.username ?? t((m) => m.workspace.systemUser) })}
        </p>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>{format(t((m) => m.workspace.usageCount), { count: template.usageCount })}</span>
          <span>{new Date(template.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => onPreview(template.id)}
          >
            <Eye className="size-4" />
            {t((m) => m.workspace.previewBtn)}
          </Button>
          <Button size="sm" className="flex-1 gap-1.5" onClick={handleUse}>
            <Plus className="size-4" />
            {t((m) => m.workspace.useTemplateBtn)}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const { t } = useLocale();
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  });
  const [templates, setTemplates] = useState<WorkTemplateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    workApi.templateList()
      .then((list) => {
        setTemplates(list);
        setLoading(false);
      })
      .catch(() => {
        toast.error(tRef.current((m) => m.workspace.loadTemplatesFailedToast));
        setLoading(false);
      });
    // 仅挂载时拉取一次；t 通过 ref 读取，避免语言初始化触发重复请求
  }, []);

  const handlePreview = (id: number) => {
    setPreviewId(id);
    setPreviewOpen(true);
  };

  return (
    <div>
      <div className="mb-6" data-aos="fade-up">
        <h1 className="text-2xl font-bold text-foreground">{t((m) => m.workspace.templatesTitle)}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t((m) => m.workspace.templatesDesc)}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : templates.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t, i) => (
            <div key={t.id} data-aos="fade-up" data-aos-delay={String(i * 50)}>
              <TemplateCard template={t} onPreview={handlePreview} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center" data-aos="fade-up">
          <div className="size-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="size-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">{t((m) => m.workspace.noTemplates)}</p>
          <p className="text-xs text-muted-foreground">{t((m) => m.workspace.noTemplatesDesc)}</p>
        </div>
      )}

      <TemplatePreviewDialog
        templateId={previewId}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
}
