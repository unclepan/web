'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Ban,
  Loader2,
  RotateCcw,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import Avatar from '@/components/Avatar';
import { PageHeader } from '../_components/PageHeader';
import { TableCard, Th, Td } from '../_components/TableCard';
import { Pagination } from '../_components/Pagination';
import { EmptyState } from '../_components/EmptyState';
import { SearchInput } from '../_components/SearchInput';
import { ConfirmDialog } from '../_components/ConfirmDialog';
import {
  ApplyStatusBadge,
  RoleBadge,
  StatusBadge,
} from '../_components/StatusBadge';
import { useAdminList } from '../_hooks/useAdminList';
import { useDebouncedValue } from '../_hooks/useDebouncedValue';
import { adminStatsApi, adminUserApi } from '../_lib/api';
import { formatDateTime, formatNumber } from '../_lib/format';
import type { AdminUser, AdminUserDetail, UserRole } from '../_lib/types';

type ConfirmState =
  | { type: 'setRole'; user: AdminUser; role: UserRole }
  | { type: 'blacklist'; user: AdminUser }
  | { type: 'review'; user: AdminUser; status: 'APPROVED' | 'REJECTED' }
  | null;

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const [keyword, setKeyword] = useState('');
  const [role, setRole] = useState('all');
  const [applyStatus, setApplyStatus] = useState('all');
  const [blacklist, setBlacklist] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [acting, setActing] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const debouncedKeyword = useDebouncedValue(keyword);

  const reloadKey = [
    debouncedKeyword,
    role,
    applyStatus,
    blacklist,
    startDate,
    endDate,
  ].join('|');

  const fetcher = useCallback(
    async (page: number) => {
      const res = await adminUserApi.list({
        page,
        pageSize: PAGE_SIZE,
        q: debouncedKeyword || undefined,
        role: role === 'all' ? undefined : role,
        adminApplyStatus: applyStatus === 'all' ? undefined : applyStatus,
        isBlacklisted: blacklist === 'all' ? undefined : blacklist,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      return { items: res.users, total: res.total };
    },
    [debouncedKeyword, role, applyStatus, blacklist, startDate, endDate],
  );

  const list = useAdminList(fetcher, reloadKey, PAGE_SIZE, '用户列表加载失败');

  const resetFilters = () => {
    setKeyword('');
    setRole('all');
    setApplyStatus('all');
    setBlacklist('all');
    setStartDate('');
    setEndDate('');
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    setActing(true);
    try {
      if (confirm.type === 'setRole') {
        await adminUserApi.setRole(confirm.user.id, confirm.role);
        toast.success('角色已更新');
      } else if (confirm.type === 'blacklist') {
        await adminUserApi.toggleBlacklist(confirm.user.id);
        toast.success('拉黑状态已更新');
      } else {
        await adminUserApi.reviewApply(confirm.user.id, confirm.status);
        toast.success(confirm.status === 'APPROVED' ? '申请已通过' : '申请已拒绝');
      }
      setConfirm(null);
      list.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '操作失败');
    } finally {
      setActing(false);
    }
  };

  const confirmDialog = useMemo(() => {
    if (!confirm) return null;
    const { user } = confirm;
    if (confirm.type === 'setRole') {
      return {
        title: confirm.role === 'ADMIN' ? '设为管理员？' : '取消管理员？',
        description: `将「${user.username}」的角色设为 ${confirm.role}。变更在该用户下次登录或刷新 token 后生效。`,
        confirmText: confirm.role === 'ADMIN' ? '设为管理员' : '取消管理员',
        destructive: confirm.role !== 'ADMIN',
      };
    }
    if (confirm.type === 'blacklist') {
      return {
        title: user.isBlacklisted ? '解除拉黑？' : '拉黑该用户？',
        description: user.isBlacklisted
          ? `解除后「${user.username}」可以正常登录。`
          : `拉黑后「${user.username}」将无法登录。已签发的 token 在过期前仍可调用接口。`,
        confirmText: user.isBlacklisted ? '解除拉黑' : '拉黑',
        destructive: !user.isBlacklisted,
      };
    }
    return {
      title: confirm.status === 'APPROVED' ? '通过申请？' : '拒绝申请？',
      description:
        confirm.status === 'APPROVED'
          ? `通过后「${user.username}」的角色将提升为管理员。`
          : `拒绝后「${user.username}」需要重新申请。`,
      confirmText: confirm.status === 'APPROVED' ? '通过' : '拒绝',
      destructive: confirm.status !== 'APPROVED',
    };
  }, [confirm]);

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="用户管理"
        description="查看并管理全站用户、角色与管理员申请"
      />

      {/* 筛选栏 */}
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3 shadow-sm">
        <SearchInput
          value={keyword}
          onChange={setKeyword}
          placeholder="搜索用户名 / 邮箱"
          className="w-full sm:w-64"
        />

        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="h-9 w-32" size="default">
            <SelectValue placeholder="角色" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部角色</SelectItem>
            <SelectItem value="REGULAR">普通用户</SelectItem>
            <SelectItem value="ADMIN">管理员</SelectItem>
            <SelectItem value="SYSTEM_ADMIN">系统管理员</SelectItem>
          </SelectContent>
        </Select>

        <Select value={applyStatus} onValueChange={setApplyStatus}>
          <SelectTrigger className="h-9 w-32" size="default">
            <SelectValue placeholder="申请状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部申请</SelectItem>
            <SelectItem value="PENDING">待审核</SelectItem>
            <SelectItem value="APPROVED">已通过</SelectItem>
            <SelectItem value="REJECTED">已拒绝</SelectItem>
            <SelectItem value="NONE">未申请</SelectItem>
          </SelectContent>
        </Select>

        <Select value={blacklist} onValueChange={setBlacklist}>
          <SelectTrigger className="h-9 w-28" size="default">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="false">正常</SelectItem>
            <SelectItem value="true">已拉黑</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1.5">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-9 w-36"
            aria-label="注册起始日期"
          />
          <span className="text-sm text-muted-foreground">至</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-9 w-36"
            aria-label="注册截止日期"
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
            title="没有匹配的用户"
            description="换个关键词或放宽筛选条件试试。"
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
            <Th>用户</Th>
            <Th>角色</Th>
            <Th>管理员申请</Th>
            <Th>状态</Th>
            <Th>注册时间</Th>
            <Th className="text-right">操作</Th>
          </tr>
        </thead>
        <tbody>
          {list.items.map((user) => (
            <tr key={user.id} className="hover:bg-muted/50">
              <Td>
                <button
                  type="button"
                  onClick={() => setDetailId(user.id)}
                  className="flex items-center gap-2.5 text-left hover:underline"
                >
                  <Avatar src={user.avatar} name={user.username} size="sm" />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {user.username}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </span>
                </button>
              </Td>
              <Td>
                <RoleBadge role={user.role} />
              </Td>
              <Td>
                <ApplyStatusBadge status={user.adminApplyStatus} />
              </Td>
              <Td>
                {user.isBlacklisted ? (
                  <StatusBadge tone="danger">已拉黑</StatusBadge>
                ) : (
                  <StatusBadge tone="success">正常</StatusBadge>
                )}
              </Td>
              <Td className="whitespace-nowrap text-muted-foreground">
                {formatDateTime(user.createdAt)}
              </Td>
              <Td className="text-right">
                <div className="flex justify-end gap-1">
                  {user.adminApplyStatus === 'PENDING' && (
                    <>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() =>
                          setConfirm({
                            type: 'review',
                            user,
                            status: 'APPROVED',
                          })
                        }
                      >
                        <UserCheck className="size-3.5" />
                        通过
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() =>
                          setConfirm({
                            type: 'review',
                            user,
                            status: 'REJECTED',
                          })
                        }
                      >
                        拒绝
                      </Button>
                    </>
                  )}

                  {user.role !== 'SYSTEM_ADMIN' && (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() =>
                        setConfirm({
                          type: 'setRole',
                          user,
                          role: user.role === 'ADMIN' ? 'REGULAR' : 'ADMIN',
                        })
                      }
                    >
                      <ShieldCheck className="size-3.5" />
                      {user.role === 'ADMIN' ? '取消管理员' : '设为管理员'}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setConfirm({ type: 'blacklist', user })}
                  >
                    <Ban className="size-3.5" />
                    {user.isBlacklisted ? '解除' : '拉黑'}
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

      {confirmDialog && (
        <ConfirmDialog
          open={!!confirm}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmText={confirmDialog.confirmText}
          destructive={confirmDialog.destructive}
          loading={acting}
          onConfirm={() => void handleConfirm()}
          onOpenChange={(open) => !open && setConfirm(null)}
        />
      )}

      <UserDetailDialog
        userId={detailId}
        onClose={() => setDetailId(null)}
        onJumpWorks={(id) => {
          setDetailId(null);
          window.location.href = `/admin/works?createUserId=${id}`;
        }}
      />
    </div>
  );
}

/** 用户详情抽屉：展示跨实体统计（问卷 / 答卷 / 文章 / 留言 / 订阅） */
function UserDetailDialog({
  userId,
  onClose,
  onJumpWorks,
}: {
  userId: number | null;
  onClose: () => void;
  onJumpWorks: (id: number) => void;
}) {
  const [data, setData] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId === null) {
      setData(null);
      return;
    }
    setLoading(true);
    adminStatsApi
      .userDetail(userId)
      .then(setData)
      .catch(() => toast.error('用户详情加载失败'))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <Dialog open={userId !== null} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>用户详情</DialogTitle>
          <DialogDescription>该账号的基本信息与全站数据统计</DialogDescription>
        </DialogHeader>

        {loading || !data ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar src={data.user.avatar} name={data.user.username} size="md" />
              <div className="min-w-0">
                <p className="truncate font-medium">{data.user.username}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {data.user.email}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <RoleBadge role={data.user.role} />
              <ApplyStatusBadge status={data.user.adminApplyStatus} />
              {data.user.isBlacklisted && (
                <StatusBadge tone="danger">已拉黑</StatusBadge>
              )}
              {data.subscription && <StatusBadge tone="info">已订阅邮件</StatusBadge>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatBlock label="问卷" value={data.stats.workCount} />
              <StatBlock label="答卷" value={data.stats.answerCount} />
              <StatBlock label="文章" value={data.stats.articleCount} />
              <StatBlock label="留言" value={data.stats.contactCount} />
            </div>

            <dl className="space-y-1.5 border-t border-border pt-3 text-sm">
              <Row label="注册时间" value={formatDateTime(data.user.createdAt)} />
              <Row label="最近更新" value={formatDateTime(data.user.updatedAt)} />
              <Row
                label="订阅邮箱"
                value={data.subscription?.email ?? '未订阅'}
              />
            </dl>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onJumpWorks(data.user.id)}
            >
              <Users className="size-4" />
              查看 TA 的问卷
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums">
        {formatNumber(value)}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate">{value}</dd>
    </div>
  );
}
