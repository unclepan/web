'use client';

/**
 * 文章元数据表单（受控组件）
 *
 * 抽出来给两处共用：
 *   - `articles/page.tsx` 的元数据弹窗
 *   - `articles/[uuid]/page.tsx` 的正文编辑器页
 *
 * 做成**受控**而不是内部 useState：两处的回填时机不同（弹窗是打开时回填、
 * 编辑器页是详情到位后回填），受控由父组件决定最省心，也避免
 * 「useEffect 依赖 article 对象引用」这类隐蔽 bug。
 *
 * ⚠️ 这里不碰 sections。后端 upsert 在没收到 sections 时会保留原正文，
 * 所以走这个表单的路径不会误删正文。
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type {
  AdminCategory,
  ArticleType,
  ArticleUpsertPayload,
  DocsLocale,
} from '../../_lib/types';

export interface ArticleMetaValue {
  type: ArticleType;
  locale: DocsLocale;
  title: string;
  description: string;
  coverImage: string;
  categoryId: number | null;
  sortOrder: number;
  isHot: boolean;
  isFeatured: boolean;
  isVisible: boolean;
  isLoginRequired: boolean;
}

export const EMPTY_META: ArticleMetaValue = {
  type: 'DOCUMENTATION',
  locale: 'zh',
  title: '',
  description: '',
  coverImage: '',
  categoryId: null,
  sortOrder: 0,
  isHot: false,
  isFeatured: false,
  isVisible: true,
  isLoginRequired: false,
};

/** 文章 → 表单值（列表弹窗与编辑器页共用，避免两处各拼一遍字段） */
export function metaFromArticle(a: {
  type: ArticleType;
  locale: DocsLocale;
  title: string;
  description: string;
  coverImage?: string | null;
  categoryId: number | null;
  sortOrder: number;
  isHot: boolean;
  isFeatured: boolean;
  isVisible: boolean;
  isLoginRequired: boolean;
}): ArticleMetaValue {
  return {
    type: a.type,
    locale: a.locale,
    title: a.title,
    description: a.description,
    coverImage: a.coverImage ?? '',
    categoryId: a.categoryId,
    sortOrder: a.sortOrder,
    isHot: a.isHot,
    isFeatured: a.isFeatured,
    isVisible: a.isVisible,
    isLoginRequired: a.isLoginRequired,
  };
}

/**
 * 表单值 → 提交载荷
 *
 * ⚠️ 刻意**不带 sections**：后端 upsert 在没收到 sections 时会保留原正文，
 * 所以走这个表单（只改元数据）不会误删内容。正文编辑器会自行补上 sections。
 */
export function metaToPayload(
  meta: ArticleMetaValue,
  uuid?: string,
): ArticleUpsertPayload {
  return {
    ...(uuid ? { uuid } : {}),
    type: meta.type,
    locale: meta.locale,
    title: meta.title.trim(),
    description: meta.description.trim(),
    coverImage: meta.coverImage.trim() || undefined,
    categoryId: meta.categoryId ?? undefined,
    sortOrder: meta.sortOrder,
    isHot: meta.isHot,
    isFeatured: meta.isFeatured,
    isVisible: meta.isVisible,
    isLoginRequired: meta.isLoginRequired,
  };
}

/** 分类树展平（带层级深度做缩进），供下拉选择 */
export interface FlatCategory {
  node: AdminCategory;
  depth: number;
}

export function flattenTree(
  nodes: AdminCategory[],
  depth = 0,
): FlatCategory[] {
  const result: FlatCategory[] = [];
  for (const node of nodes) {
    result.push({ node, depth });
    if (node.children?.length) {
      result.push(...flattenTree(node.children, depth + 1));
    }
  }
  return result;
}

export function ArticleMetaForm({
  value,
  onChange,
  categories,
  /** 编辑既有文章时类型不可改（它决定前台路由 /docs/:uuid 还是 /blog/:uuid） */
  disabledType = false,
  idPrefix = 'meta',
}: {
  value: ArticleMetaValue;
  onChange: (next: ArticleMetaValue) => void;
  categories: FlatCategory[];
  disabledType?: boolean;
  idPrefix?: string;
}) {
  const patch = (part: Partial<ArticleMetaValue>) =>
    onChange({ ...value, ...part });

  const flags: Array<{
    key: keyof Pick<
      ArticleMetaValue,
      'isHot' | 'isFeatured' | 'isVisible' | 'isLoginRequired'
    >;
    label: string;
  }> = [
    { key: 'isHot', label: '热门' },
    { key: 'isFeatured', label: '推荐' },
    { key: 'isVisible', label: '可见' },
    { key: 'isLoginRequired', label: '需登录' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-type`}>类型</Label>
          <Select
            value={value.type}
            onValueChange={(v) => patch({ type: v as ArticleType })}
            disabled={disabledType}
          >
            <SelectTrigger
              id={`${idPrefix}-type`}
              className="h-9 w-full"
              size="default"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DOCUMENTATION">文档</SelectItem>
              <SelectItem value="DESIGN">设计稿</SelectItem>
            </SelectContent>
          </Select>
          {disabledType && (
            <p className="text-xs text-muted-foreground">
              类型决定路由，创建后不可改
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-locale`}>语言</Label>
          <Select
            value={value.locale}
            onValueChange={(v) => patch({ locale: v as DocsLocale })}
          >
            <SelectTrigger
              id={`${idPrefix}-locale`}
              className="h-9 w-full"
              size="default"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zh">中文</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-title`}>标题</Label>
        <Input
          id={`${idPrefix}-title`}
          value={value.title}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder="文章标题"
          maxLength={200}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-desc`}>描述</Label>
        <Input
          id={`${idPrefix}-desc`}
          value={value.description}
          onChange={(e) => patch({ description: e.target.value })}
          placeholder="列表页与 SEO 用的简短描述"
          maxLength={500}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-cover`}>封面图 URL</Label>
        <Input
          id={`${idPrefix}-cover`}
          value={value.coverImage}
          onChange={(e) => patch({ coverImage: e.target.value })}
          placeholder="https://…（设计稿必填，文档可留空）"
          maxLength={500}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-cat`}>分类</Label>
          <Select
            value={value.categoryId ? String(value.categoryId) : 'none'}
            onValueChange={(v) =>
              patch({ categoryId: v === 'none' ? null : Number(v) })
            }
          >
            <SelectTrigger
              id={`${idPrefix}-cat`}
              className="h-9 w-full"
              size="default"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">（未分类）</SelectItem>
              {categories.map(({ node, depth }) => (
                <SelectItem key={node.id} value={String(node.id)}>
                  {depth > 0 ? `${'　'.repeat(depth)}└ ` : ''}
                  {node.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-sort`}>排序值</Label>
          <Input
            id={`${idPrefix}-sort`}
            type="number"
            min={0}
            value={String(value.sortOrder)}
            onChange={(e) => patch({ sortOrder: Number(e.target.value) || 0 })}
          />
          <p className="text-xs text-muted-foreground">越大越靠前</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-md bg-muted/50 p-3">
        {flags.map((flag) => (
          <label
            key={flag.key}
            className="flex cursor-pointer items-center justify-between gap-2 text-sm"
          >
            <span className="text-muted-foreground">{flag.label}</span>
            <Switch
              checked={value[flag.key]}
              onCheckedChange={(v) => patch({ [flag.key]: v })}
              aria-label={flag.label}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
