'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  FileText,
  Inbox,
  Mail,
  MessageSquare,
  Newspaper,
  RefreshCw,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PageHeader } from './_components/PageHeader';
import { StatCard } from './_components/StatCard';
import { AdminChart } from './_components/AdminChart';
import { EmptyState } from './_components/EmptyState';
import { adminStatsApi } from './_lib/api';
import { formatNumber } from './_lib/format';
import type { AdminOverview, AdminRanking, AdminTrend } from './_lib/types';

const TREND_OPTIONS = [7, 14, 30] as const;

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [trend, setTrend] = useState<AdminTrend | null>(null);
  const [ranking, setRanking] = useState<AdminRanking | null>(null);
  const [days, setDays] = useState<number>(7);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(async (trendDays: number, silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [o, t, r] = await Promise.all([
        adminStatsApi.overview(),
        adminStatsApi.trend(trendDays),
        adminStatsApi.ranking(10),
      ]);
      setOverview(o);
      setTrend(t);
      setRanking(r);
    } catch {
      toast.error('统计数据加载失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadAll(days);
  }, [loadAll, days]);

  const trendOption = useMemo(() => buildTrendOption(trend), [trend]);

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="仪表盘"
        description="全站核心指标与近况总览"
        actions={
          <Button
            variant="outline"
            size="sm"
            disabled={refreshing}
            onClick={() => void loadAll(days, true)}
          >
            <RefreshCw className={refreshing ? 'size-4 animate-spin' : 'size-4'} />
            刷新
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-lg border border-border bg-card"
            />
          ))}
        </div>
      ) : (
        overview && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
              label="用户总数"
              value={overview.users.total}
              icon={Users}
              hint={`今日 +${overview.users.today} · 近 7 天 +${overview.users.week}`}
              href="/admin/users"
            />
            <StatCard
              label="待审管理员申请"
              value={overview.users.pendingApply}
              icon={Activity}
              tone={overview.users.pendingApply > 0 ? 'warning' : 'default'}
              hint={overview.users.pendingApply > 0 ? '需要你处理' : '暂无待办'}
              href="/admin/users"
            />
            <StatCard
              label="问卷总数"
              value={overview.works.total}
              icon={FileText}
              hint={`收集中 ${overview.works.published} · 回收站 ${overview.works.trashed}`}
              href="/admin/works"
            />
            <StatCard
              label="答卷总数"
              value={overview.answers.total}
              icon={Inbox}
              hint={`今日 +${overview.answers.today} · 近 7 天 +${overview.answers.week}`}
              href="/admin/answers"
            />
            <StatCard
              label="内容文章"
              value={overview.articles.total}
              icon={Newspaper}
              hint={`已发布 ${overview.articles.visible} · 推荐 ${overview.articles.featured}`}
              href="/admin/articles"
            />
            <StatCard
              label="未读留言"
              value={overview.contacts.unread}
              icon={MessageSquare}
              tone={overview.contacts.unread > 0 ? 'danger' : 'default'}
              hint={`累计 ${overview.contacts.total} 条`}
              href="/admin/contacts"
            />
          </div>
        )
      )}

      {/* 趋势 */}
      <section className="mt-6 rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">增长趋势</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              按 Asia/Shanghai 日历分桶，答卷提交与用户注册对比
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
            {TREND_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDays(option)}
                className={`rounded px-2.5 py-1 text-xs transition-colors ${
                  days === option
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {option} 天
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="h-[280px] animate-pulse rounded bg-muted" />
        ) : (
          <AdminChart option={trendOption} height={280} />
        )}
      </section>

      {/* 排行 */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <RankingCard
          title="答卷最多的问卷"
          loading={loading}
          empty={!ranking?.topWorks.length}
          emptyText="还没有任何答卷"
        >
          <table className="w-full">
            <tbody>
              {ranking?.topWorks.map((item, index) => (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="w-8 py-2.5 text-sm text-muted-foreground">
                    {index + 1}
                  </td>
                  <td className="py-2.5 pr-3">
                    <Link
                      href={`/admin/answers?workId=${item.id}`}
                      className="line-clamp-1 text-sm text-foreground hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      由 {item.authorName} 创建
                    </p>
                  </td>
                  <td className="w-20 py-2.5 text-right text-sm font-medium tabular-nums">
                    {formatNumber(item.answerCount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </RankingCard>

        <RankingCard
          title="问卷最多的用户"
          loading={loading}
          empty={!ranking?.topCreators.length}
          emptyText="还没有用户创建问卷"
        >
          <table className="w-full">
            <tbody>
              {ranking?.topCreators.map((item, index) => (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="w-8 py-2.5 text-sm text-muted-foreground">
                    {index + 1}
                  </td>
                  <td className="py-2.5 pr-3">
                    <Link
                      href={`/admin/works?createUserId=${item.id}`}
                      className="line-clamp-1 text-sm text-foreground hover:underline"
                    >
                      {item.username}
                    </Link>
                  </td>
                  <td className="w-20 py-2.5 text-right text-sm font-medium tabular-nums">
                    {formatNumber(item.workCount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </RankingCard>
      </div>

      {/* 订阅数单独一行小卡 */}
      {overview && (
        <div className="mt-6">
          <StatCard
            label="邮件订阅用户"
            value={overview.newsletters.total}
            icon={Mail}
            hint="Newsletter 订阅总数"
            href="/admin/newsletter"
          />
        </div>
      )}
    </div>
  );
}

function RankingCard({
  title,
  loading,
  empty,
  emptyText,
  children,
}: {
  title: string;
  loading: boolean;
  empty: boolean;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-3">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      </div>
      <div className="px-5 py-2">
        {loading ? (
          <div className="h-40 animate-pulse rounded bg-muted" />
        ) : empty ? (
          <EmptyState icon={Inbox} title="暂无数据" description={emptyText} />
        ) : (
          children
        )}
      </div>
    </section>
  );
}

function buildTrendOption(trend: AdminTrend | null) {
  const dates = trend?.items.map((i) => i.date.slice(5)) ?? [];
  return {
    tooltip: { trigger: 'axis' as const },
    legend: { data: ['答卷数', '新增用户'], bottom: 0 },
    grid: { left: 8, right: 8, top: 16, bottom: 36, containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: dates,
      boundaryGap: false,
      axisLine: { lineStyle: { color: 'rgba(128,128,128,0.3)' } },
      axisLabel: { color: '#8a8f98' },
    },
    yAxis: {
      type: 'value' as const,
      minInterval: 1,
      axisLabel: { color: '#8a8f98' },
      splitLine: { lineStyle: { color: 'rgba(128,128,128,0.15)' } },
    },
    series: [
      {
        name: '答卷数',
        type: 'line' as const,
        smooth: true,
        data: trend?.items.map((i) => i.answers) ?? [],
        itemStyle: { color: '#0070f4' },
        areaStyle: { color: 'rgba(0,112,244,0.12)' },
      },
      {
        name: '新增用户',
        type: 'line' as const,
        smooth: true,
        data: trend?.items.map((i) => i.users) ?? [],
        itemStyle: { color: '#3abab4' },
        areaStyle: { color: 'rgba(58,186,180,0.12)' },
      },
    ],
  };
}
