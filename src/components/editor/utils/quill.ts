/**
 * 将 Quill Delta 转换为 HTML
 */
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";

interface QuillOp {
  insert: string | { type: string };
  attributes?: Record<string, unknown>;
}

export function quillGetHTML(value: { ops: QuillOp[] } | string): string {
  if (typeof value === "string") return value;
  if (!value?.ops) return String(value ?? "");
  const converter = new QuillDeltaToHtmlConverter(value.ops, {});
  converter.renderCustomWith((customOp: { insert: { type: string } }) => {
    if (customOp.insert.type === "blanks") {
      return `<span style="display: inline-block;">____________</span>`;
    }
    return "";
  });
  return converter.convert();
}
