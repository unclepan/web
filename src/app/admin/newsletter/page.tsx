'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Mail,
  RotateCcw,
  Search,
  Send,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import Avatar from '@/components/Avatar';
import { PageHeader } from '../_components/PageHeader';
import { TableCard, Th, Td } from '../_components/TableCard';
import { Pagination } from '../_components/Pagination';
import { EmptyState } from '../_components/EmptyState';
import { SearchInput } from '../_components/SearchInput';
import { ConfirmDialog } from '../_components/ConfirmDialog';
import { StatusBadge } from '../_components/StatusBadge';
import { useAdminList } from '../_hooks/useAdminList';
import { useDebouncedValue } from '../_hooks/useDebouncedValue';
import { adminNewsletterApi } from '../_lib/api';
import { formatDateTime, formatNumber } from '../_lib/format';
import type { AdminNewsletterIssue } from '../_lib/types';

const PAGE_SIZE = 20;

export default function AdminNewsletterPage() {
  const [keyword, setKeyword] = useState('');
  const [issuePage, setIssuePage] = useState(1);
  const [issues, setIssues] = useState<AdminNewsletterIssue[]>([]);
  const [issueTotal, setIssueTotal] = useState(0);
  const [issueLoading, setIssueLoading] = useState(true);
  const [confirmRun, setConfirmRun] = useState(false);
  const [running, setRunning] = useState(false);

  const debouncedKeyword = useDebouncedValue(keyword);

  const subscriberFetcher = useCallback(
    async (page: number) => {
      const res = await adminNewsletterApi.subscribers({
        page,
        pageSize: PAGE_SIZE,
        q: debouncedKeyword || undefined,
      });
      return { items: res.items, total: res.total };
    },
    [debouncedKeyword],
  );

  const subscribers = useAdminList(
    subscriberFetcher,
    debouncedKeyword,
    PAGE_SIZE,
    '订阅者列表加载失败',
  );

  const loadIssues = useCallback(async (page: number) => {
    setIssueLoading(true);
    try {
      const res = await adminNewsletterApi.issues({ page, pageSize: 10 });
      setIssues(res.items);
      setIssueTotal(res.total);
      setIssuePage(page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '期次历史加载失败');
    } finally {
      setIssueLoading(false);
    }
  }, []);

  // 期次列表不依赖筛选条件，只在挂载时拉一次
  useEffect(() => {
    void loadIssues(1);
  }, [loadIssues]);

  const runDigest = async () => {
    setRunning(true);
    try {
      const result = await adminNewsletterApi.runDigest();
      if (result.skipped) {
        toast.info(`已跳过：${result.reason ?? '无内容可发'}`);
      } else {
        toast.success(
          `发送完成：${result.articleCount} 篇文章，成功 ${result.sentCount} 封，失败 ${result.failedCount} 封`,
        );
      }
      setConfirmRun(false);
      await loadIssues(1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '触发失败');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="订阅管理"
        description="Newsletter 订阅者与每日摘要的发送记录"
        actions={
          <Button size="sm" onClick={() => setConfirmRun(true)}>
            <Send className="size-4" />
            手动触发摘要
          </Button>
        }
      />

      {/* 订阅者 */}
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              订阅者
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                共 {formatNumber(subscribers.total)} 人
              </span>
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <SearchInput
              value={keyword}
              onChange={setKeyword}
              placeholder="搜索邮箱 / 用户名"
              className="w-full sm:w-56"
            />
            {keyword && (
              <Button variant="ghost" size="icon-sm" onClick={() => setKeyword('')}>
                <RotateCcw className="size-4" />
              </Button>
            )}
          </div>
        </div>

        <TableCard
          loading={subscribers.loading}
          minWidth="min-w-[560px]"
          isEmpty={subscribers.items.length === 0}
          empty={
            <EmptyState
              icon={Search}
              title="没有匹配的订阅者"
              description="换个关键词试试。"
            />
          }
        >
          <thead>
            <tr>
              <Th>用户</Th>
              <Th>订阅邮箱</Th>
              <Th>订阅时间</Th>
            </tr>
          </thead>
          <tbody>
            {subscribers.items.map((item) => (
              <tr key={item.id} className="hover:bg-muted/50">
                <Td>
                  <span className="flex items-center gap-2">
                    <Avatar
                      src={item.user.avatar}
                      name={item.user.username}
                      size="sm"
                    />
                    <span className="max-w-40 truncate font-medium">
                      {item.user.username}
                    </span>
                  </span>
                </Td>
                <Td className="max-w-64 truncate text-muted-foreground">
                  {item.email}
                </Td>
                <Td className="whitespace-nowrap text-muted-foreground">
                  {formatDateTime(item.createdAt)}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableCard>

        <Pagination
          page={subscribers.page}
          pageSize={PAGE_SIZE}
          total={subscribers.total}
          loading={subscribers.loading}
          onChange={subscribers.goToPage}
        />
      </section>

      {/* 期次历史 */}
      <section className="mt-6 rounded-lg border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-foreground">
          发送期次
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            每日 09:00（Asia/Shanghai）自动执行
          </span>
        </h3>

        <TableCard
          loading={issueLoading}
          minWidth="min-w-[560px]"
          isEmpty={issues.length === 0}
          empty={
            <EmptyState
              icon={Mail}
              title="还没有发送记录"
              description="触发过一次摘要后，这里会出现记录。"
            />
          }
        >
          <thead>
            <tr>
              <Th>发送时间</Th>
              <Th>状态</Th>
              <Th className="text-right">订阅人数</Th>
              <Th className="text-right">文章数</Th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr key={issue.id} className="hover:bg-muted/50">
                <Td className="whitespace-nowrap">
                  {formatDateTime(issue.sentAt)}
                </Td>
                <Td>
                  {issue.status === 'SENT' ? (
                    <StatusBadge tone="success">
                      <CheckCircle2 className="size-3" />
                      已发送
                    </StatusBadge>
                  ) : (
                    <StatusBadge tone="danger">
                      <XCircle className="size-3" />
                      {issue.status}
                    </StatusBadge>
                  )}
                </Td>
                <Td className="text-right tabular-nums">
                  {formatNumber(issue.subscriberCount)}
                </Td>
                <Td className="text-right tabular-nums">
                  {Array.isArray(issue.articleIds) ? issue.articleIds.length : '—'}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableCard>

        <Pagination
          page={issuePage}
          pageSize={10}
          total={issueTotal}
          loading={issueLoading}
          onChange={(page) => void loadIssues(page)}
        />
      </section>

      <ConfirmDialog
        open={confirmRun}
        title="立即发送一期摘要？"
        description="系统会扫描上次发送之后新建的可见文章，向全部订阅者发送邮件，并写入一条期次记录。单次最多 10 篇，超出顺延到下一期。"
        confirmText="发送"
        loading={running}
        onConfirm={() => void runDigest()}
        onOpenChange={(open) => !open && setConfirmRun(false)}
      />
    </div>
  );
}
