import type { Metadata } from "next";
import BlogDetailContent from "./components/BlogDetailContent";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Read the latest articles, product updates, and survey tips from the uicu team.",
};

/**
 * 文章详情页（首页 Featured / Latest / Popular 卡片的落地页）
 *
 * 数据在客户端拉，所以标题只能给个静态值；正文渲染交给
 * `BlogDetailContent`（client, i18n-aware）。
 */
export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  return <BlogDetailContent uuid={uuid} />;
}
