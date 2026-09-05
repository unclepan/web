"use client";

/**
 * Feedback —— 文章四档情绪反馈
 *
 * 协议（后端 `apps/docs`）：`(userId, articleId)` 唯一，一名用户一篇文章只允许一态。
 *   - 未表态 + 点击 → 创建
 *   - 异 kind 点击   → 切换
 *   - 同 kind 再点   → 撤回（服务端返回 kind: null）
 *
 * 两个接口都要登录，但本组件挂在**公开**详情页上，所以：
 *   1. 未登录时按钮全禁用并给出「登录后评价」提示，不发任何请求；
 *   2. 状态查询额外带 `silentAuth`，双保险，避免匿名访客被弹到 /signin。
 */
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useLocale } from "@/i18n/useLocale";
import { docsApi } from "@/lib/api";
import type { FeedbackKind } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth/token";
import { useAuth } from "@/lib/auth/AuthContext";

/**
 * 四档情绪元信息，顺序与后端枚举语义一致：负面 → 正面。
 *
 * 导出供「个人中心 → 我的动态」列表复用（`FeedbackList`）：图标与文案的映射
 * 只留这一份，将来加档位不会漏改。
 */
export const FEEDBACK_META: ReadonlyArray<{ kind: FeedbackKind; src: string; labelKey: "feedbackNotHelpful" | "feedbackConfused" | "feedbackGood" | "feedbackExcellent" }> = [
  { kind: "NOT_HELPFUL", src: "/images/feedback-01.svg", labelKey: "feedbackNotHelpful" },
  { kind: "CONFUSED", src: "/images/feedback-02.svg", labelKey: "feedbackConfused" },
  { kind: "GOOD", src: "/images/feedback-03.svg", labelKey: "feedbackGood" },
  { kind: "EXCELLENT", src: "/images/feedback-04.svg", labelKey: "feedbackExcellent" },
];

export default function Feedback({ articleUuid }: { articleUuid: string }) {
  const { t } = useLocale();
  // user 来自 AuthContext（异步）；isLoggedIn() 读 cookie（同步），两者结合
  // 避免刷新后短暂未拿到 user 就判定成未登录
  const { user } = useAuth();
  const authed = !!user && isLoggedIn();

  const [kind, setKind] = useState<FeedbackKind | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 查询当前表态
  useEffect(() => {
    if (!authed || !articleUuid) return;
    let cancelled = false;
    setLoading(true);
    docsApi
      .feedbackStatus(articleUuid)
      .then((data) => {
        if (!cancelled) setKind(data.kind);
      })
      .catch((err) => console.error("[Feedback] 状态查询失败:", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authed, articleUuid]);

  /** 乐观更新：同 kind → 撤回(null)，否则 → next；失败则回查服务端真值 */
  const toggle = useCallback(
    async (next: FeedbackKind) => {
      if (!authed || !articleUuid || submitting) return;
      setSubmitting(true);
      setKind((current) => (current === next ? null : next));

      try {
        const data = await docsApi.toggleFeedback(articleUuid, next);
        setKind(data.kind);
      } catch (err) {
        console.error("[Feedback] 提交失败:", err);
        try {
          setKind((await docsApi.feedbackStatus(articleUuid)).kind);
        } catch {
          setKind(null);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [articleUuid, authed, submitting],
  );

  const disabled = !authed || !articleUuid || submitting || loading;

  return (
    <div
      className={`flex items-center justify-between gap-6 py-8 border-b border-border ${
        !authed ? "opacity-80" : ""
      }`}
    >
      <div className="text-lg font-bold">
        {t((m) => m.blog.feedbackTitle)}
        {!authed && (
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {t((m) => m.blog.feedbackSignInHint)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {FEEDBACK_META.map(({ kind: buttonKind, src, labelKey }) => {
          const label = t((m) => m.blog[labelKey]);
          const active = authed && kind === buttonKind;
          const title = authed
            ? label
            : t((m) => m.blog.feedbackSignInTitle);
          return (
            <button
              key={buttonKind}
              type="button"
              onClick={() => {
                if (disabled) return;
                void toggle(buttonKind);
              }}
              disabled={disabled}
              aria-pressed={active}
              aria-label={label}
              title={title}
              className={`transition-opacity ${
                active ? "opacity-100" : "opacity-30"
              } ${disabled ? "cursor-not-allowed" : "hover:opacity-100"}`}
            >
              {/* SVG 走 next/image 优化会被拦（默认关闭 dangerouslyAllowSVG），故 unoptimized */}
              <Image src={src} width={21} height={21} alt={label} unoptimized />
            </button>
          );
        })}
      </div>
    </div>
  );
}
