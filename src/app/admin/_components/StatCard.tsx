import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber } from '../_lib/format';

export interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  /** 副信息，如「今日 +12」 */
  hint?: string;
  /** 点击跳转（整卡可点） */
  href?: string;
  /** 强调色，用于待处理类指标 */
  tone?: 'default' | 'warning' | 'danger';
}

const TONE_ICON: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'bg-blue-500/15 text-blue-600 dark:text-blue-300',
  warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
  danger: 'bg-red-500/15 text-red-600 dark:text-red-300',
};

/** KPI 数字卡 */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  href,
  tone = 'default',
}: StatCardProps) {
  const Wrapper = href ? 'a' : 'div';

  return (
    <Wrapper
      {...(href ? { href } : {})}
      className={cn(
        'block rounded-lg border border-border bg-card p-5 shadow-sm',
        href && 'transition-colors hover:border-ring/50 hover:bg-muted/40',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {formatNumber(value)}
          </p>
          {hint && (
            <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        <div
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-md',
            TONE_ICON[tone],
          )}
        >
          <Icon className="size-4" />
        </div>
      </div>
    </Wrapper>
  );
}
