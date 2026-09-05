'use client';

import { useCallback, useEffect, useState } from 'react';
import { Activity, CheckCircle2, RefreshCw, Server, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PageHeader } from '../_components/PageHeader';
import { StatusBadge } from '../_components/StatusBadge';
import { adminSystemApi } from '../_lib/api';
import { formatDateTime } from '../_lib/format';
import type { SystemHealth } from '../_lib/types';

export default function AdminSystemPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setHealth(await adminSystemApi.health());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '健康检查失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const okCount = health?.upstreams.filter((u) => u.ok).length ?? 0;
  const total = health?.upstreams.length ?? 0;

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        title="服务健康"
        description="网关对下游微服务的实时探测结果"
        actions={
          <Button variant="outline" size="sm" disabled={loading} onClick={() => void load()}>
            <RefreshCw className={loading ? 'size-4 animate-spin' : 'size-4'} />
            刷新
          </Button>
        }
      />

      {/* 总览 */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex size-10 items-center justify-center rounded-md bg-blue-500/15">
          <Server className="size-5 text-blue-600 dark:text-blue-300" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">
            网关状态：
            {health?.status === 'ok' ? (
              <StatusBadge tone="success" className="ml-1.5">
                全部正常
              </StatusBadge>
            ) : (
              <StatusBadge tone="danger" className="ml-1.5">
                部分异常
              </StatusBadge>
            )}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {okCount} / {total} 个下游服务可达
            {health && ` · 检测于 ${formatDateTime(health.timestamp)}`}
          </p>
        </div>
      </div>

      {/* 各服务卡片 */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg border border-border bg-card"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {health?.upstreams.map((upstream) => (
            <div
              key={upstream.name}
              className="rounded-lg border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{upstream.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {upstream.target}
                  </p>
                </div>
                {upstream.ok ? (
                  <CheckCircle2 className="size-5 shrink-0 text-green-600 dark:text-green-300" />
                ) : (
                  <XCircle className="size-5 shrink-0 text-red-600 dark:text-red-300" />
                )}
              </div>

              <div className="mt-3 flex items-center gap-2">
                {upstream.ok ? (
                  <StatusBadge tone="success">
                    <Activity className="size-3" />
                    {upstream.latency !== undefined ? `${upstream.latency} ms` : '可达'}
                  </StatusBadge>
                ) : (
                  <StatusBadge tone="danger">不可达</StatusBadge>
                )}
              </div>

              {upstream.error && (
                <p className="mt-2 break-all text-xs text-red-600 dark:text-red-300">
                  {upstream.error}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
