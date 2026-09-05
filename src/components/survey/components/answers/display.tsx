"use client";

import { useMemo } from "react";
import { quillGetHTML } from "@/components/editor/utils/quill";

/**
 * Quill Delta 渲染为 HTML 后的通用排版样式
 * 与编辑端 .ql-editor 的视觉效果保持一致：
 * - 标题号 h1/h2/h3 还原字号与字重（Tailwind preflight 会拍平，需手动补）
 * - 对齐 class（ql-align-center/right/justify，由 quill-delta-to-html 生成）
 * - 列表、引用、下划线、链接等
 */
export const quillProseClass =
  "[&_p]:m-0 " +
  "[&_h1]:text-[2em] [&_h1]:font-bold [&_h1]:leading-snug " +
  "[&_h2]:text-[1.5em] [&_h2]:font-bold [&_h2]:leading-snug " +
  "[&_h3]:text-[1.17em] [&_h3]:font-bold [&_h3]:leading-snug " +
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 " +
  "[&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:my-1 " +
  "[&_.ql-align-center]:text-center [&_.ql-align-right]:text-right [&_.ql-align-justify]:text-justify " +
  "[&_a]:text-blue-600 dark:text-blue-300 [&_a]:underline " +
  "[&_img]:max-w-full [&_u]:underline [&_s]:line-through";

/** 将 Quill Delta JSON 转为 HTML */
export function useQuillHTML(raw?: string) {
  return useMemo(() => {
    if (!raw) return "";
    try {
      return quillGetHTML(JSON.parse(raw));
    } catch {
      return raw;
    }
  }, [raw]);
}

/** 标题段落 workTitle —— 与编辑端一致，内容存在 props.text */
export function DisplayTitle({ props }: { props: Record<string, unknown> }) {
  // 编辑端把 Quill Delta 存在 text 字段；兼容历史数据中的 title 字段
  const text = (props.text as string | undefined) ?? (props.title as string | undefined);
  const html = useQuillHTML(text);
  return (
    <div className="mb-5">
      <div
        className={`text-sm text-foreground ${quillProseClass}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

/** 段落说明 workParagraph */
export function DisplayParagraph({ props }: { props: Record<string, unknown> }) {
  const text = props.text as string | undefined;
  const html = useQuillHTML(text);
  return (
    <div className="mb-5">
      <div
        className={`text-sm text-muted-foreground leading-relaxed ${quillProseClass}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

/** 作品标题 workInfo —— 与编辑端一致：居中大标题 + 描述，原样渲染 */
export function DisplayInfo({ props }: { props: Record<string, unknown> }) {
  const title = props.title as string | undefined;
  const desc = props.desc as string | undefined;
  const titleHtml = useQuillHTML(title);
  const descHtml = useQuillHTML(desc);
  return (
    <div className="mb-5">
      <div
        className={`text-sm text-foreground ${quillProseClass}`}
        dangerouslySetInnerHTML={{ __html: titleHtml }}
      />
      <div
        className={`text-sm text-muted-foreground leading-relaxed ${quillProseClass}`}
        dangerouslySetInnerHTML={{ __html: descHtml }}
      />
    </div>
  );
}
