'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ExternalLink,
  PauseCircle,
  PlayCircle,
  RotateCcw,
  Search,
  Star,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Avatar from '@/components/Avatar';
import { PageHeader } from '../_components/PageHeader';
import { TableCard, Th, Td } from '../_components/TableCard';
import { Pagination } from '../_components/Pagination';
import { EmptyState } from '../_components/EmptyState';
import { SearchInput } from '../_components/SearchInput';
import { ConfirmDialog } from '../_components/ConfirmDialog';
import { StatusBadge, WorkStatusBadge } from '../_components/StatusBadge';
import { useAdminList } from '../_hooks/useAdminList';
import { useDebouncedValue } from '../_hooks/useDebouncedValue';
import { adminWorkApi } from '../_lib/api';
import { formatDateTime, formatNumber } from '../_lib/format';
import type { AdminWork } from '../_lib/types';

type ConfirmState =
  | { type: 'stop'; work: AdminWork }
  | { type: 'resume'; work: AdminWork }
  | { type: 'trash'; work: AdminWork }
  | { type: 'restore'; work: AdminWork }
  | { type: 'purge'; work: AdminWork }
  | null;

const PAGE_SIZE = 20;

export default function AdminWorksPage() {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all');
  const [scope, setScope] = useState('normal');
  const [authorId, setAuthorId] = useState('');
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [acting, setActing] = useState(false);

  // 从「用户详情 / 排行榜」跳过来时带 ?createUserId=xx，这里做一次性初始化。
  // 不用 useSearchParams：那会要求 Suspense 边界，而后台页面没必要为它改结构。
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('createUserId');
    if (id) setAuthorId(id);
  }, []);

  const debouncedKeyword = useDebouncedValue(keyword);
  const reloadKey = [debouncedKeyword, status, scope, authorId].join('|');

  const fetcher = useCallback(
    async (page: number) => {
      const res = await adminWorkApi.list({
        page,
        pageSize: PAGE_SIZE,
        keyword: debouncedKeyword || undefined,
        status: status === 'all' ? undefined : status,
        scope,
        createUserId: authorId || undefined,
      });
      return { items: res.items, total: res.total };
    },
    [debouncedKeyword, status, scope, authorId],
  );

  const list = useAdminList(fetcher, reloadKey, PAGE_SIZE, '问卷列表加载失败');

  const resetFilters = () => {
    setKeyword('');
    setStatus('all');
    setScope('normal');
    setAuthorId('');
  };

  const runAction = async () => {
    if (!confirm) return;
    const { work } = confirm;
    setActing(true);
    try {
      switch (confirm.type) {
        case 'stop':
          await adminWorkApi.stop(work.id);
          toast.success('已停止收集');
          break;
        case 'resume':
          await adminWorkApi.resume(work.id);
          toast.success('已恢复收集');
          break;
        case 'trash':
          await adminWorkApi.trash(work.id);
          toast.success('已移入回收站');
          break;
        case 'restore':
          await adminWorkApi.restore(work.id);
          toast.success('已恢复');
          break;
        case 'purge':
          await adminWorkApi.deletePermanently(work.id);
          toast.success('已彻底删除');
          break;
      }
      setConfirm(null);
      list.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '操作失败');
    } finally {
      setActing(false);
    }
  };

  const dialog = useMemo(() => {
    if (!confirm) return null;
    const { work, type } = confirm;
    const base = { destructive: false as boolean, confirmText: '确认' };
    switch (type) {
      case 'stop':
        return {
          ...base,
          title: '停止收集？',
          description: `「${work.name}」停止后答卷人将无法提交，已收集的答卷保留。`,
          confirmText: '停止收集',
        };
      case 'resume':
        return {
          ...base,
          title: '恢复收集？',
          description: `恢复后「${work.name}」可以继续接收答卷。`,
          confirmText: '恢复收集',
        };
      case 'trash':
        return {
          ...base,
          destructive: true,
          title: '移入回收站？',
          description: `「${work.name}」将被移入回收站，可从回收站恢复。`,
          confirmText: '移入回收站',
        };
      case 'restore':
        return {
          ...base,
          title: '从回收站恢复？',
          description: `「${work.name}」将恢复到正常列表。`,
          confirmText: '恢复',
        };
      case 'purge':
        return {
          ...base,
          destructive: true,
          title: '彻底删除？',
          description: `「${work.name}」将被永久删除，无法恢复。该问卷下的 ${work._count.answers} 份答卷仍会保留。`,
          confirmText: '彻底删除',
        };
    }
  }, [confirm]);

  const inTrash = scope === 'trash';

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="问卷管理"
        description="跨用户查看与处置全站问卷"
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3 shadow-sm">
        <SearchInput
          value={keyword}
          onChange={setKeyword}
          placeholder="搜索问卷名"
          className="w-full sm:w-64"
        />

        <Select value={scope} onValueChange={setScope}>
          <SelectTrigger className="h-9 w-32" size="default">
            <SelectValue placeholder="范围" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">正常</SelectItem>
            <SelectItem value="trash">回收站</SelectItem>
            <SelectItem value="all">全部</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 w-32" size="default">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="published">收集中</SelectItem>
            <SelectItem value="draft">草稿</SelectItem>
            <SelectItem value="stopped">已停止</SelectItem>
            <SelectItem value="starred">已收藏</SelectItem>
          </SelectContent>
        </Select>

        {authorId && (
          <StatusBadge tone="info" className="h-9 px-3">
            创建者 ID {authorId}
          </StatusBadge>
        )}

        <Button variant="ghost" size="sm" onClick={resetFilters} className="ml-auto">
          <RotateCcw className="size-4" />
          重置
        </Button>
      </div>

      <TableCard
        loading={list.loading}
        minWidth="min-w-[980px]"
        isEmpty={list.items.length === 0}
        empty={
          <EmptyState
            icon={Search}
            title="没有匹配的问卷"
            description="换个关键词或切换范围试试。"
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
            <Th>问卷</Th>
            <Th>创建者</Th>
            <Th>状态</Th>
            <Th className="text-right">答卷</Th>
            <Th>更新时间</Th>
            <Th className="text-right">操作</Th>
          </tr>
        </thead>
        <tbody>
          {list.items.map((work) => (
            <tr key={work.id} className="hover:bg-muted/50">
              <Td>
                <div className="flex items-start gap-1.5">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {work.name || '(未命名问卷)'}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      ID {work.id}
                      {work.desc ? ` · ${work.desc}` : ''}
                    </p>
                  </div>
                  {work.starred && (
                    <Star className="mt-0.5 size-3.5 shrink-0 fill-amber-400 text-amber-400" />
                  )}
                </div>
              </Td>
              <Td>
                <button
                  type="button"
                  onClick={() => setAuthorId(String(work.createUser.id))}
                  className="flex items-center gap-2 hover:underline"
                  title="只看该作者的问卷"
                >
                  <Avatar
                    src={work.createUser.avatar}
                    name={work.createUser.username}
                    size="sm"
                  />
                  <span className="max-w-28 truncate">
                    {work.createUser.username}
                  </span>
                </button>
              </Td>
              <Td>
                <WorkStatusBadge
                  isPublish={work.isPublish}
                  isStopped={work.isStopped}
                  isDelete={work.isDelete}
                />
              </Td>
              <Td className="text-right tabular-nums">
                {formatNumber(work._count.answers)}
              </Td>
              <Td className="whitespace-nowrap text-muted-foreground">
                {formatDateTime(work.updatedAt)}
              </Td>
              <Td className="text-right">
                <div className="flex justify-end gap-1">
                  {inTrash ? (
                    <>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => setConfirm({ type: 'restore', work })}
                      >
                        <RotateCcw className="size-3.5" />
                        恢复
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => setConfirm({ type: 'purge', work })}
                      >
                        <Trash2 className="size-3.5" />
                        彻底删除
                      </Button>
                    </>
                  ) : (
                    <>
                      {work.isPublish && !work.isStopped && (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => setConfirm({ type: 'stop', work })}
                        >
                          <PauseCircle className="size-3.5" />
                          停止
                        </Button>
                      )}
                      {work.isStopped && (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => setConfirm({ type: 'resume', work })}
                        >
                          <PlayCircle className="size-3.5" />
                          恢复收集
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => setConfirm({ type: 'trash', work })}
                      >
                        <Trash2 className="size-3.5" />
                        回收站
                      </Button>
                    </>
                  )}

                  <Button variant="ghost" size="icon-xs" asChild title="查看统计">
                    <a
                      href={`/workspace/stats/${work.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
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

      {dialog && (
        <ConfirmDialog
          open={!!confirm}
          title={dialog.title}
          description={dialog.description}
          confirmText={dialog.confirmText}
          destructive={dialog.destructive}
          loading={acting}
          onConfirm={() => void runAction()}
          onOpenChange={(open) => !open && setConfirm(null)}
        />
      )}
    </div>
  );
}
