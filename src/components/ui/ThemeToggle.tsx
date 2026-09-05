"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useLocale } from "@/i18n/useLocale";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  /** input 的唯一 id，桌面端/移动端需各传一份避免 label 关联冲突 */
  id?: string;
  className?: string;
  /** 图标尺寸：sm(16px) | md(20px) | lg(24px)，默认 sm */
  size?: "sm" | "md" | "lg";
  /** 图标样式：filled(填充) | outline(线性)，默认 filled */
  variant?: "filled" | "outline";
}

/**
 * 暗色模式切换按钮 — Sun / Moon 图标互斥显示。
 *
 * 图标的显隐完全由 CSS 的 `dark:` 变体（即 html.dark）决定，不依赖 JS state，
 * 因此首屏不会出现图标闪烁，也不存在 SSR / CSR 水合不一致。
 * 主题持久化与系统偏好跟随交给 next-themes。
 */
export default function ThemeToggle({
  id = "light-switch",
  className,
  size = "sm",
  variant = "filled",
}: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useLocale();

  const isDark = resolvedTheme === "dark";

  const iconSize = {
    sm: "size-4",
    md: "size-5",
    lg: "size-6",
  }[size];

  const iconStyle = variant === "filled" ? "fill-current" : "";

  return (
    <div className={cn("flex flex-col justify-center", className)}>
      <input
        type="checkbox"
        name="light-switch"
        id={id}
        className="light-switch sr-only"
        checked={isDark}
        onChange={() => setTheme(isDark ? "light" : "dark")}
      />
      <label className="relative cursor-pointer p-2" htmlFor={id}>
        {/* 亮色模式图标 */}
        <Sun
          className={cn("dark:hidden", iconSize, "text-blue-500", iconStyle)}
        />
        {/* 暗色模式图标 */}
        <Moon
          className={cn(
            "hidden dark:block",
            iconSize,
            "text-blue-500",
            iconStyle,
          )}
        />
        <span className="sr-only">{t((m) => m.common.switchTheme)}</span>
      </label>
    </div>
  );
}
