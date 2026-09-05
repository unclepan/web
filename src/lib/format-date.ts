/**
 * 通用日期格式化工具
 *
 * 只在客户端组件里调用（数据都是 fetch 回来之后才渲染），不存在
 * SSR / CSR 时区不一致导致的 hydration 告警。
 *
 * 语言跟随站点 locale：中文站输出「2026年5月18日」，英文站输出「May 18, 2026」。
 */
import type { Locale } from "@/i18n/types";

const LOCALE_TAG: Record<Locale, string> = {
  en: "en-US",
  "zh-CN": "zh-CN",
};

/** 仅日期：如 "May 18, 2026" / "2026年5月18日" */
export function formatDate(iso: string, locale: Locale = "en"): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(LOCALE_TAG[locale] ?? "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** 日期 + 时分：如 "May 18, 2026, 03:10 PM" */
export function formatDateTime(iso: string, locale: Locale = "en"): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(LOCALE_TAG[locale] ?? "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
