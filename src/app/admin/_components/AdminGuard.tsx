'use client';

import { Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';

/**
 * 后台门禁：只有 SYSTEM_ADMIN 能进
 *
 * 服务端没有 middleware，鉴权只能在客户端做（与 user-management 页面一致）。
 * 三层防护：
 *   1. loading 中 → 转圈，不闪内容
 *   2. 未登录 → 引导去登录，带 callbackUrl 便于回跳
 *   3. 已登录但非 SYSTEM_ADMIN → 403 提示
 *
 * 真正的权限校验在后端（RoleGuard），这里只是 UX，不做安全边界。
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <GuardNotice
      icon={<ShieldAlert className="size-7 text-muted-foreground" />}
      title="请先登录"
      description="后台管理系统需要登录后访问。"
      action={
        <Button asChild size="sm">
          <Link href="/signin?callbackUrl=%2Fadmin">去登录</Link>
        </Button>
      }
    />;
  }

  if (user.role !== 'SYSTEM_ADMIN') {
    return <GuardNotice
      icon={<ShieldAlert className="size-7 text-red-600 dark:text-red-300" />}
      title="无权访问"
      description={`后台管理系统仅对系统管理员开放，当前账号角色为 ${user.role}。`}
      action={
        <Button asChild size="sm" variant="outline">
          <Link href="/workspace">返回工作台</Link>
        </Button>
      }
    />;
  }

  return <>{children}</>;
}

function GuardNotice({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
          {icon}
        </div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-6 flex justify-center">{action}</div>
      </div>
    </div>
  );
}
