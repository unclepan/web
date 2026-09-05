'use client';

/**
 * 文章正文编辑器（/admin/articles/[uuid]）
 *
 * 数据流向：
 *   GET /docs/articles/admin/uuid/:uuid  →  sections
 *        ↓ flattenSections
 *   Editor.js blocks
 *        ↓ 用户编辑
 *        ↓ editor.save() → splitIntoSections
 *   POST /docs/articles/admin（带 sections）
 *
 * 只有 SYSTEM_ADMIN 能进：后端 controller 是类级守卫，
 * 前端这层由 AdminShell 的 AdminGuard 兜（与后台其它页一致）。
 *
 * 逻辑参考 docs 的 `admin/editor/design/page.tsx` + `ArticleEditor.tsx`，
 * 但样式与交互全部按本项目重做：shadcn 组件、mosaic 排版、sonner 提示
 * （docs 用的是 window.alert 与 slate 配色，这里都不沿用）。
 */

import { use, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, FileJson, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { DocsSection } from '@/lib/api/modules/docs.types';
import {
  ArticleMetaForm,
  EMPTY_META,
  flattenTree,
  metaFromArticle,
  metaToPayload,
  type ArticleMetaValue,
  type FlatCategory,
} from '../../_components/editor/ArticleMetaForm';
import { EditorJsHost, type EditorJsHandle } from '../../_components/editor/EditorJsHost';
import { PreviewModal } from '../../_components/editor/PreviewModal';
import { JsonSectionsModal } from '../../_components/editor/JsonSectionsModal';
import {
  RECOVERED_SECTION_TITLE,
  flattenSections,
  splitIntoSections,
} from '../../_lib/editor/adapter';
import { adminArticleApi, adminCategoryApi } from '../../_lib/api';
import type { AdminArticle } from '../../_lib/types';

export default function AdminArticleEditorPage({
  params,
}: {
  // Next 16：动态段参数是 Promise
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = use(params);

  const [article, setArticle] = useState<AdminArticle | null>(null);
  const [categories, setCategories] = useState<FlatCategory[]>([]);
  const [meta, setMeta] = useState<ArticleMetaValue>(EMPTY_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const [sectionsForPreview, setSectionsForPreview] = useState<DocsSection[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [jsonOpen, setJsonOpen] = useState(false);

  const editorRef = useRef<EditorJsHandle>(null);

  // ── 拉取文章与分类 ────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [detail, tree] = await Promise.all([
          adminArticleApi.detailByUuid(uuid),
          adminCategoryApi.tree(),
        ]);
        if (cancelled) return;

        setArticle(detail);
        setCategories(flattenTree(tree));
        setMeta(metaFromArticle(detail));
        setError('');
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '加载失败');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [uuid]);

  // ── 未保存离开拦截 ────────────────────────────────────────
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  /** 从编辑器取当前 sections（预览与 JSON 编辑共用同一份取数逻辑） */
  const readSections = useCallback(async (): Promise<DocsSection[] | null> => {
    const handle = editorRef.current;
    if (!handle) return null;
    try {
      const blocks = await handle.getBlocks();
      return splitIntoSections(blocks).sections;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '读取正文失败');
      return null;
    }
  }, []);

  const openPreview = async () => {
    const sections = await readSections();
    if (!sections) return;
    setSectionsForPreview(sections);
    setPreviewOpen(true);
  };

  const openJson = async () => {
    const sections = await readSections();
    if (!sections) return;
    setSectionsForPreview(sections);
    setJsonOpen(true);
  };

  const handleSave = async () => {
    if (!article) return;

    if (!meta.title.trim()) {
      toast.error('请输入标题');
      return;
    }
    if (!meta.description.trim()) {
      toast.error('请输入描述');
      return;
    }

    setSaving(true);
    try {
      const blocks = (await editorRef.current?.getBlocks()) ?? [];
      const { sections, recoveredBlocks } = splitIntoSections(blocks);

      if (sections.length === 0) {
        toast.error('正文不能为空');
        return;
      }

      // metaToPayload 刻意不带 sections（保护元数据路径），这里补上正文
      await adminArticleApi.upsert({
        ...metaToPayload(meta, article.uuid),
        sections,
      });

      toast.success('已保存');
      if (recoveredBlocks > 0) {
        toast.warning(
          `正文开头有 ${recoveredBlocks} 个块不在任何二级标题下，已归入「${RECOVERED_SECTION_TITLE}」`,
        );
      }
      setDirty(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  // ── 渲染 ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-16 text-center text-sm text-muted-foreground">
        <Loader2 className="mx-auto mb-3 size-5 animate-spin" />
        正在加载文章…
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-16 text-center">
        <p className="text-sm text-red-600 dark:text-red-300">
          {error || '文章不存在'}
        </p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link href="/admin/articles">返回文章列表</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6">
      {/* 头部：返回 + 标题 + 操作 */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild title="返回列表">
          <Link href="/admin/articles">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold text-foreground">
            {article.title || '（无标题）'}
          </h1>
          <p className="truncate text-xs text-muted-foreground">
            {article.type === 'DESIGN' ? '设计稿' : '文档'} ·{' '}
            {article.locale === 'zh' ? '中文' : 'English'}
            {dirty && ' · 未保存'}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void openJson()}>
            <FileJson className="size-4" />
            JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => void openPreview()}>
            <Eye className="size-4" />
            预览
          </Button>
          <Button size="sm" onClick={() => void handleSave()} disabled={saving}>
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            保存
          </Button>
        </div>
      </div>

      {/* 元数据 */}
      <section className="mb-6 rounded-lg border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">
          元数据
        </h2>
        <ArticleMetaForm
          value={meta}
          onChange={(next) => {
            setMeta(next);
            setDirty(true);
          }}
          categories={categories}
          disabledType
          idPrefix="editor"
        />
      </section>

      {/* 正文 */}
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">正文</h2>
          <p className="text-xs text-muted-foreground">
            用「二级标题」开启新章节
          </p>
        </div>

        {/*
          用 key 在数据到位后重建编辑器：Editor.js 只在 mount 时读一次 data，
          若挂载时 article 还是 null，初值就永远为空。带上 updatedAt 是为了
          保存后外部刷新数据时也能重建。
        */}
        <EditorJsHost
          key={`edit-${article.uuid}-${article.updatedAt}`}
          ref={editorRef}
          /*
            `AdminArticle.sections` 是 unknown（后台列表接口不返回正文，见 types.ts），
            但走 detailByUuid 拿到的肯定带正文，这里断言成 DocsSection[]。
          */
          initialBlocks={flattenSections(
            (article.sections ?? []) as DocsSection[],
          )}
          onChange={() => setDirty(true)}
        />
      </section>

      <PreviewModal
        open={previewOpen}
        title={meta.title}
        description={meta.description}
        sections={sectionsForPreview}
        onClose={() => setPreviewOpen(false)}
      />

      <JsonSectionsModal
        open={jsonOpen}
        sections={sectionsForPreview}
        onApply={async (next) => {
          await editorRef.current?.setBlocks(flattenSections(next));
          setDirty(true);
          toast.success('已应用到编辑器');
        }}
        onClose={() => setJsonOpen(false)}
      />
    </div>
  );
}
