"use client";

/**
 * 站点个人中心（`/profile`）主体 —— 渲染在 marketing layout 内
 * （Header / main / Footer 由 layout 提供，Header 是 fixed，顶部间距在这里补）。
 *
 * 与工作区个人中心（`/workspace/profile`）共用 `ProfileUserCard` 左列；
 * 右列是「我的动态」—— blog / docs 的情绪反馈列表（见 `FeedbackList`）。
 */
import Link from "next/link";
import { Loader2, Lock } from "lucide-react";
import ProfileUserCard from "@/components/ProfileUserCard";
import FeedbackList from "./FeedbackList";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLocale } from "@/i18n/useLocale";

export default function ProfileContent() {
  const { user, loading } = useAuth();
  const { t } = useLocale();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-28 pb-16">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-28 pb-16">
        <div
          className="max-w-md mx-auto bg-card rounded-lg border border-border p-8 text-center"
          data-aos="fade-up"
        >
          <div className="size-14 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
            <Lock className="size-7 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            {t((m) => m.profile.loginRequiredTitle)}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t((m) => m.profile.loginRequiredDesc)}
          </p>
          <Link
            className="btn-sm inline-block mt-6 text-primary-foreground bg-primary hover:bg-primary/90"
            href="/signin"
          >
            {t((m) => m.nav.signIn)}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-28 pb-16">
      <div className="mb-6" data-aos="fade-up">
        <h1 className="text-2xl font-bold text-foreground">
          {t((m) => m.profile.title)}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t((m) => m.profile.desc)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 用户信息卡片 —— 与 /workspace/profile 共用 */}
        <div className="lg:col-span-1" data-aos="fade-up" data-aos-delay="100">
          <ProfileUserCard />
        </div>

        {/* 我的动态 —— blog / docs 的情绪反馈列表 */}
        <div className="lg:col-span-2" data-aos="fade-up" data-aos-delay="150">
          <FeedbackList />
        </div>
      </div>
    </div>
  );
}
