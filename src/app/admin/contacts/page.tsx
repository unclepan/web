'use client';

import { useCallback, useState } from 'react';
import { Eye, MailCheck, RotateCcw, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader } from '../_components/PageHeader';
import { TableCard, Th, Td } from '../_components/TableCard';
import { Pagination } from '../_components/Pagination';
import { EmptyState } from '../_components/EmptyState';
import { SearchInput } from '../_components/SearchInput';
import { ConfirmDialog } from '../_components/ConfirmDialog';
import { StatusBadge } from '../_components/StatusBadge';
import { useAdminList } from '../_hooks/useAdminList';
import { useDebouncedValue } from '../_hooks/useDebouncedValue';
import { adminContactApi } from '../_lib/api';
import { formatDateTime, formatRelative } from '../_lib/format';
import type { AdminContact } from '../_lib/types';

const PAGE_SIZE = 20;

export default function AdminContactsPage() {
  const [keyword, setKeyword] = useState('');
  const [readFilter, setReadFilter] = useState('all');
  const [detail, setDetail] = useState<AdminContact | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminContact | null>(null);
  const [acting, setActing] = useState(false);

  const debouncedKeyword = useDebouncedValue(keyword);
  const reloadKey = [debouncedKeyword, readFilter].join('|');

  const fetcher = useCallback(
    async (page: number) => {
      const res = await adminContactApi.list({
        page,
        pageSize: PAGE_SIZE,
        filter: readFilter,
        q: debouncedKeyword || undefined,
      });
      return { items: res.items, total: res.total };
    },
    [debouncedKeyword, readFilter],
  );

  const list = useAdminList(fetcher, reloadKey, PAGE_SIZE, '留言列表加载失败');

  const resetFilters = () => {
    setKeyword('');
    setReadFilter('all');
  };

  const openDetail = async (contact: AdminContact) => {
    setDetail(contact);
    if (!contact.isRead) {
      try {
        await adminContactApi.markRead(contact.id);
        // 就地更新，避免整页重拉把读者正在看的位置冲掉
        list.refresh();
      } catch {
        /* 标记已读失败不影响查看详情 */
      }
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setActing(true);
    try {
      await adminContactApi.remove(pendingDelete.id);
      toast.success('留言已删除');
      setPendingDelete(null);
      setDetail(null);
      list.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除失败');
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title="留言管理" description="来自联系表单的用户留言" />

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3 shadow-sm">
        <SearchInput
          value={keyword}
          onChange={setKeyword}
          placeholder="搜索姓名 / 邮箱 / 主题 / 正文"
          className="w-full sm:w-72"
        />

        <Select value={readFilter} onValueChange={setReadFilter}>
          <SelectTrigger className="h-9 w-32" size="default">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="unread">未读</SelectItem>
            <SelectItem value="read">已读</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="ghost" size="sm" onClick={resetFilters} className="ml-auto">
          <RotateCcw className="size-4" />
          重置
        </Button>
      </div>

      <TableCard
        loading={list.loading}
        minWidth="min-w-[1000px]"
        isEmpty={list.items.length === 0}
        empty={
          <EmptyState
            icon={Search}
            title="没有匹配的留言"
            description="换个关键词或切换状态试试。"
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
            <Th>状态</Th>
            <Th>姓名</Th>
            <Th>邮箱</Th>
            <Th>主题</Th>
            <Th>内容</Th>
            <Th>提交时间</Th>
            <Th className="text-right">操作</Th>
          </tr>
        </thead>
        <tbody>
          {list.items.map((contact) => (
            <tr
              key={contact.id}
              className={contact.isRead ? 'hover:bg-muted/50' : 'bg-blue-500/5 hover:bg-muted/50'}
            >
              <Td>
                {contact.isRead ? (
                  <StatusBadge>已读</StatusBadge>
                ) : (
                  <StatusBadge tone="warning">未读</StatusBadge>
                )}
              </Td>
              <Td className="whitespace-nowrap font-medium">
                {contact.firstName} {contact.lastName}
              </Td>
              <Td className="max-w-52 truncate text-muted-foreground">
                {contact.email}
              </Td>
              <Td className="max-w-48 truncate">{contact.subject}</Td>
              <Td className="max-w-72 truncate text-muted-foreground">
                {contact.message || '—'}
              </Td>
              <Td className="whitespace-nowrap text-muted-foreground">
                {formatRelative(contact.createdAt)}
              </Td>
              <Td className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => void openDetail(contact)}
                  >
                    <Eye className="size-3.5" />
                    查看
                  </Button>
                  {!contact.isRead && (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={async () => {
                        try {
                          await adminContactApi.markRead(contact.id);
                          toast.success('已标记为已读');
                          list.refresh();
                        } catch (err) {
                          toast.error(
                            err instanceof Error ? err.message : '操作失败',
                          );
                        }
                      }}
                    >
                      <MailCheck className="size-3.5" />
                      已读
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setPendingDelete(contact)}
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

      <Dialog open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{detail?.subject}</DialogTitle>
            <DialogDescription>
              来自 {detail?.firstName} {detail?.lastName} ·{' '}
              {formatDateTime(detail?.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {detail && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Field label="邮箱" value={detail.email} />
                <Field label="国家/地区" value={detail.country || '—'} />
              </div>

              <div>
                <p className="mb-1.5 text-xs text-muted-foreground">留言内容</p>
                <div className="max-h-60 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-muted/40 p-3">
                  {detail.message || '（无正文）'}
                </div>
              </div>

              <div className="border-t border-border pt-3 text-xs text-muted-foreground">
                <p>IP 指纹：{detail.ipHash.slice(0, 16)}…</p>
                <p className="mt-1 break-all">UA：{detail.userAgent || '—'}</p>
                <p className="mt-1">
                  关联用户 ID：{detail.userId ?? '未登录提交'}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!pendingDelete}
        title="删除这条留言？"
        description={`来自「${pendingDelete?.email ?? ''}」的留言将被永久删除，不可恢复。`}
        confirmText="永久删除"
        destructive
        loading={acting}
        onConfirm={() => void confirmDelete()}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      />
    </div>
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
