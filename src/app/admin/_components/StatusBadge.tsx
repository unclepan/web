import { cn } from '@/lib/utils';
import type { AdminApplyStatus, UserRole } from '../_lib/types';

export type BadgeTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'purple';

const TONE_CLASS: Record<BadgeTone, string> = {
  neutral: 'bg-muted text-muted-foreground',
  info: 'bg-blue-500/15 text-blue-600 dark:text-blue-300',
  success: 'bg-green-500/15 text-green-600 dark:text-green-300',
  warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
  danger: 'bg-red-500/15 text-red-600 dark:text-red-300',
  purple: 'bg-purple-500/15 text-purple-600 dark:text-purple-300',
};

/** 状态徽标：统一字号/圆角，配色由 tone 决定 */
export function StatusBadge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium',
        TONE_CLASS[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const ROLE_META: Record<UserRole, { label: string; tone: BadgeTone }> = {
  REGULAR: { label: '普通用户', tone: 'neutral' },
  ADMIN: { label: '管理员', tone: 'info' },
  SYSTEM_ADMIN: { label: '系统管理员', tone: 'purple' },
};

export function RoleBadge({ role }: { role: UserRole }) {
  const meta = ROLE_META[role] ?? { label: role, tone: 'neutral' as BadgeTone };
  return <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>;
}

const APPLY_META: Record<AdminApplyStatus, { label: string; tone: BadgeTone }> = {
  NONE: { label: '未申请', tone: 'neutral' },
  PENDING: { label: '待审核', tone: 'warning' },
  APPROVED: { label: '已通过', tone: 'success' },
  REJECTED: { label: '已拒绝', tone: 'danger' },
};

export function ApplyStatusBadge({ status }: { status: AdminApplyStatus }) {
  const meta = APPLY_META[status] ?? { label: status, tone: 'neutral' as BadgeTone };
  return <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>;
}

/** 问卷状态：草稿 / 收集中 / 已停止 / 回收站 */
export function WorkStatusBadge({
  isPublish,
  isStopped,
  isDelete,
}: {
  isPublish: boolean;
  isStopped: boolean;
  isDelete: number;
}) {
  if (isDelete !== 0) return <StatusBadge tone="neutral">回收站</StatusBadge>;
  if (!isPublish) return <StatusBadge tone="neutral">草稿</StatusBadge>;
  if (isStopped) return <StatusBadge tone="warning">已停止</StatusBadge>;
  return <StatusBadge tone="success">收集中</StatusBadge>;
}
