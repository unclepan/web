"use client";

import { useLocale } from "@/i18n/useLocale";
import type { Locale } from "@/i18n/types";
import { cn } from "@/lib/utils";

interface LocaleToggleProps {
  /** 按钮的唯一 id，桌面端 / 移动端需各传一份避免冲突 */
  id?: string;
  /** 外层 wrapper className，可在不同位置定制间距 */
  className?: string;
  /** 文字尺寸：sm(14px) | md(16px) | lg(18px)，默认 sm */
  size?: "sm" | "md" | "lg";
}

/**
 * 语言切换按钮 — 中英文互切（localStorage 持久化，不涉及路由）。
 *
 * 视觉上和 ThemeToggle 成一组「偏好」控件：两者都是
 * `flex flex-col justify-center` 外层包裹 + `p-2` 对称内边距，
 * 保证在导航里高度一致、基线对齐。
 */
export default function LocaleToggle({
  id,
  className = "flex flex-col justify-center",
  size = "sm",
}: LocaleToggleProps = {}) {
  const { locale, setLocale, t, ready } = useLocale();

  const textSize = { sm: "text-sm", md: "text-base", lg: "text-lg" }[size];

  // 水合前渲染同尺寸的占位，避免布局抖动
  if (!ready) {
    return (
      <div className={className}>
        <span
          className={cn(
            "block p-2 text-muted-foreground leading-none",
            textSize,
          )}
        >
          ··
        </span>
      </div>
    );
  }

  const next: Locale = locale === "en" ? "zh-CN" : "en";
  const label = locale === "en" ? "CN" : "EN";
  const hint =
    locale === "en"
      ? t((m) => m.common.switchToZh)
      : t((m) => m.common.switchToEn);

  return (
    <div className={className}>
      <button
        type="button"
        id={id}
        onClick={() => setLocale(next)}
        className={cn(
          "p-2 font-medium text-muted-foreground hover:text-foreground transition duration-150 ease-in-out leading-none",
          textSize,
        )}
        aria-label={hint}
        title={hint}
      >
        {label}
      </button>
    </div>
  );
}
