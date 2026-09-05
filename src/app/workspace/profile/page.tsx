"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FileText, LogOut, Loader2, Eye } from "lucide-react";
import { answerApi } from "@/lib/api";
import type { MyAnsweredItem } from "@/lib/api";
import { useAuth } from "@/lib/auth/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ProfileUserCard from "@/components/ProfileUserCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLocale, format } from "@/i18n/useLocale";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const { t } = useLocale();
  const [logoutOpen, setLogoutOpen] = useState(false);

  // tRef 用于在 useEffect 闭包中安全访问最新的 t
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  // 已回答问卷列表
  const [answered, setAnswered] = useState<MyAnsweredItem[]>([]);
  const [answeredLoading, setAnsweredLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setAnsweredLoading(true);
    answerApi
      .myAnswered(1, 50)
      .then((res) => {
        if (!cancelled) setAnswered(res.list ?? []);
      })
      .catch(() => {
        if (!cancelled)
          toast.error(tRef.current((m) => m.workspace.loadAnsweredFailedToast));
      })
      .finally(() => {
        if (!cancelled) setAnsweredLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div>
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6"
        data-aos="fade-up"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t((m) => m.workspace.profileTitle)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t((m) => m.workspace.profileDesc)}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setLogoutOpen(true)}
          className="text-red-600 dark:text-red-300 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-500/15 border-red-200 gap-1.5"
        >
          <LogOut className="size-4" />
          {t((m) => m.workspace.logoutBtn)}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 用户信息卡片 */}
        <div className="lg:col-span-1" data-aos="fade-up" data-aos-delay="100">
          <ProfileUserCard />
        </div>

        {/* 已回答问卷列表 */}
        <div
          className="lg:col-span-2 bg-card rounded-lg border border-border p-6"
          data-aos="fade-up"
          data-aos-delay="150"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{t((m) => m.workspace.answeredSurveysTitle)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t((m) => m.workspace.answeredSurveysDesc)}</p>
            </div>
          </div>

          {answeredLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : answered.length > 0 ? (
            <div className="space-y-3">
              {answered.map((item) => (
                <div
                  key={item.workId}
                  className="group flex items-center gap-4 p-4 rounded-lg border border-border transition-shadow hover:shadow-sm"
                >
                  <div className="size-10 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                    <FileText className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/s/${item.workId}`}
                      className="font-medium text-foreground truncate hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                    >
                      {item.workName || t((m) => m.workspace.untitledSurvey)}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        {t((m) => m.workspace.answeredAtLabel)}
                        {new Date(item.answeredAt).toLocaleDateString("zh-CN")}
                      </span>
                      {item.duration > 0 && (
                        <span>
                          {t((m) => m.workspace.durationLabel)}
                          {item.duration}s
                        </span>
                      )}
                      {item.score > 0 && (
                        <span>
                          {t((m) => m.workspace.scoreLabel)}
                          {item.score}
                        </span>
                      )}
                      {item.answerCount > 1 && (
                        <span>
                          {format(t((m) => m.workspace.answeredCountLabel), {
                            count: item.answerCount,
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-1"
                    onClick={() => window.open(`/s/${item.workId}`, "_blank")}
                  >
                    <Eye className="size-3.5" />
                    {t((m) => m.workspace.viewOrReanswerBtn)}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="size-14 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="size-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">{t((m) => m.workspace.noAnsweredSurveys)}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                <Link href="/" className="text-blue-600 dark:text-blue-300 hover:underline">
                  {t((m) => m.workspace.goBrowse)}
                </Link>{" "}
                {t((m) => m.workspace.startFilling)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 退出登录确认 */}
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t((m) => m.workspace.logoutDialogTitle)}</DialogTitle>
            <DialogDescription>
              {t((m) => m.workspace.logoutDialogDesc)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>
              {t((m) => m.workspace.cancelBtn)}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setLogoutOpen(false);
                logout();
              }}
            >
              <LogOut className="size-4" />
              {t((m) => m.workspace.logoutBtn)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}