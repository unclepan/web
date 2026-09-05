'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronRight,
  FolderTree,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader } from '../_components/PageHeader';
import { EmptyState } from '../_components/EmptyState';
import { ConfirmDialog } from '../_components/ConfirmDialog';
import { StatusBadge } from '../_components/StatusBadge';
import { adminCategoryApi } from '../_lib/api';
import type { AdminCategory } from '../_lib/types';

/** 展平后的树节点，带层级深度便于缩进渲染 */
interface FlatNode {
  node: AdminCategory;
  depth: number;
}

export default function AdminCategoriesPage() {
  const [tree, setTree] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AdminCategory | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTree(await adminCategoryApi.tree());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '分类树加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const flat = useMemo(() => flattenTree(tree), [tree]);

  return (
    <div className="mx-auto max-w-[1000px]">
      <PageHeader
        title="分类管理"
        description="文档与设计稿共用的无限级分类树（最多 5 级）"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void load()}>
              <RotateCcw className="size-4" />
              刷新
            </Button>
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="size-4" />
              新建分类
            </Button>
          </>
        }
      />

      <div className="rounded-lg border border-border bg-card shadow-sm">
        {loading ? (
          <div className="h-40 animate-pulse rounded-lg bg-muted" />
        ) : flat.length === 0 ? (
          <EmptyState
            icon={FolderTree}
            title="还没有分类"
            description="创建第一个分类来组织文章。"
          />
        ) : (
          <ul className="py-2">
            {flat.map(({ node, depth }) => (
              <li
                key={node.id}
                className="flex items-center gap-2 px-4 py-2 hover:bg-muted/50"
                style={{ paddingLeft: 16 + depth * 24 }}
              >
                {depth > 0 && (
                  <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="truncate font-medium">{node.name}</span>
                  {node.englishName && (
                    <span className="ml-2 truncate text-xs text-muted-foreground">
                      {node.englishName}
                    </span>
                  )}
                </span>
                <StatusBadge>{node._count?.articles ?? 0} 篇</StatusBadge>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setEditing(node)}
                    title="编辑"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setPendingDelete(node)}
                    title="删除"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <CategoryFormDialog
        open={creating || !!editing}
        node={editing}
        tree={flat}
        submitting={submitting}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSubmit={async (payload) => {
          setSubmitting(true);
          try {
            if (editing) {
              await adminCategoryApi.update(editing.id, payload);
              toast.success('分类已更新');
            } else {
              await adminCategoryApi.create(payload);
              toast.success('分类已创建');
            }
            setCreating(false);
            setEditing(null);
            await load();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : '保存失败');
          } finally {
            setSubmitting(false);
          }
        }}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="删除分类？"
        description={`「${pendingDelete?.name ?? ''}」将被删除。系统将把它的子分类上提一级，其下的文章保留但变为未分类。`}
        confirmText="删除（子上提）"
        destructive
        loading={submitting}
        onConfirm={async () => {
          if (!pendingDelete) return;
          setSubmitting(true);
          try {
            await adminCategoryApi.remove(pendingDelete.id, 'orphan');
            toast.success('分类已删除');
            setPendingDelete(null);
            await load();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : '删除失败');
          } finally {
            setSubmitting(false);
          }
        }}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      />
    </div>
  );
}

/** 深度优先展平，子树按原顺序接在父节点后面 */
function flattenTree(nodes: AdminCategory[], depth = 0): FlatNode[] {
  const result: FlatNode[] = [];
  for (const node of nodes) {
    result.push({ node, depth });
    if (node.children?.length) {
      result.push(...flattenTree(node.children, depth + 1));
    }
  }
  return result;
}

function CategoryFormDialog({
  open,
  node,
  tree,
  submitting,
  onClose,
  onSubmit,
}: {
  open: boolean;
  node: AdminCategory | null;
  tree: FlatNode[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    englishName?: string;
    parentId?: number | null;
  }) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [parentId, setParentId] = useState<string>('none');

  // 弹窗每次打开时回填（编辑）或清空（新建）
  useEffect(() => {
    if (!open) return;
    setName(node?.name ?? '');
    setEnglishName(node?.englishName ?? '');
    setParentId(node?.parentId ? String(node.parentId) : 'none');
  }, [open, node]);

  const isEdit = !!node;

  /** 不能把分类挂到自己或自己的子孙下，否则成环 */
  const parentOptions = useMemo(() => {
    if (!node) return tree;
    const banned = new Set<number>([node.id]);
    const collect = (id: number) => {
      for (const { node: n } of tree) {
        if (n.parentId === id) {
          banned.add(n.id);
          collect(n.id);
        }
      }
    };
    collect(node.id);
    return tree.filter(({ node: n }) => !banned.has(n.id));
  }, [tree, node]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑分类' : '新建分类'}</DialogTitle>
          <DialogDescription>
            英文名用于多语言站点展示，留空则回落到中文名。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">名称</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：入门指南"
              maxLength={50}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat-en">英文名</Label>
            <Input
              id="cat-en"
              value={englishName}
              onChange={(e) => setEnglishName(e.target.value)}
              placeholder="Getting Started"
              maxLength={50}
            />
          </div>

          <div className="space-y-1.5">
            <Label>父分类</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger className="h-9 w-full" size="default">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">（作为顶级分类）</SelectItem>
                {parentOptions.map(({ node: n, depth }) => (
                  <SelectItem key={n.id} value={String(n.id)}>
                    {depth > 0 ? `${'　'.repeat(depth)}└ ` : ''}
                    {n.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            取消
          </Button>
          <Button
            disabled={submitting || !name.trim()}
            onClick={() =>
              void onSubmit({
                name: name.trim(),
                englishName: englishName.trim() || undefined,
                parentId: parentId === 'none' ? null : Number(parentId),
              })
            }
          >
            {submitting ? '保存中…' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
