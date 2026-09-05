"use client";

/**
 * LoginRequiredBadge —— 「需登录」角标
 *
 * 只服务于**匿名访客**：已登录用户看得见正文，角标毫无意义，因此
 * 登录态加载中或已登录时一律不渲染（避免首屏闪一下再消失）。
 *
 * 登录态取自 `useAuth()`（web 的 AuthContext），而不是单独打一次 /user/me。
 */
import { Lock } from "lucide-react";
import { useLocale } from "@/i18n/useLocale";
import { useAuth } from "@/lib/auth/AuthContext";
import { Badge } from "@/components/ui/badge";

interface LoginRequiredBadgeProps {
  /** tag = 带文字的 Badge；icon = 仅锁图标（标题行内用，避免挤占换行） */
  variant?: "icon" | "tag";
  className?: string;
}

export default function LoginRequiredBadge({
  variant = "tag",
  className,
}: LoginRequiredBadgeProps) {
  const { t } = useLocale();
  const { user, loading } = useAuth();

  if (loading || user) return null;

  const ariaLabel = t((m) => m.home.loginRequiredBadge);

  if (variant === "icon") {
    return (
      <span
        aria-label={ariaLabel}
        title={ariaLabel}
        className={`inline-flex text-amber-600 dark:text-amber-400 ${className ?? ""}`}
      >
        <Lock aria-hidden="true" className="size-3.5" />
      </span>
    );
  }

  return (
    <Badge
      variant="secondary"
      aria-label={ariaLabel}
      className={`bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 ${className ?? ""}`}
    >
      <Lock aria-hidden="true" />
      <span>{ariaLabel}</span>
    </Badge>
  );
}
