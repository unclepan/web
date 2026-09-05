'use client';

/**
 * 正文预览
 *
 * 关键点：**直接复用前台的 `ContentBlockRenderer`**，不另写一套渲染。
 * 这样编辑时看到的就是访客看到的，不会出现「预览好看、线上错位」。
 *
 * 渲染器一次只吃一个 block（`block: DocsContentBlock`），
 * 所以外层负责遍历 sections → 标题 + blocks。
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ContentBlockRenderer from '@/components/ContentBlockRenderer';
import type { DocsSection } from '@/lib/api/modules/docs.types';

export function PreviewModal({
  open,
  title,
  description,
  sections,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  sections: DocsSection[];
  onClose: () => void;
}) {
  const isEmpty = sections.length === 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>正文预览</DialogTitle>
          <DialogDescription>
            用前台同一个渲染器呈现，所见即所得。
          </DialogDescription>
        </DialogHeader>

        {isEmpty ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            还没有正文内容
          </p>
        ) : (
          <article className="space-y-8 py-2">
            <header className="space-y-1">
              <h1 className="text-2xl font-semibold text-foreground">
                {title || '（无标题）'}
              </h1>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </header>

            {sections.map((section) => (
              <section key={section.id} id={section.id} className="space-y-4">
                <h2 className="h3 scroll-mt-24 text-foreground">
                  {section.title}
                </h2>
                {/* 块没有稳定 id，用下标即可 —— 预览是只读的，不会重排 */}
                {(section.blocks ?? []).map((block, i) => (
                  <ContentBlockRenderer key={i} block={block} />
                ))}
              </section>
            ))}
          </article>
        )}
      </DialogContent>
    </Dialog>
  );
}
