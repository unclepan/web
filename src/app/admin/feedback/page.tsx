'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, RotateCcw, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '../_components/PageHeader';
import { TableCard, Th, Td } from '../_components/TableCard';
import { EmptyState } from '../_components/EmptyState';
import { adminFeedbackApi } from '../_lib/api';
import { formatNumber } from '../_lib/format';
import type { AdminFeedbackStats, FeedbackKind } from '../_lib/types';

/** 四档情绪的展示元信息：顺序固定，颜色沿用「绿=正面 / 红=负面」 */
const KINDS: Array<{
  key: FeedbackKind;
  label: string;
  /** 进度条与图标底色 */
  bar: string;
  text: string;
}> = [
  { key: 'EXCELLENT', label: '非常有用', bar: 'bg-green-500', text: 'text-green-600 dark:text-green-300' },
  { key: 'GOOD', label: '有用', bar: 'bg-emerald-400', text: 'text-emerald-600 dark:text-emerald-300' },
  { key: 'CONFUSED', label: '看不懂', bar: 'bg-amber-400', text: 'text-amber-600 dark:text-amber-300' },
  { key: 'NOT_HELPFUL', label: '没帮助', bar: 'bg-red-500', text: 'text-red-600 dark:text-red-300' },
];

export default function AdminFeedbackPage() {
  const [data, setData] = useState<AdminFeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState('10');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await adminFeedbackApi.stats(Number(limit)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '反馈统计加载失败');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void load();
  }, [load]);

  const total = data?.total ?? 0;
  /** 负面占比：一眼看出内容健康度，>30% 就该回头改文档 */
  const negative =
    (data?.distribution.NOT_HELPFUL ?? 0) + (data?.distribution.CONFUSED ?? 0);
  const health =
    total > 0 ? Math.round(((total - negative) / total) * 100) : null;

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        title="反馈统计"
        description="读者在文章底部的四档表态，用来判断内容质量"
        actions={
          <>
            <Select value={limit} onValueChange={setLimit}>
              <SelectTrigger className="h-9 w-32" size="default">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">Top 10</SelectItem>
                <SelectItem value="20">Top 20</SelectItem>
                <SelectItem value="50">Top 50</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => void load()}>
              <RotateCcw className="size-4" />
              刷新
            </Button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KINDS.map((kind) => {
          const value = data?.distribution[kind.key] ?? 0;
          const percent = total > 0 ? Math.round((value / total) * 100) : 0;
          return (
            <div
              key={kind.key}
              className="rounded-lg border border-border bg-card p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-muted-foreground">
                {kind.label}
              </p>
              <p className={`mt-2 text-2xl font-semibold tracking-tight ${kind.text}`}>
                {formatNumber(value)}
              </p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${kind.bar} transition-all`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                占比 {percent}%
              </p>
            </div>
          );
        })}
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-sm">
        <ThumbsUp className="size-4 shrink-0 text-muted-foreground" />
        <span className="text-muted-foreground">
          累计反馈 <span className="font-medium text-foreground">{formatNumber(total)}</span> 条
        </span>
        {health !== null && (
          <span className="text-muted-foreground">
            · 正面率{' '}
            <span
              className={
                health >= 70
                  ? 'font-medium text-green-600 dark:text-green-300'
                  : 'font-medium text-amber-600 dark:text-amber-300'
              }
            >
              {health}%
            </span>
          </span>
        )}
      </div>

      <TableCard
        loading={loading}
        minWidth="min-w-[760px]"
        isEmpty={(data?.articles.length ?? 0) === 0}
        empty={
          <EmptyState
            icon={ThumbsUp}
            title="还没有收到反馈"
            description="读者在文章底部表态后，这里会按文章汇总出排名。"
          />
        }
      >
        <thead>
          <tr>
            <Th>文章</Th>
            <Th className="text-right">非常有用</Th>
            <Th className="text-right">有用</Th>
            <Th className="text-right">看不懂</Th>
            <Th className="text-right">没帮助</Th>
            <Th className="text-right">合计</Th>
            <Th>构成</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {(data?.articles ?? []).map((article) => (
            <tr key={article.id} className="hover:bg-muted/50">
              <Td>
                <p className="max-w-80 truncate font-medium">{article.title}</p>
                <p className="text-xs text-muted-foreground">
                  {article.type === 'DESIGN' ? '设计稿' : '文档'} ·{' '}
                  {formatNumber(article.total)} 条反馈
                </p>
              </Td>
              {KINDS.map((kind) => (
                <Td key={kind.key} className="text-right tabular-nums">
                  {formatNumber(article[kind.key])}
                </Td>
              ))}
              <Td className="text-right font-medium tabular-nums">
                {formatNumber(article.total)}
              </Td>
              <Td>
                <div className="flex h-1.5 w-32 overflow-hidden rounded-full bg-muted">
                  {KINDS.map((kind) => {
                    const value = article[kind.key];
                    if (!value) return null;
                    return (
                      <div
                        key={kind.key}
                        className={kind.bar}
                        style={{ width: `${(value / article.total) * 100}%` }}
                        title={`${kind.label} ${value}`}
                      />
                    );
                  })}
                </div>
              </Td>
              <Td>
                {article.uuid && (
                  <Button variant="ghost" size="icon-xs" asChild title="打开前台页面">
                    <Link
                      href={
                        article.type === 'DESIGN'
                          ? `/blog/${article.uuid}`
                          : `/docs/${article.uuid}`
                      }
                      target="_blank"
                    >
                      <ExternalLink className="size-3.5" />
                    </Link>
                  </Button>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </TableCard>

      {(data?.articles.length ?? 0) > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          仅统计反馈数最多的 Top {limit} 篇文章。「构成」条按占比从左到右依次是非常有用 / 有用 / 看不懂 / 没帮助。
        </p>
      )}
    </div>
  );
}
