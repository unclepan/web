/**
 * 相对时间格式化工具（"3 天前" / "3 days ago"）
 *
 * 与 `format-date.ts` 并列：那个给「绝对日期」，这个给「距今多久」。
 * 文档索引页卡片用相对时间（关心新鲜度），详情页用绝对日期（关心发布时间）。
 *
 * 同样只在客户端组件里调用（数据是 fetch 回来之后才渲染），不存在
 * SSR / CSR 时间基准不一致导致的 hydration 告警。
 */
import { format, type TranslateFn } from "@/i18n/useLocale";

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

/** 把 ISO 时间戳格式化为相对时间；非法输入返回空串 */
export function formatRelativeTime(iso: string, t: TranslateFn): string {
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return "";

  // 服务端时钟偏快时 diff 可能为负，钳到 0 避免出现 "-1 分钟前"
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));

  if (diffSec < MINUTE) return t((m) => m.docsIndex.timeJustNow);
  if (diffSec < HOUR)
    return format(t((m) => m.docsIndex.timeMinutesAgo), {
      n: Math.floor(diffSec / MINUTE),
    });
  if (diffSec < DAY)
    return format(t((m) => m.docsIndex.timeHoursAgo), {
      n: Math.floor(diffSec / HOUR),
    });
  if (diffSec < MONTH)
    return format(t((m) => m.docsIndex.timeDaysAgo), {
      n: Math.floor(diffSec / DAY),
    });
  if (diffSec < YEAR)
    return format(t((m) => m.docsIndex.timeMonthsAgo), {
      n: Math.floor(diffSec / MONTH),
    });
  return format(t((m) => m.docsIndex.timeYearsAgo), {
    n: Math.floor(diffSec / YEAR),
  });
}
