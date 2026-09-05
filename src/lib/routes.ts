/**
 * 站内路由常量 / 构造器
 *
 * 详情页路由在这里集中定义：列表页卡片、详情页的「上下篇 / 相关文章」
 * 都要跳同一个地址，写死在多处容易走偏。
 */

/** 设计稿详情页前缀，对应 `src/app/(marketing)/blog/[uuid]` */
export const BLOG_BASE_PATH = "/blog";

/** 构造设计稿详情页地址（uuid 需编码，虽然 v7 uuid 本身是 URL-safe 的） */
export function blogDetailPath(uuid: string): string {
  return `${BLOG_BASE_PATH}/${encodeURIComponent(uuid)}`;
}

/** 文档详情页前缀 */
export const DOCS_BASE_PATH = "/docs";

/**
 * 构造文档详情页地址
 *
 * 与 `blogDetailPath` 分开：两者读同一张 `DocsArticle` 表，但 `type` 不同
 * （DESIGN / DOCUMENTATION），文档站要有自己的分类树侧边栏与目录，不能复用
 * 博客版式。
 */
export function docsDetailPath(uuid: string): string {
  return `${DOCS_BASE_PATH}/${encodeURIComponent(uuid)}`;
}
