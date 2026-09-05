import Header from "@/components/layout/Header";

/**
 * 文档详情页布局（只覆盖 `/docs/[uuid]`）
 *
 * 与 `(marketing)/layout.tsx` 唯一的区别是**不渲染全站 Footer**：详情页的
 * 侧边栏是 `fixed` 全高的（`w-64` = 16rem），全站 Footer 会被它盖住左侧一大块
 * （Footer 第一列正好是品牌区 + 订阅框）。所以这里只出 Header + main，Footer
 * 由页面自己放进 `md:pl-64` 的内容列里（`<Footer embedded />`）—— 与线上 docs
 * 工程的 DocLayout 做法一致。
 *
 * 索引页 `/docs` 没有侧边栏，仍留在 `(marketing)` 享受全站 Footer，不受影响。
 * `<main>` 保持裸的、不带宽度容器，宽度由页面自己写（全站统一 max-w-7xl）。
 */
export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="grow">{children}</main>
    </>
  );
}
