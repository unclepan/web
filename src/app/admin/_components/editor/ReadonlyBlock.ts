/**
 * 只读块：承载没有 Editor.js 插件的 4 种 ContentBlock
 *
 * 涉及类型：`link` / `image-modal` / `collapsible` / `download`
 * （见 _lib/editor/adapter.ts 的 READONLY_TYPES）
 *
 * 这些类型 Editor.js 没有对应插件，硬造插件成本太高且用不上。
 * 处理方式沿用 docs 的思路：**把原始 JSON 原样存起来**，编辑时是一个带实时校验的
 * 文本框，保存时原样回写 —— 保证往返无损，只是编辑体验朴素一点。
 *
 * 逻辑参考 docs 的 ArticleEditor.ReadonlyBlock，但有两点不同：
 *   1. 样式走 `editorjs.module.css` + 项目 token（docs 是内联 Object.assign(style) + 硬编码色值）
 *   2. 方法名不叫 `validate` —— Editor.js 会把 `validate` 当作块校验钩子调用，
 *      名字撞了会导致保存流程被意外接管（docs 踩过，这里沿用 `_validateInput`）
 */

import type { BlockTool, ToolboxConfig } from '@editorjs/editorjs';
import styles from './editorjs.module.css';

export interface ReadonlyBlockData {
  /** 原始 ContentBlock 的 JSON 字符串 */
  _original: string;
  /** 展示用摘要，如「链接: 点这里」 */
  _summary: string;
}

const EMPTY_BLOCK = JSON.stringify({ type: 'paragraph', text: '' });

/** 锁形图标：纯 SVG 字符串，Editor.js 要求 toolbox.icon 是 SVG 文本 */
const LOCK_ICON =
  '<svg width="17" height="15" viewBox="0 0 17 15" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M4.5 6V4.5a4 4 0 1 1 8 0V6h.5A2.5 2.5 0 0 1 15.5 8.5v4A2.5 2.5 0 0 1 13 15H4a2.5 2.5 0 0 1-2.5-2.5v-4A2.5 2.5 0 0 1 4 6h.5Zm1.5 0h5V4.5a2.5 2.5 0 0 0-5 0V6Z" ' +
  'fill="currentColor"/></svg>';

type ConstructorOptions = {
  data?: Partial<ReadonlyBlockData>;
};

export default class ReadonlyBlock implements BlockTool {
  static get toolbox(): ToolboxConfig {
    return { title: '只读块', icon: LOCK_ICON };
  }

  static get isReadOnlySupported(): boolean {
    return true;
  }

  private data: ReadonlyBlockData;
  private textarea: HTMLTextAreaElement | null = null;
  private summaryEl: HTMLDivElement | null = null;
  private errorEl: HTMLDivElement | null = null;

  constructor({ data }: ConstructorOptions) {
    // 构造函数必须保证两个字段都是 string，否则 save() 可能产出 undefined
    this.data = {
      _original:
        typeof data?._original === 'string' ? data._original : EMPTY_BLOCK,
      _summary:
        typeof data?._summary === 'string' ? data._summary : '只读内容块',
    };
  }

  render(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = styles.readonly;
    // 阻止 Editor.js 对该块做内容级托管（否则光标/快捷键会穿透进来）
    wrapper.contentEditable = 'false';

    // 摘要行（始终显示）
    this.summaryEl = document.createElement('div');
    this.summaryEl.className = styles.readonlySummary;
    this.summaryEl.textContent = this.data._summary;
    wrapper.appendChild(this.summaryEl);

    // JSON 文本框
    const textarea = document.createElement('textarea');
    textarea.className = styles.readonlyTextarea;
    textarea.spellcheck = false;
    textarea.value = JSON.stringify(this.parseOriginal(), null, 2);
    wrapper.appendChild(textarea);
    this.textarea = textarea;

    // 阻止快捷键冒泡到 Editor.js（避免 Backspace 把整个块删掉）
    textarea.addEventListener('keydown', (e) => e.stopPropagation());

    // 强制纯文本粘贴：智能引号会污染 JSON，直接掐掉默认行为
    textarea.addEventListener('paste', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const text = e.clipboardData?.getData('text/plain') ?? '';
      const start = textarea.selectionStart ?? textarea.value.length;
      const end = textarea.selectionEnd ?? textarea.value.length;
      textarea.value =
        textarea.value.slice(0, start) + text + textarea.value.slice(end);
      const caret = start + text.length;
      textarea.setSelectionRange(caret, caret);
      this.validateInput(textarea.value);
    });

    textarea.addEventListener('input', () => {
      this.validateInput(textarea.value);
    });

    // 错误提示（默认隐藏）
    this.errorEl = document.createElement('div');
    this.errorEl.className = styles.readonlyError;
    this.errorEl.style.display = 'none';
    wrapper.appendChild(this.errorEl);

    this.validateInput(textarea.value);

    return wrapper;
  }

  save(): ReadonlyBlockData {
    if (this.textarea) {
      const block = this.tryParse(this.textarea.value);
      if (block) {
        this.data = {
          _original: JSON.stringify(block),
          _summary: buildSummary(block),
        };
      }
      // 解析失败 → 保留上次成功的 this.data，绝不把坏 JSON 写回库
    }
    return this.data;
  }

  // ── 内部方法 ──────────────────────────────────────────────

  /** 解析 _original 字符串 → ContentBlock 对象（失败返回空 paragraph） */
  private parseOriginal(): Record<string, unknown> {
    return this.tryParse(this.data._original) ?? { type: 'paragraph', text: '' };
  }

  /** 尝试把文本解析成合法的 ContentBlock 对象，失败返回 null */
  private tryParse(raw: string): Record<string, unknown> | null {
    try {
      const trimmed = raw.trim();
      if (!trimmed) return null;
      const parsed = JSON.parse(trimmed) as unknown;
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return null;
      }
      const obj = parsed as Record<string, unknown>;
      if (typeof obj.type !== 'string') return null;
      return obj;
    } catch {
      return null;
    }
  }

  /**
   * 实时校验并更新 UI（摘要 / 错误提示）
   *
   * 注意不能叫 `validate`，见文件头注释。
   */
  private validateInput(raw: string): void {
    const block = this.tryParse(raw);

    if (block) {
      if (this.summaryEl) this.summaryEl.textContent = buildSummary(block);
      if (this.errorEl) {
        this.errorEl.style.display = 'none';
        this.errorEl.textContent = '';
      }
      return;
    }

    if (!this.errorEl) return;
    const trimmed = raw.trim();
    let msg = '内容为空';
    if (trimmed) {
      try {
        JSON.parse(trimmed);
        msg = '必须是一个带 type 字段的 JSON 对象';
      } catch (err) {
        msg = err instanceof Error ? err.message : String(err);
      }
    }
    this.errorEl.textContent = `JSON 校验失败：${msg}`;
    this.errorEl.style.display = 'block';
  }
}

/** 基于 ContentBlock 生成一行摘要，让用户在编辑器里认得出这是什么块 */
function buildSummary(block: Record<string, unknown>): string {
  const type = String(block.type ?? 'unknown');

  switch (type) {
    case 'link':
      return `链接: ${block.text ?? block.href ?? ''}`;
    case 'image-modal': {
      const cfg = (block.config as Record<string, unknown>) ?? {};
      return `图片弹窗: ${cfg.alt ?? cfg.src ?? ''}`;
    }
    case 'collapsible':
      return `折叠面板: ${block.title ?? ''}`;
    case 'download': {
      const cfg = (block.config as Record<string, unknown>) ?? {};
      return `下载文件: ${cfg.filename ?? cfg.url ?? ''}`;
    }
    default:
      return `暂不支持预览的类型: ${type}`;
  }
}
