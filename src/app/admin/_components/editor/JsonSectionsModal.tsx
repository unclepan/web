'use client';

/**
 * JSON 逃生舱：直接编辑 sections 的原始 JSON
 *
 * 存在理由：Editor.js 只能承载 6 种块，剩下 4 种（link / image-modal /
 * collapsible / download）只能以「只读块」形式存在。要批量改这些块、
 * 或从别处迁移内容，手改 JSON 反而最快。docs 工程有同样的入口。
 *
 * 与 docs 的差异：
 *   - 外观用项目 Dialog + shadcn 按钮（docs 是自建 modal + slate 配色）
 *   - 校验失败时**禁用「应用」按钮**并给出具体原因，而不是允许应用后再炸
 *   - 只校验结构（数组 / 每项有 id·title·blocks），不校验 block 内部 ——
 *     block 的合法形态归 `DocsContentBlock` 管，这里越界校验只会挡住合法的新类型
 */

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { DocsSection } from '@/lib/api/modules/docs.types';

export function JsonSectionsModal({
  open,
  sections,
  onApply,
  onClose,
}: {
  open: boolean;
  sections: DocsSection[];
  onApply: (next: DocsSection[]) => Promise<void>;
  onClose: () => void;
}) {
  const [text, setText] = useState('');
  const [applying, setApplying] = useState(false);

  // 每次打开用当前 sections 回填；错误由 validate() 实时推导，不额外存 state
  useEffect(() => {
    if (!open) return;
    setText(JSON.stringify(sections, null, 2));
  }, [open, sections]);

  /** 解析 + 结构校验，返回错误文案（合法则为空） */
  const validate = (raw: string): { error: string; value?: DocsSection[] } => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'JSON 解析失败' };
    }

    if (!Array.isArray(parsed)) {
      return { error: '最外层必须是 sections 数组' };
    }

    for (const [i, item] of parsed.entries()) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return { error: `第 ${i + 1} 项必须是对象` };
      }
      const s = item as Record<string, unknown>;
      if (typeof s.id !== 'string') {
        return { error: `第 ${i + 1} 项缺少字符串字段 id` };
      }
      if (typeof s.title !== 'string') {
        return { error: `第 ${i + 1} 项缺少字符串字段 title` };
      }
      if (!Array.isArray(s.blocks)) {
        return { error: `第 ${i + 1} 项的 blocks 必须是数组` };
      }
    }

    return { error: '', value: parsed as DocsSection[] };
  };

  const parsed = text.trim() ? validate(text) : { error: '内容为空' };
  const canApply = !parsed.error;

  const apply = async () => {
    if (!parsed.value) return;
    setApplying(true);
    try {
      await onApply(parsed.value);
      onClose();
    } finally {
      setApplying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-3xl">
        <DialogHeader>
          <DialogTitle>JSON 编辑</DialogTitle>
          <DialogDescription>
            直接改 sections 原始 JSON，应用后会整体回灌到编辑器。
          </DialogDescription>
        </DialogHeader>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          className="min-h-[45vh] w-full resize-y rounded-md border border-border bg-background p-3 font-mono text-xs leading-relaxed text-foreground focus:border-ring focus:outline-none"
        />

        {parsed.error && (
          <p className="text-xs text-red-600 dark:text-red-300">
            {parsed.error}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={applying}>
            取消
          </Button>
          <Button onClick={() => void apply()} disabled={!canApply || applying}>
            {applying ? '应用中…' : '应用'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
