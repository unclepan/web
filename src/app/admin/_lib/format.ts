/** 后台管理通用格式化 */

/**
 * 日期时间：2026-09-04 14:30
 * 固定 zh-CN + 不显示秒，后台列表够用且列宽稳定。
 */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** 日期：2026-09-04 */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** 相对时间：3 分钟前 / 2 天前，超过 30 天退回绝对日期 */
export function formatRelative(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';

  const diff = Date.now() - d.getTime();
  const min = 60_000;
  const hour = 60 * min;
  const day = 24 * hour;

  if (diff < min) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / min)} 分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
  if (diff < 30 * day) return `${Math.floor(diff / day)} 天前`;
  return formatDate(d);
}

/** 大数字千分位 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return value.toLocaleString('zh-CN');
}

/** 秒 → 可读时长：1 分 05 秒 / 42 秒 */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds < 0) return '—';
  if (seconds < 60) return `${seconds} 秒`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s ? `${m} 分 ${String(s).padStart(2, '0')} 秒` : `${m} 分`;
  const h = Math.floor(m / 60);
  return `${h} 小时 ${m % 60} 分`;
}

/** YYYY-MM-DD，用于 <input type="date"> 的默认值 */
export function toDateInputValue(value: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${value.getFullYear()}-${p(value.getMonth() + 1)}-${p(value.getDate())}`;
}

/** 邮箱脱敏：abc***@qq.com（后台列表默认不暴露完整邮箱之外的敏感内容） */
export function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!domain) return email;
  const head = name.slice(0, Math.min(3, name.length));
  return `${head}***@${domain}`;
}
