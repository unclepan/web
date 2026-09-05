'use client';

import { useCallback, useEffect, useState } from 'react';
import { Eye, Loader2, RotateCcw, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Avatar from '@/components/Avatar';
import { PageHeader } from '../_components/PageHeader';
import { TableCard, Th, Td } from '../_components/TableCard';
import { Pagination } from '../_components/Pagination';
import { EmptyState } from '../_components/EmptyState';
import { ConfirmDialog } from '../_components/ConfirmDialog';
import { StatusBadge } from '../_components/StatusBadge';
import { useAdminList } from '../_hooks/useAdminList';
import { adminAnswerApi } from '../_lib/api';
import { formatDateTime, formatDuration, formatRelative } from '../_lib/format';
import type { AdminAnswer, AdminAnswerDetail } from '../_lib/types';

const PAGE_SIZE = 20;

export default function AdminAnswersPage() {
  const [workId, setWorkId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [detailId, setDetailId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminAnswer | null>(null);
  const [acting, setActing] = useState(false);

  // 从仪表盘「答卷最多的问卷」跳过来时带 ?workId=xx
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('workId');
    if (id) setWorkId(id);
  }, []);

  const reloadKey = [workId, startDate, endDate].join('|');

  const fetcher = useCallback(
    async (page: number) => {
      const res = await adminAnswerApi.list({
        page,
        size: PAGE_SIZE,
        workId: workId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      return { items: res.list, total: res.total };
    },
    [workId, startDate, endDate],
  );

  const list = useAdminList(fetcher, reloadKey, PAGE_SIZE, '答卷列表加载失败');

  const resetFilters = () => {
    setWorkId('');
    setStartDate('');
    setEndDate('');
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setActing(true);
    try {
      await adminAnswerApi.delete(pendingDelete.id);
      toast.success('答卷已删除');
      setPendingDelete(null);
      setDetailId(null);
      list.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除失败');
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="答卷管理"
        description="跨问卷检索全站答卷，删除操作不可恢复"
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3 shadow-sm">
        <Input
          value={workId}
          onChange={(e) => setWorkId(e.target.value.replace(/\D/g, ''))}
          placeholder="按问卷 ID 过滤"
          className="h-9 w-40"
          inputMode="numeric"
        />

        <div className="flex items-center gap-1.5">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-9 w-36"
            aria-label="起始日期"
          />
          <span className="text-sm text-muted-foreground">至</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-9 w-36"
            aria-label="截止日期"
          />
        </div>

        <Button variant="ghost" size="sm" onClick={resetFilters} className="ml-auto">
          <RotateCcw className="size-4" />
          重置
        </Button>
      </div>

      <TableCard
        loading={list.loading}
        minWidth="min-w-[900px]"
        isEmpty={list.items.length === 0}
        empty={
          <EmptyState
            icon={Search}
            title="没有匹配的答卷"
            description="调整问卷 ID 或时间范围试试。"
            action={
              <Button variant="outline" size="sm" onClick={resetFilters}>
                清除筛选
              </Button>
            }
          />
        }
      >
        <thead>
          <tr>
            <Th>提交时间</Th>
            <Th>所属问卷</Th>
            <Th>答题人</Th>
            <Th className="text-right">分数</Th>
            <Th className="text-right">用时</Th>
            <Th>IP</Th>
            <Th className="text-right">操作</Th>
          </tr>
        </thead>
        <tbody>
          {list.items.map((answer) => (
            <tr key={answer.id} className="hover:bg-muted/50">
              <Td className="whitespace-nowrap">
                <span className="block">{formatDateTime(answer.createdAt)}</span>
                <span className="text-xs text-muted-foreground">
                  {formatRelative(answer.createdAt)}
                </span>
              </Td>
              <Td>
                <span className="block max-w-52 truncate">
                  {answer.work.name || '(未命名问卷)'}
                </span>
                <span className="text-xs text-muted-foreground">
                  ID {answer.work.id}
                  {answer.work.isDelete !== 0 && ' · 已删除'}
                </span>
              </Td>
              <Td>
                {answer.answerer ? (
                  <span className="flex items-center gap-2">
                    <Avatar
                      src={answer.answerer.avatar}
                      name={answer.answerer.username}
                      size="sm"
                    />
                    <span className="max-w-28 truncate">
                      {answer.answerer.username}
                    </span>
                  </span>
                ) : (
                  <StatusBadge>匿名</StatusBadge>
                )}
              </Td>
              <Td className="text-right tabular-nums">{answer.score}</Td>
              <Td className="whitespace-nowrap text-right tabular-nums text-muted-foreground">
                {formatDuration(answer.duration)}
              </Td>
              <Td className="whitespace-nowrap text-muted-foreground">
                {answer.ip || '—'}
              </Td>
              <Td className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setDetailId(answer.id)}
                  >
                    <Eye className="size-3.5" />
                    查看
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setPendingDelete(answer)}
                  >
                    <Trash2 className="size-3.5" />
                    删除
                  </Button>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableCard>

      <Pagination
        page={list.page}
        pageSize={PAGE_SIZE}
        total={list.total}
        loading={list.loading}
        onChange={list.goToPage}
      />

      <AnswerDetailDialog id={detailId} onClose={() => setDetailId(null)} />

      <ConfirmDialog
        open={!!pendingDelete}
        title="删除这份答卷？"
        description={`答卷 #${pendingDelete?.id} 将被永久删除（Answer 表没有软删字段，删了找不回来）。`}
        confirmText="永久删除"
        destructive
        loading={acting}
        onConfirm={() => void confirmDelete()}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      />
    </div>
  );
}

/**
 * 答卷详情：正文 content 单独走 /answer/find/:id 拉取
 * （列表接口不返回正文，一页 20 条会把响应撑爆）
 */
function AnswerDetailDialog({
  id,
  onClose,
}: {
  id: number | null;
  onClose: () => void;
}) {
  const [answer, setAnswer] = useState<AdminAnswerDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id === null) {
      setAnswer(null);
      return;
    }
    setLoading(true);
    adminAnswerApi
      .find(id)
      .then(setAnswer)
      .catch(() => toast.error('答卷详情加载失败'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <Dialog open={id !== null} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>答卷 #{id}</DialogTitle>
          <DialogDescription>
            {answer
              ? `${answer.work.name || '(未命名问卷)'} · ${formatDateTime(answer.createdAt)}`
              : '加载中…'}
          </DialogDescription>
        </DialogHeader>

        {loading || !answer ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <Field label="答题人" value={answer.answerer?.username ?? '匿名'} />
              <Field label="分数" value={String(answer.score)} />
              <Field label="用时" value={formatDuration(answer.duration)} />
              <Field label="IP" value={answer.ip || '—'} />
            </div>

            <div>
              <p className="mb-1.5 text-xs text-muted-foreground">User-Agent</p>
              <p className="break-all rounded-md border border-border bg-muted/40 p-2 text-xs">
                {answer.userAgent || '—'}
              </p>
            </div>

            <div>
              <p className="mb-1.5 text-xs text-muted-foreground">答卷正文</p>
              <pre className="max-h-72 overflow-auto rounded-md border border-border bg-muted/40 p-3 text-xs">
                {JSON.stringify(answer.content, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate font-medium">{value}</p>
    </div>
  );
}
