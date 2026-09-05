"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Rocket, Copy, Check, ExternalLink, Settings2, CalendarIcon, X, Loader2, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { workApi } from "@/lib/api";
import type { PublishSettings } from "@/lib/api";
import { useLocale } from "@/i18n/useLocale";
import { format as formatTemplate } from "@/i18n/locale-utils";

type PublishDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workId: number;
  surveyTitle: string;
};

type Step = "settings" | "success";

export default function PublishDialog({
  open,
  onOpenChange,
  workId,
  surveyTitle,
}: PublishDialogProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [step, setStep] = useState<Step>("settings");
  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // 发布设置
  const [requireLogin, setRequireLogin] = useState(false);
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [maxResponses, setMaxResponses] = useState("0");
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [showPublicResults, setShowPublicResults] = useState(false);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/s/${workId}` : "";

  async function handlePublish() {
    setPublishing(true);
    try {
      // 截止日期按"当天 23:59:59"生效：日历选的是哪一天，就包含哪一天
      const deadlineEndOfDay = deadline
        ? new Date(deadline).setHours(23, 59, 59, 999)
        : undefined;
      const settings: PublishSettings = {
        requireLogin,
        deadline: deadlineEndOfDay,
        maxCount: Number(maxResponses) || 0,
        showProgress: showProgressBar,
        showPublicResults,
      };

      await workApi.publish(workId, { settings });
      setStep("success");
      toast.success(t((m) => m.editor.publishSuccess));
    } catch {
      toast.error(t((m) => m.editor.publishFailed));
    } finally {
      setPublishing(false);
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(t((m) => m.editor.copiedToClipboard));
  }

  function handleClose() {
    onOpenChange(false);
    // 重置状态
    setTimeout(() => {
      setStep("settings");
      setCopied(false);
    }, 300);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-[480px]">
        {step === "settings" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Rocket className="size-5 text-blue-600 dark:text-blue-300" />
                {t((m) => m.editor.publishSurvey)}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* 答题权限 —— 核心设置 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <UserCheck className="size-4" />
                  {t((m) => m.editor.answerPermission)}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRequireLogin(false)}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition-colors",
                      !requireLogin
                        ? "border-blue-500 bg-blue-500/15"
                        : "border-border hover:border-border",
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <UserX className="size-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{t((m) => m.editor.noLoginRequired)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{t((m) => m.editor.noLoginRequiredDesc)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequireLogin(true)}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition-colors",
                      requireLogin
                        ? "border-blue-500 bg-blue-500/15"
                        : "border-border hover:border-border",
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="size-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{t((m) => m.editor.loginRequired)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{t((m) => m.editor.loginRequiredDesc)}</span>
                  </button>
                </div>
              </div>

              {/* 收集规则 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Settings2 className="size-4" />
                  {t((m) => m.editor.collectionRules)}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">{t((m) => m.editor.deadline)}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "mt-1 h-9 w-full justify-between text-left font-normal",
                            !deadline && "text-muted-foreground",
                          )}
                        >
                          {deadline ? format(deadline, "yyyy-MM-dd") : <span>{t((m) => m.editor.selectDate)}</span>}
                          {deadline ? (
                            <span
                              className="ml-2 rounded-full p-0.5 hover:bg-muted"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeadline(undefined);
                              }}
                            >
                              <X className="size-3.5" />
                            </span>
                          ) : (
                            <CalendarIcon className="size-4" />
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={deadline}
                          onSelect={setDeadline}
                          defaultMonth={deadline}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">{t((m) => m.editor.maxResponses)}</Label>
                    <Input
                      type="number"
                      value={maxResponses}
                      onChange={(e) => setMaxResponses(e.target.value)}
                      className="mt-1 h-9"
                      placeholder={t((m) => m.editor.maxResponsesPlaceholder)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={showProgressBar}
                      onCheckedChange={(v) => setShowProgressBar(v === true)}
                    />
                    <span className="text-sm text-foreground">{t((m) => m.editor.showProgressBar)}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={showPublicResults}
                      onCheckedChange={(v) => setShowPublicResults(v === true)}
                    />
                    <span className="text-sm text-foreground">{t((m) => m.editor.showPublicResults)}</span>
                  </label>
                </div>
              </div>

              {/* 提示 */}
              <div className="rounded-lg bg-blue-500/15 px-3 py-2 text-xs text-blue-600 dark:text-blue-300">
                {requireLogin
                  ? t((m) => m.editor.publishTipLogin)
                  : t((m) => m.editor.publishTipNoLogin)}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>{t((m) => m.editor.cancel)}</Button>
              <Button onClick={handlePublish} disabled={publishing} className="gap-1.5">
                {publishing ? <Loader2 className="size-4 animate-spin" /> : <Rocket className="size-4" />}
                {t((m) => m.editor.confirmPublish)}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "success" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="size-5 text-green-600 dark:text-green-300" />
                </div>
                {t((m) => m.editor.surveyPublished)}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                {formatTemplate(t((m) => m.editor.publishSuccess), { surveyTitle })}
              </p>

              {/* 分享链接 */}
              <div>
                <Label className="text-xs text-muted-foreground">{t((m) => m.editor.shareLink)}</Label>
                <div className="mt-1 flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="flex-1 h-9 text-sm text-muted-foreground"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="shrink-0 gap-1.5"
                  >
                    {copied ? <Check className="size-4 text-green-600 dark:text-green-300" /> : <Copy className="size-4" />}
                    {copied ? t((m) => m.editor.copied) : t((m) => m.editor.copy)}
                  </Button>
                </div>
              </div>

              {/* 快捷操作 */}
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => window.open(`/s/preview/${workId}`, "_blank")}
                >
                  <ExternalLink className="size-4" />
                  {t((m) => m.editor.preview)}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => window.open(`/share/${workId}`, "_blank")}
                >
                  <ExternalLink className="size-4" />
                  {t((m) => m.editor.openSharePage)}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => router.push(`/workspace/stats/${workId}`)}
                >
                  <ExternalLink className="size-4" />
                  {t((m) => m.editor.viewStats)}
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">{t((m) => m.editor.done)}</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
