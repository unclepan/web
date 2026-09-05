"use client";

/**
 * ContentBlockRenderer —— 正文区块渲染器
 *
 * `sections[].blocks` 是后端整块透传的 JSON（多态结构），这里按 `type`
 * 分派。未知类型直接渲染 null，避免脏数据把整页打崩。
 *
 * **移植自线上 docs 工程的同名组件**（下载卡片 / 图片模态框 / 代码复制 /
 * callout 图标 / 表格 / 可折叠块一并照搬），只做了三处适配：
 *   1. 类型来源换成 web 的 `DocsContentBlock`；
 *   2. 正文级颜色换 web 语义 token（slate-800→foreground、slate-600→
 *      muted-foreground、border-slate-200→border-border、bg-slate-50→bg-muted）；
 *   3. 仅代码块这种「刻意深色」的元素保留 docs 原配色（明暗两态都是深底）。
 *
 * 段落 / 列表 / 表格 / callout 用 `dangerouslySetInnerHTML` —— 内容来自后台
 * 编辑器，docs 就是这么渲染的，内嵌 `<a>`/`<code>`/`<strong>` 需要生效。
 *
 * 放在 `src/components/`：设计稿详情页 `/blog/[uuid]` 与文档详情页
 * `/docs/[uuid]` 读同一张 `DocsArticle` 表、同一套 sections 结构，都要渲染它。
 *
 * 图片一律 `unoptimized`：web 没配 `images.remotePatterns`，远端 URL 走
 * next/image 优化会直接报错。
 */
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronRight,
  Copy,
  HardDriveDownload,
  Loader2,
} from "lucide-react";
import type { DocsContentBlock } from "@/lib/api";

type Block = DocsContentBlock;
type ExtractBlock<T extends Block["type"]> = Extract<Block, { type: T }>;

/**
 * 图片 / 图片模态框的 config（与后端 JSON 同构）
 *
 * `DocsContentBlock` 里 image 与 image-modal 是 `{ type: "image" | "image-modal" }`
 * 合并声明的，用 `Extract` 取不出单独成员（得 never），所以 config 单独定义。
 */
type ImageConfig = {
  src: string;
  width: number;
  height: number;
  alt: string;
  modal?: boolean;
  videoSrc?: string;
};

/** 提示框图标颜色映射（与 docs 一致） */
const CALLOUT_ICON_COLORS: Record<string, string> = {
  info: "fill-purple-500",
  success: "fill-teal-500",
  warning: "fill-amber-500",
};

/** 提示框 SVG 图标（直拷 docs：success 是勾，info/warning 是感叹号） */
function CalloutIcon({ variant }: { variant: string }) {
  const colorClass = CALLOUT_ICON_COLORS[variant] || "fill-purple-500";

  if (variant === "success") {
    return (
      <svg
        className={`${colorClass} shrink-0 mr-4`}
        width="16"
        height="16"
        viewBox="0 0 16 16"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8ZM7 11.4 3.6 8 5 6.6l2 2 4-4L12.4 6 7 11.4Z" />
      </svg>
    );
  }

  return (
    <svg
      className={`${colorClass} shrink-0 mr-4`}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8Zm0 12c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1Zm1-3H7V4h2v5Z" />
    </svg>
  );
}

/** 表格组件 */
function TableBlock({
  columns,
  rows,
  caption,
}: Pick<ExtractBlock<"table">, "columns" | "rows" | "caption">) {
  return (
    <div className="overflow-x-auto my-4 [&_a]:text-blue-600 [&_a]:hover:underline">
      <table className="table-auto w-full border-b border-border">
        {caption ? (
          <caption className="text-sm font-medium text-muted-foreground px-2 mb-2 text-left">
            {caption}
          </caption>
        ) : null}
        <thead>
          <tr className="text-left text-foreground whitespace-nowrap">
            {columns.map((col, index) => (
              <th
                key={index}
                className="font-medium px-2 first:pl-0 last:pr-0 py-3"
                style={{ textAlign: col.align }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-t border-border whitespace-nowrap"
            >
              {row.cells.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-2 first:pl-0 last:pr-0 py-3"
                  style={{ textAlign: columns[cellIndex]?.align }}
                  dangerouslySetInnerHTML={{ __html: cell }}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 图片组件（有明确宽高用固定尺寸，否则 fill 模式自适应容器） */
function ImageBlock({
  config,
  priority = false,
}: {
  config: ImageConfig;
  priority?: boolean;
}) {
  const hasSize = config.width > 0 && config.height > 0;

  if (hasSize) {
    return (
      <div className="relative flex justify-center items-center my-4">
        <Image
          className="rounded max-w-full w-full h-auto"
          src={config.src}
          width={config.width}
          height={config.height}
          alt={config.alt}
          priority={priority}
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className="relative w-full my-4 mx-auto" style={{ maxWidth: 800 }}>
      <Image
        className="rounded w-full h-auto"
        src={config.src}
        alt={config.alt}
        priority={priority}
        unoptimized
      />
    </div>
  );
}

/** 图片模态框组件：缩略图 + 播放按钮，点开弹出大图 / 视频 */
function ImageModalBlock({
  config,
  priority = false,
}: {
  config: ImageConfig;
  priority?: boolean;
}) {
  const [modalExpanded, setModalExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // 打开模态框：先挂载 DOM，下一帧再触发动画
  const openModal = () => {
    setModalExpanded(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsVisible(true));
    });
  };

  // 关闭模态框：先触发退出动画，动画结束后卸载
  const closeModal = () => {
    setIsVisible(false);
    if (videoRef.current) {
      const playPromise = playPromiseRef.current;
      if (playPromise) {
        playPromise
          .then(() => videoRef.current?.pause())
          .catch(() => {
            /* play() 被中断，忽略 */
          });
        playPromiseRef.current = null;
      } else {
        videoRef.current.pause();
      }
    }
    setTimeout(() => setModalExpanded(false), 200);
  };

  // ESC 关闭
  useEffect(() => {
    if (!modalExpanded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalExpanded]);

  // 模态框打开时自动播放视频
  useEffect(() => {
    if (isVisible && videoRef.current) {
      playPromiseRef.current = videoRef.current
        .play()
        .catch(() => {
          /* 自动播放被浏览器阻止，忽略 */
        }) as Promise<void>;
    }
  }, [isVisible]);

  return (
    <div>
      <div className="relative inline-flex justify-center items-center my-2">
        <Image
          className="rounded max-w-full w-full h-auto"
          src={config.src}
          width={config.width}
          height={config.height}
          alt={config.alt}
          priority={priority}
          unoptimized
        />
        <button
          className="absolute group"
          onClick={(e) => {
            e.preventDefault();
            openModal();
          }}
          aria-controls="modal"
        >
          <svg
            className="w-16 h-16 fill-current sm:w-20 sm:h-20"
            viewBox="0 0 88 88"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="text-white opacity-80 group-hover:opacity-100 transition duration-150 ease-in-out"
              cx="44"
              cy="44"
              r="44"
            />
            <path
              className="text-blue-600"
              d="M52 44a.999.999 0 00-.427-.82l-10-7A1 1 0 0040 37V51a.999.999 0 001.573.82l10-7A.995.995 0 0052 44V44c0 .001 0 .001 0 0z"
            />
          </svg>
        </button>
      </div>

      {/* Modal backdrop */}
      {modalExpanded ? (
        <div
          className={`fixed inset-0 bg-slate-900/20 z-50 transition-opacity duration-200 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
          onClick={closeModal}
        />
      ) : null}

      {/* Modal dialog */}
      {modalExpanded ? (
        <div
          className={`fixed inset-0 z-50 overflow-hidden flex items-center justify-center px-4 sm:px-6 transition-all duration-200 ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
          role="dialog"
          aria-modal="true"
          onClick={closeModal}
        >
          <div
            className="bg-background overflow-auto max-w-4xl w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {config.videoSrc ? (
              <video
                ref={videoRef}
                className="w-full aspect-video"
                width="1920"
                height="1080"
                loop
                controls
              >
                <source src={config.videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <Image
                className="w-full h-auto"
                src={config.src}
                alt={config.alt}
                width={config.width}
                height={config.height}
                unoptimized
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * 可下载文件卡片：左侧文件图标，中间文件名 + 大小/描述，右侧「下载」按钮。
 * 原生 <a download> 触发浏览器下载；跨域资源由后端控制。
 */
function DownloadBlock({
  config,
}: {
  config: ExtractBlock<"download">["config"];
}) {
  const meta = [config.size, config.description].filter(Boolean).join(" · ");
  return (
    <div className="my-4 flex items-center gap-3 rounded border border-border bg-muted p-3">
      <HardDriveDownload className="shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-foreground">
          {config.filename}
        </div>
        {meta ? (
          <div className="truncate text-xs text-muted-foreground">{meta}</div>
        ) : null}
      </div>
      <a
        className="btn-sm shrink-0 bg-blue-600 text-white hover:bg-blue-700"
        href={config.url}
        download={config.filename}
        target="_blank"
        rel="noopener noreferrer"
      >
        下载
      </a>
    </div>
  );
}

/** 可折叠内容组件 */
function CollapsibleBlock({
  title,
  content,
  defaultExpanded = false,
}: Pick<ExtractBlock<"collapsible">, "title" | "content" | "defaultExpanded">) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="space-y-2">
      <button
        className="flex items-center w-full text-foreground font-medium text-left"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="shrink-0 mr-3">
          <ChevronRight
            className={`w-4 h-5 text-muted-foreground transition-transform ${
              expanded ? "rotate-90" : ""
            }`}
          />
        </div>
        <span>{title}</span>
      </button>
      {expanded ? (
        <div className="pl-5 mt-2">
          <p>{content}</p>
        </div>
      ) : null}
    </div>
  );
}

/** 代码块：深色底 + 悬浮「复制」按钮 */
function CodeBlock({ code }: { code?: string }) {
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);

  const handleCopy = async () => {
    if (copying || copied) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(code || "");
      setCopied(true);
    } catch {
      /* 剪贴板不可用时静默 */
    }
    setCopying(false);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        disabled={copying}
        className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2 py-1 text-xs font-medium rounded bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        title={copied ? "已复制" : "复制代码"}
        aria-label="复制代码"
      >
        {copying ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>复制中</span>
          </>
        ) : copied ? (
          <>
            <Check className="w-3 h-3" />
            <span>已复制</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3" />
            <span>复制</span>
          </>
        )}
      </button>
      <pre className="overflow-x-auto text-sm text-slate-400 bg-slate-800 border border-slate-700 p-4 pt-8 rounded">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}

export interface ContentBlockRendererProps {
  block: DocsContentBlock;
  /** 是否为正文首张图（LCP 候选），由父组件只对第一张图传 true */
  priority?: boolean;
}

export default function ContentBlockRenderer({
  block,
  priority = false,
}: ContentBlockRendererProps) {
  switch (block.type) {
    case "heading":
      if (block.level === 2) {
        return (
          <h2
            id={block.id}
            data-scrollspy-target
            className="h3 text-foreground scroll-mt-24"
          >
            {block.text}
          </h2>
        );
      }
      return (
        <h3 id={block.id} className="text-lg font-semibold text-foreground">
          {block.text}
        </h3>
      );

    case "paragraph":
      return (
        <p
          className="[&_a]:text-blue-600 [&_a]:hover:underline"
          dangerouslySetInnerHTML={{ __html: block.text }}
        />
      );

    case "list":
      if (block.style === "ordered") {
        return (
          <ol className="list-decimal list-inside space-y-2 [&_a]:text-blue-600 [&_a]:hover:underline">
            {block.items.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ol>
        );
      }
      return (
        <ul className="list-disc list-inside space-y-2 [&_a]:text-blue-600 [&_a]:hover:underline">
          {block.items.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      );

    case "code":
      return <CodeBlock code={block.code} />;

    case "callout":
      return (
        <div className="text-sm p-4 bg-muted border border-border rounded [&_a]:text-blue-600 [&_a]:hover:underline">
          <div className="flex items-center">
            <CalloutIcon variant={block.variant} />
            <p dangerouslySetInnerHTML={{ __html: block.text }} />
          </div>
        </div>
      );

    case "link":
      return (
        <a className="font-medium text-blue-600 hover:underline" href={block.href}>
          {block.text}
        </a>
      );

    case "table":
      return (
        <TableBlock
          columns={block.columns}
          rows={block.rows}
          caption={block.caption}
        />
      );

    case "image":
      return <ImageBlock config={block.config} priority={priority} />;

    case "image-modal":
      return <ImageModalBlock config={block.config} priority={priority} />;

    case "collapsible":
      return (
        <CollapsibleBlock
          title={block.title}
          content={block.content}
          defaultExpanded={block.defaultExpanded}
        />
      );

    case "download":
      return <DownloadBlock config={block.config} />;

    default:
      return null;
  }
}
