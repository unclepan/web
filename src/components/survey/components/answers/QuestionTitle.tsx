"use client";

import { useQuillHTML, quillProseClass } from "./display";

/**
 * 答题端通用题干渲染组件
 * 将 Quill Delta JSON 转换为 HTML 展示，支持题号和必填标记
 * 样式与编辑端画布保持一致（标题号、加粗、对齐等）
 */
export default function QuestionTitle({
  title,
  required,
  index,
  error,
}: {
  title?: string;
  required?: boolean;
  index: number;
  error?: string;
}) {
  const html = useQuillHTML(title);

  return (
    <div className="mb-3">
      <div className="flex items-start gap-1.5">
        {index > 0 && (
          <span className="text-sm font-medium text-muted-foreground shrink-0 tabular-nums">
            {index}.
          </span>
        )}
        <span
          className={`text-sm font-medium text-foreground flex-1 ${quillProseClass}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}
