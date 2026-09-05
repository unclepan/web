/**
 * Editor.js ⇄ DocsContentBlock 双向数据适配器
 *
 * 逻辑参考 docs 工程的 `src/utils/editorjs-adapter.ts`，但做了三处改动：
 *   1. **不再丢弃首个 h2 之前的块** —— 原实现 `if (!current) continue;` 会静默丢数据，
 *      这里把它们收进一个自动补建的章节，并通过返回值告知调用方去提示用户
 *   2. 类型换成 web 的 `DocsContentBlock`（与后端 JSON 同构，编辑器改完即最终数据）
 *   3. 图片尺寸丢失时不再拍脑袋填 800×450，改由上传成功后回填真实尺寸；
 *      读回旧数据仍给兜底值，但标记出来便于排查
 *
 * 只做数据转换，不碰任何 DOM / 样式。
 */

import type {
  DocsContentBlock,
  DocsSection,
} from '@/lib/api/modules/docs.types';

export interface EditorJsBlock {
  id?: string;
  type: string;
  data: Record<string, unknown>;
}

export interface EditorJsData {
  time?: number;
  blocks: EditorJsBlock[];
  version?: string;
}

/** splitIntoSections 的返回：sections + 被救回的游离块数量 */
export interface SplitResult {
  sections: DocsSection[];
  /**
   * 第一个 h2 之前的游离块数量。
   * > 0 表示自动补建了一个「未命名章节」来装它们，调用方应提示用户。
   */
  recoveredBlocks: number;
}

type TableColumnAlign = Extract<
  DocsContentBlock,
  { type: 'table' }
>['columns'][number]['align'];

const str = (v: unknown, fallback = ''): string =>
  v == null ? fallback : String(v);

const num = (v: unknown, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * text → kebab-case 锚点 id；空值回退到 "section"。
 * 保留中文（\u4e00-\u9fa5），与 docs 保持一致，避免中文标题全被滤成空串。
 */
export function slugify(text: string): string {
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section'
  );
}

/** 在 used 集合中为 base 分配一个不重复的 id */
export function uniqueId(base: string, used: Set<string>): string {
  let id = base;
  let n = 2;
  while (used.has(id)) id = `${base}-${n++}`;
  used.add(id);
  return id;
}

// ═══════════════════════════════════════════════════════════
// ContentBlock → Editor.js
// ═══════════════════════════════════════════════════════════

/**
 * 没有对应 Editor.js 插件的类型。
 *
 * 这四种只能以「只读块」形式存在：编辑时是 JSON 文本框，保存时原样回写，
 * 保证往返不丢。详见 _components/editor/ReadonlyBlock.ts。
 */
export const READONLY_TYPES = new Set<string>([
  'link',
  'image-modal',
  'collapsible',
  'download',
]);

/**
 * image 与 image-modal 在 `DocsContentBlock` 里是**合并声明**的：
 * `{ type: 'image' | 'image-modal'; config: … }`。
 * 所以 `Extract<DocsContentBlock, { type: 'image' }>` 会得到 never，
 * 必须用完整联合去取。ContentBlockRenderer 里也是这么处理的。
 */
type ImageBlock = Extract<DocsContentBlock, { type: 'image' | 'image-modal' }>;

/**
 * 正向转换表。
 *
 * 键刻意排除 `image` / `image-modal` 后单独补 `image`：
 * `image-modal` 属于只读类型（走 _readonly 分支），不会走到这张表，
 * 只留 `image` 一支并用 ImageBlock 承接。
 */
type BlockConverters = {
  [K in Exclude<DocsContentBlock['type'], 'image' | 'image-modal'>]?: (
    b: Extract<DocsContentBlock, { type: K }>,
  ) => EditorJsBlock;
} & { image?: (b: ImageBlock) => EditorJsBlock };

const toEditorJs: BlockConverters = {
  heading: (b) => ({
    type: 'header',
    data: { text: b.text, level: b.level, ...(b.id ? { anchor: b.id } : {}) },
  }),

  paragraph: (b) => ({ type: 'paragraph', data: { text: b.text } }),

  list: (b) => ({
    type: 'list',
    data: {
      style: b.style === 'ordered' ? 'ordered' : 'unordered',
      // @editorjs/list v2 接受纯字符串数组
      items: [...b.items],
    },
  }),

  code: (b) => ({
    type: 'code',
    data: { code: b.code, language: b.language },
  }),

  // 借 @editorjs/warning 承载 callout：title 存 variant，message 存正文
  callout: (b) => ({
    type: 'warning',
    data: { title: b.variant, message: b.text },
  }),

  table: (b) => ({
    type: 'table',
    data: {
      withHeadings: true,
      content: [b.columns.map((c) => c.header), ...b.rows.map((r) => r.cells)],
      caption: b.caption ?? '',
      // 自定义扩展字段：保存列对齐方式，往返不丢
      _align: b.columns.map((c) => c.align ?? 'left'),
    },
  }),

  image: (b) => ({
    type: 'image',
    data: {
      // 把宽高塞进 file，下次读回来（插件本身不存尺寸）
      file: {
        url: b.config.src,
        width: b.config.width,
        height: b.config.height,
      },
      caption: b.config.alt,
      withBorder: false,
      stretched: false,
      withBackground: false,
    },
  }),
};

/** 为只读块生成简要描述，方便编辑器中辨识 */
export function readonlySummary(b: DocsContentBlock): string {
  switch (b.type) {
    case 'link':
      return `链接: ${b.text}`;
    case 'image-modal':
      return `图片弹窗: ${b.config.alt || b.config.src}`;
    case 'collapsible':
      return `折叠面板: ${b.title}`;
    case 'download':
      return `下载文件: ${b.config.filename || b.config.url}`;
    default:
      return b.type;
  }
}

export function contentBlocksToEditorJs(
  blocks: DocsContentBlock[],
): EditorJsBlock[] {
  const out: EditorJsBlock[] = [];
  for (const b of blocks) {
    if (READONLY_TYPES.has(b.type)) {
      out.push({
        type: '_readonly',
        data: { _original: JSON.stringify(b), _summary: readonlySummary(b) },
      });
      continue;
    }
    // 整表按索引取值：`b.type` 含 image-modal，而转换表刻意没有这一支
    // （它走上面的只读分支），直接 `toEditorJs[b.type]` 会编译不过
    const convert = (
      toEditorJs as Record<string, ((x: DocsContentBlock) => EditorJsBlock) | undefined>
    )[b.type];
    if (convert) out.push(convert(b));
  }
  return out;
}

// ═══════════════════════════════════════════════════════════
// Editor.js → ContentBlock
// ═══════════════════════════════════════════════════════════

const toContent: Record<string, (d: Record<string, unknown>) => DocsContentBlock> = {
  header: (d) => {
    const text = str(d.text);
    const level = num(d.level) === 3 ? 3 : 2;
    const anchor = str(d.anchor);
    return { type: 'heading', level, text, id: anchor || slugify(text) };
  },

  paragraph: (d) => ({ type: 'paragraph', text: str(d.text) }),

  list: (d) => ({
    type: 'list',
    style: d.style === 'ordered' ? 'ordered' : 'disc',
    items: (Array.isArray(d.items) ? d.items : []).map((it) =>
      typeof it === 'string' ? it : str((it as { content?: unknown })?.content),
    ),
  }),

  code: (d) => ({
    type: 'code',
    language: str(d.language, 'plaintext'),
    code: str(d.code),
  }),

  warning: (d) => ({
    type: 'callout',
    variant: d.title === 'success' || d.title === 'warning' ? d.title : 'info',
    text: str(d.message),
  }),

  table: (d) => {
    const [header = [], ...body] = (Array.isArray(d.content)
      ? d.content
      : []) as unknown[][];
    const aligns = Array.isArray(d._align) ? (d._align as unknown[]) : [];
    const columns = header.map((h, i) => ({
      header: str(h),
      align: (aligns[i] as TableColumnAlign) ?? 'left',
    }));
    const rows = body.map((row) => ({
      cells: (row as unknown[]).map((c) => str(c)),
    }));
    const caption = str(d.caption);
    return {
      type: 'table',
      columns,
      rows,
      ...(caption ? { caption } : {}),
    };
  },

  image: (d) => {
    const file = (d.file ?? {}) as {
      url?: unknown;
      width?: unknown;
      height?: unknown;
    };
    const w = num(file.width);
    const h = num(file.height);
    return {
      type: 'image',
      config: {
        src: str(file.url),
        // 0 说明是历史数据或插件没存尺寸，给默认值让 next/image 能渲染
        width: w || 800,
        height: h || 450,
        alt: str(d.caption),
      },
    };
  },
};

export function toContentBlock(block: EditorJsBlock): DocsContentBlock {
  // 只读块：直接还原原始 ContentBlock，做到无损往返
  if (block.type === '_readonly' && typeof block.data?._original === 'string') {
    try {
      return JSON.parse(block.data._original as string) as DocsContentBlock;
    } catch {
      /* 解析失败走兜底 */
    }
  }
  const fn = toContent[block.type] ?? toContent.paragraph;
  return fn(block.data ?? {});
}

export function editorJsToContentBlocks(
  blocks: EditorJsBlock[],
): DocsContentBlock[] {
  return blocks.map(toContentBlock);
}

// ═══════════════════════════════════════════════════════════
// Sections ⇄ 扁平 block 列表
// ═══════════════════════════════════════════════════════════

/** 每个 section 首部插一个 h2，再接它的 blocks */
export function flattenSections(sections: DocsSection[]): EditorJsBlock[] {
  return sections.flatMap((s) => [
    { type: 'header', data: { text: s.title ?? '', level: 2 } },
    ...contentBlocksToEditorJs(s.blocks ?? []),
  ]);
}

/** 自动补建的章节标题（当正文开头没有 h2 时使用） */
export const RECOVERED_SECTION_TITLE = '未命名章节';

/**
 * 按 h2 切分成 sections。
 *
 * 与 docs 原实现的关键差异：**首个 h2 之前的块不会被丢弃**，
 * 而是收进一个自动补建的章节，并通过 `recoveredBlocks` 告知调用方。
 */
export function splitIntoSections(blocks: EditorJsBlock[]): SplitResult {
  const sections: DocsSection[] = [];
  const usedIds = new Set<string>();
  let recovered = 0;

  const ensureSection = (title: string): DocsSection => {
    const section: DocsSection = {
      id: uniqueId(slugify(title), usedIds),
      title,
      blocks: [],
    };
    sections.push(section);
    return section;
  };

  for (const block of blocks) {
    const isH2 = block.type === 'header' && num(block.data?.level) === 2;

    if (isH2) {
      ensureSection(str(block.data?.text));
      continue;
    }

    let current = sections[sections.length - 1];
    if (!current) {
      // 正文开头就是非标题块：补一节装住，不丢数据
      current = ensureSection(RECOVERED_SECTION_TITLE);
    }
    current.blocks.push(toContentBlock(block));
    if (sections.length === 1 && sections[0].title === RECOVERED_SECTION_TITLE) {
      recovered += 1;
    }
  }

  return { sections, recoveredBlocks: recovered };
}
