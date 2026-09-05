'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Pencil, Plus, RotateCcw, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PageHeader } from '../_components/PageHeader';
import { TableCard, Th, Td } from '../_components/TableCard';
import { Pagination } from '../_components/Pagination';
import { EmptyState } from '../_components/EmptyState';
import { SearchInput } from '../_components/SearchInput';
import { ConfirmDialog } from '../_components/ConfirmDialog';
import { StatusBadge } from '../_components/StatusBadge';
import { useAdminList } from '../_hooks/useAdminList';
import { useDebouncedValue } from '../_hooks/useDebouncedValue';
import {
  ArticleMetaForm,
  EMPTY_META,
  flattenTree,
  metaFromArticle,
  metaToPayload,
  type ArticleMetaValue,
  type FlatCategory,
} from '../_components/editor/ArticleMetaForm';
import { adminArticleApi, adminCategoryApi } from '../_lib/api';
import { formatDateTime } from '../_lib/format';
import type { AdminArticle, ArticleFlagsPatch } from '../_lib/types';

const PAGE_SIZE = 20;

export default function AdminArticlesPage() {
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState('all');
  const [filter, setFilter] = useState('all');
  const [pendingFlag, setPendingFlag] = useState<{
    article: AdminArticle;
    patch: ArticleFlagsPatch;
    label: string;
  } | null>(null);
  const [applying, setApplying] = useState(false);
  /** 元数据弹窗：editing 为 null 表示新建 */
  const [metaOpen, setMetaOpen] = useState(false);
  const [editing, setEditing] = useState<AdminArticle | null>(null);
  const [meta, setMeta] = useState<ArticleMetaValue>(EMPTY_META);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<FlatCategory[]>([]);

  const debouncedKeyword = useDebouncedValue(keyword);
  const reloadKey = [debouncedKeyword, type, filter].join('|');

  const fetcher = useCallback(
    async (page: number) => {
      const res = await adminArticleApi.list({
        page,
        pageSize: PAGE_SIZE,
        type: type === 'all' ? undefined : type,
        filter: filter === 'all' ? undefined : filter,
        q: debouncedKeyword || undefined,
      });
      return { items: res.items, total: res.total };
    },
    [debouncedKeyword, type, filter],
  );

  const list = useAdminList(fetcher, reloadKey, PAGE_SIZE, '文章列表加载失败');

  // 分类树只在挂载时取一次：编辑弹窗的下拉要用，分类改动频率极低
  useEffect(() => {
    adminCategoryApi
      .tree()
      .then((tree) => setCategories(flattenTree(tree)))
      .catch(() => setCategories([]));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setMeta(EMPTY_META);
    setMetaOpen(true);
  };

  const openEdit = (article: AdminArticle) => {
    setEditing(article);
    setMeta(metaFromArticle(article));
    setMetaOpen(true);
  };

  const closeDialog = () => {
    setMetaOpen(false);
    setEditing(null);
  };

  const submitMeta = async () => {
    if (!meta.title.trim() || !meta.description.trim()) return;
    setSaving(true);
    try {
      await adminArticleApi.upsert(metaToPayload(meta, editing?.uuid));
      toast.success(editing ? '文章已更新' : '文章已创建');
      closeDialog();
      list.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const resetFilters = () => {
    setKeyword('');
    setType('all');
    setFilter('all');
  };

  /** 切换开关：先弹确认，避免误点直接改线上展示位 */
  const requestFlagToggle = (
    article: AdminArticle,
    patch: ArticleFlagsPatch,
    label: string,
  ) => {
    setPendingFlag({ article, patch, label });
  };

  const applyFlag = async () => {
    if (!pendingFlag) return;
    setApplying(true);
    try {
      await adminArticleApi.patchFlags(pendingFlag.article.id, pendingFlag.patch);
      toast.success('已更新');
      setPendingFlag(null);
      list.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新失败');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="文章管理"
        description="管理全站文档与设计稿的展示位与可见性"
        actions={
          <>
            <span className="mr-1 text-xs text-muted-foreground">
              正文编辑（sections）暂不支持
            </span>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              新建文章
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3 shadow-sm">
        <SearchInput
          value={keyword}
          onChange={setKeyword}
          placeholder="搜索标题 / 描述"
          className="w-full sm:w-64"
        />

        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-9 w-32" size="default">
            <SelectValue placeholder="类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="DOCUMENTATION">文档</SelectItem>
            <SelectItem value="DESIGN">设计稿</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="h-9 w-32" size="default">
            <SelectValue placeholder="展示位" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="featured">推荐</SelectItem>
            <SelectItem value="hot">热门</SelectItem>
            <SelectItem value="hidden">已隐藏</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="ghost" size="sm" onClick={resetFilters} className="ml-auto">
          <RotateCcw className="size-4" />
          重置
        </Button>
      </div>

      <TableCard
        loading={list.loading}
        minWidth="min-w-[1080px]"
        isEmpty={list.items.length === 0}
        empty={
          <EmptyState
            icon={Search}
            title="没有匹配的文章"
            description="换个关键词或切换类型试试。"
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
            <Th>标题</Th>
            <Th>类型</Th>
            <Th>分类</Th>
            <Th>作者</Th>
            <Th>语言</Th>
            <Th className="text-center">热门</Th>
            <Th className="text-center">推荐</Th>
            <Th className="text-center">可见</Th>
            <Th className="text-center">需登录</Th>
            <Th>更新时间</Th>
            <Th className="text-right">操作</Th>
          </tr>
        </thead>
        <tbody>
          {list.items.map((article) => (
            <tr key={article.id} className="hover:bg-muted/50">
              <Td>
                <p className="max-w-72 truncate font-medium">{article.title}</p>
                <p className="max-w-72 truncate text-xs text-muted-foreground">
                  {article.description}
                </p>
              </Td>
              <Td>
                {article.type === 'DESIGN' ? (
                  <StatusBadge tone="purple">设计稿</StatusBadge>
                ) : (
                  <StatusBadge tone="info">文档</StatusBadge>
                )}
              </Td>
              <Td className="text-muted-foreground">
                {article.category?.name ?? '—'}
              </Td>
              <Td className="whitespace-nowrap text-muted-foreground">
                {article.author.username}
              </Td>
              <Td>
                <StatusBadge>{article.locale === 'zh' ? '中文' : 'English'}</StatusBadge>
              </Td>
              <FlagCell>
                <Switch
                  checked={article.isHot}
                  onCheckedChange={() =>
                    requestFlagToggle(
                      article,
                      { isHot: !article.isHot },
                      article.isHot ? '取消热门' : '设为热门',
                    )
                  }
                  aria-label="热门"
                />
              </FlagCell>
              <FlagCell>
                <Switch
                  checked={article.isFeatured}
                  onCheckedChange={() =>
                    requestFlagToggle(
                      article,
                      { isFeatured: !article.isFeatured },
                      article.isFeatured ? '取消推荐' : '设为推荐',
                    )
                  }
                  aria-label="推荐"
                />
              </FlagCell>
              <FlagCell>
                <Switch
                  checked={article.isVisible}
                  onCheckedChange={() =>
                    requestFlagToggle(
                      article,
                      { isVisible: !article.isVisible },
                      article.isVisible ? '隐藏文章' : '显示文章',
                    )
                  }
                  aria-label="可见"
                />
              </FlagCell>
              <FlagCell>
                <Switch
                  checked={article.isLoginRequired}
                  onCheckedChange={() =>
                    requestFlagToggle(
                      article,
                      { isLoginRequired: !article.isLoginRequired },
                      article.isLoginRequired ? '取消登录限制' : '要求登录',
                    )
                  }
                  aria-label="需登录"
                />
              </FlagCell>
              <Td className="whitespace-nowrap text-muted-foreground">
                {formatDateTime(article.updatedAt)}
              </Td>
              <Td className="text-right whitespace-nowrap">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => openEdit(article)}
                  title="编辑元数据"
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button variant="ghost" size="icon-xs" asChild title="编辑正文">
                  <Link href={`/admin/articles/${article.uuid}`}>
                    <FileText className="size-3.5" />
                  </Link>
                </Button>
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

      <ConfirmDialog
        open={!!pendingFlag}
        title={`${pendingFlag?.label ?? ''}？`}
        description={`将对「${pendingFlag?.article.title ?? ''}」执行该变更，前台展示会立即生效。`}
        confirmText="确认"
        loading={applying}
        onConfirm={() => void applyFlag()}
        onOpenChange={(open) => !open && setPendingFlag(null)}
      />

      <Dialog open={metaOpen} onOpenChange={(v) => !v && closeDialog()}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{editing ? '编辑文章' : '新建文章'}</DialogTitle>
            <DialogDescription>
              {editing
                ? '只改元数据，正文不会被清空。改正文请点列表里的文档图标。'
                : '新建后正文为空，创建完成后再进编辑器写内容。'}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto py-2 pr-1">
            <ArticleMetaForm
              value={meta}
              onChange={setMeta}
              categories={categories}
              disabledType={!!editing}
              idPrefix="list"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={saving}>
              取消
            </Button>
            <Button
              disabled={
                saving || !meta.title.trim() || !meta.description.trim()
              }
              onClick={() => void submitMeta()}
            >
              {saving ? '保存中…' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FlagCell({ children }: { children: React.ReactNode }) {
  return <td className="border-b border-border text-center">{children}</td>;
}

