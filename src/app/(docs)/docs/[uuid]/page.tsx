import type { Metadata } from "next";
import DocsDetailContent from "./components/DocsDetailContent";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Read the full documentation article.",
};

/**
 * 文档详情页（`/docs` 索引页卡片的落地页）
 *
 * 数据在客户端拉，所以标题只能给个静态值，真实标题由 `DocsDetailContent`
 * 拿到数据后运行时补写（等价 docs 工程的 `<TitleSync />`）；正文渲染也交给
 * 它（client, i18n-aware）。
 *
 * Next 16 起动态路由的 `params` 是 Promise，必须 await。
 */
export default async function DocsDetailPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  return <DocsDetailContent uuid={uuid} />;
}
