"use client";

/**
 * 文档详情正文（`DocsArticle` 的 `type=DOCUMENTATION`）
 *
 * 布局照线上 docs 的 DocLayout：顶部装饰图 + 左侧固定分类树（16rem）+ 中间
 * 正文 + 右侧本页目录，页脚嵌在内容列里（`<Footer embedded />`）避开全高侧栏。
 *
 * 与 `/blog/[uuid]` 是两套独立布局，但读同一张表、同一套 sections 结构，
 * 因此正文区块渲染器与反馈组件是共用的。
 *
 * 404 / 其它错误一律走 `notFound()`；匿名访问 `isLoginRequired` 的文档时后端
 * 直接回 401（不再返回 200 + preview），这里转成「需要登录」占位卡。
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/layout/Footer";
import Feedback from "@/components/Feedback";
import LoginRequiredBadge from "@/components/LoginRequiredBadge";
import ContentBlockRenderer from "@/components/ContentBlockRenderer";
import DocsBrandMark from "./DocsBrandMark";
import DocsSidebar from "./DocsSidebar";
import DocsToc, { type TocItem } from "./DocsToc";
import { ApiError, docsApi } from "@/lib/api";
import type { DocsArticleDetail } from "@/lib/api";
import { useLocale } from "@/i18n/useLocale";
import { categoryLabel } from "@/lib/docs-tree";
import { docsDetailPath } from "@/lib/routes";

type LoadState = "loading" | "ok" | "login-required" | "error";

/**
 * 与根布局 `metadata.title.template`（"%s — Simple"）保持一致
 *
 * `page.tsx` 只能给静态标题（数据在客户端拉，服务端拿不到文章名），所以文章
 * 标题要等数据回来后在这里补写 —— 等价于 docs 工程页面层的 `<TitleSync />`。
 * 线上 uicu.club 的标签页标题「(零) 1.学前基础 — UICU」就是它产生的，后缀是
 * 各工程自己的站点名，不是照抄 "UICU"。
 */
const TITLE_SUFFIX = " — Simple";

export default function DocsDetailContent({ uuid }: { uuid: string }) {
  // `ready` 之前 locale 恒为默认 en，等它落定再发请求，避免跨语言白拉一轮
  const { t, locale, ready } = useLocale();

  const [state, setState] = useState<LoadState>("loading");
  const [article, setArticle] = useState<DocsArticleDetail | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    if (!ready || !uuid) return;
    let cancelled = false;
    setState("loading");
    docsApi
      .detail(uuid, locale)
      .then((data) => {
        if (cancelled) return;
        // 本页只服务 DOCUMENTATION；把 DESIGN 的 uuid 塞进来视作不存在，
        // 它的落地页是 /blog/[uuid]
        if (data.type !== "DOCUMENTATION") {
          setState("error");
          return;
        }
        setArticle(data);
        setState("ok");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.code === 401) {
          setState("login-required");
          return;
        }
        console.error("[DocsDetail] 获取详情失败:", err);
        setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [uuid, locale, ready]);

  /**
   * 运行时标题同步（docs 里的 `<TitleSync />`）
   *
   * 数据是客户端拉的，服务端渲染时拿不到文章名，`page.tsx` 的静态
   * `metadata` 只能给个 "Documentation"。这里在拿到数据后把标题补上，
   * 让浏览器标签页 / 分享卡片显示真实文档名。
   */
  useEffect(() => {
    if (!article?.title) return;
    document.title = `${article.title}${TITLE_SUFFIX}`;
  }, [article]);

  /** 目录由 sections 派生（后端不返回 toc，schema 注释写明不入库） */
  const toc = useMemo<TocItem[]>(
    () =>
      (article?.sections ?? [])
        .filter((s) => s.title)
        .map((s) => ({ id: s.id, title: s.title })),
    [article],
  );

  if (state === "error") notFound();

  // 受护文档：整页占一张卡，不渲染侧边栏（此时也没有目录可言）
  if (state === "login-required") {
    return (
      <section>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="pt-32 pb-12 md:pt-40 md:pb-20">
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <h1 className="h3 mb-2">
                {t((m) => m.docsDetail.loginRequiredTitle)}
              </h1>
              <p className="text-muted-foreground mb-6">
                {t((m) => m.docsDetail.loginRequiredDesc)}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button asChild size="lg">
                  <Link href="/signin">{t((m) => m.docsDetail.signIn)}</Link>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <Link href="/docs">{t((m) => m.docsDetail.backToDocs)}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const sections = article?.sections ?? [];

  return (
    <section className="relative">
      {/* 顶部装饰图（线上 docs 有，纯装饰无功能） */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="max-w-none"
          src="/images/hero-illustration.svg"
          width={1972}
          height={392}
          aria-hidden="true"
          alt=""
        />
      </div>

      {/* 宽度取当前项目的 max-w-7xl（线上 docs 是 max-w-7xl，与它自己的 Header 对齐） */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div>
          <DocsSidebar
            activeUuid={uuid}
            expanded={sidebarExpanded}
            setExpanded={setSidebarExpanded}
          />

          <div className="md:pl-64">
            <div className="pt-24 md:pt-28 pb-8 md:pl-6 lg:pl-12">
              {/* 文档头部图标 + 顶级分类名（线上 docs 的 DocHeader 同款）

                  - 图标：直拷线上的 3D 立方体 SVG（见 DocsBrandMark）
                  - 标签：当前文章所属的**顶级分类名**（来自后端 breadcrumbs[0]），
                    按 locale 取名，中英任一为空时互为兜底，再没有则回退到字典。
                    线上用 font-nycd（手写体）+ "Documentation" 回退；web 没有该字体，
                    用默认 sans，但保持蓝色 + xl 字号与线上视觉接近。 */}
              <div
                className="h-16 flex items-center mb-6"
                data-aos="fade-up"
                data-aos-duration="500"
              >
                <DocsBrandMark />
                <span className="text-xl font-medium text-blue-600 ml-4">
                  {article?.breadcrumbs?.[0]
                    ? categoryLabel(article.breadcrumbs[0], locale)
                    : t((m) => m.docsDetail.headerTitle)}
                </span>
              </div>

              {/*
                面包屑只出现在移动端：线上 docs 的 DocHeader 里这一行是
                `md:hidden` 的 —— 桌面端靠左侧分类树定位，图标行下面直接就是
                标题，不再插一条面包屑。我上一版额外加的桌面面包屑是多余元素。
              */}
              <div
                className="md:hidden flex items-center mb-8"
                data-aos="fade-up"
                data-aos-duration="500"
                data-aos-delay="100"
              >
                <button
                  type="button"
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                  aria-controls="docs-sidebar"
                  aria-expanded={sidebarExpanded}
                  className="p-2 flex items-center justify-center shrink-0"
                >
                  <span className="sr-only">
                    {t((m) => m.docsDetail.toggleSidebar)}
                  </span>
                  <PanelLeft
                    aria-hidden="true"
                    className="size-5 text-muted-foreground"
                  />
                </button>
                <Breadcrumbs article={article} className="min-w-0 ml-1" />
              </div>

              {/* 已登录访问受护文档时，在顶部显示角标（线上用 mt-2 紧贴上一行） */}
              {article?.isLoginRequired ? (
                <div className="mt-2">
                  <LoginRequiredBadge variant="tag" />
                </div>
              ) : null}

              <article className="flex xl:space-x-12">
                {/* 线上就是 `min-w-0`（不带 flex-1）：正文列按内容宽度收缩，
                    目录贴在右侧；加 flex-1 会把它撑满，与线上不一致 */}
                <div className="min-w-0">
                  {state === "loading" ? (
                    <DocSkeleton />
                  ) : (
                    <>
                      <header className="mb-6">
                        <h1
                          className="h2 mb-4"
                          data-aos="fade-up"
                          data-aos-duration="500"
                        >
                          {article?.title}
                        </h1>
                        {article?.description ? (
                          <p
                            className="text-lg text-muted-foreground whitespace-pre-wrap"
                            data-aos="fade-up"
                            data-aos-duration="500"
                            data-aos-delay="100"
                          >
                            {article.description}
                          </p>
                        ) : null}
                      </header>

                      <div
                        className="text-muted-foreground space-y-6"
                        data-aos="fade-up"
                        data-aos-duration="500"
                        data-aos-delay="200"
                      >
                        {sections.length === 0 ? (
                          <p>{t((m) => m.docsDetail.noContent)}</p>
                        ) : null}

                        {sections.map((section) => (
                          <div key={section.id} className="space-y-6">
                            <div className="space-y-4">
                              {section.title ? (
                                <h2
                                  id={section.id}
                                  className="h3 text-foreground scroll-mt-24"
                                >
                                  {section.title}
                                </h2>
                              ) : null}
                              {(section.blocks ?? []).map((block, i) => (
                                <ContentBlockRenderer
                                  key={`${section.id}-${i}`}
                                  block={block}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* 四档情绪反馈（需登录；匿名时按钮禁用并提示登录） */}
                  <Feedback articleUuid={uuid} />

                  {/* 上下篇：数据来自 detail 内联的 siblings，两边都没有时不渲染 */}
                  {article?.siblings?.prev || article?.siblings?.next ? (
                    <SiblingsNav article={article} />
                  ) : null}

                  {/* 页脚嵌在内容列里：全站 Footer 会被固定侧边栏盖住左侧 */}
                  <Footer embedded />
                </div>

                <DocsToc items={toc} />
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * 面包屑：文档首页 › 分类链（后端 breadcrumbs）› 当前标题
 *
 * 后端只给分类的 id / name / englishName，没有 href，所以只有根节点可点。
 */
function Breadcrumbs({
  article,
  className,
}: {
  article: DocsArticleDetail | null;
  className?: string;
}) {
  const { t, locale } = useLocale();
  const rootLabel = t((m) => m.docsDetail.headerTitle);

  return (
    <nav
      aria-label="breadcrumb"
      className={`text-sm text-muted-foreground ${className ?? ""}`}
      data-aos="fade-down"
    >
      <ol className="flex items-center flex-wrap gap-x-2 gap-y-1 min-w-0">
        <li>
          <Link className="hover:text-foreground" href="/docs">
            {rootLabel}
          </Link>
        </li>
        {(article?.breadcrumbs ?? []).map((crumb) => (
          <li key={crumb.id} className="flex items-center gap-2">
            <ChevronRight className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {locale === "zh-CN"
                ? crumb.name || crumb.englishName
                : crumb.englishName || crumb.name}
            </span>
          </li>
        ))}
        {article?.title ? (
          <li className="flex items-center gap-2">
            <ChevronRight className="size-3 shrink-0" aria-hidden="true" />
            <span className="font-medium text-foreground truncate">
              {article.title}
            </span>
          </li>
        ) : null}
      </ol>
    </nav>
  );
}

/** 上下篇导航 */
function SiblingsNav({ article }: { article: DocsArticleDetail }) {
  const { t } = useLocale();
  const { prev, next } = article.siblings ?? { prev: null, next: null };

  return (
    <nav
      className="sm:flex items-center justify-between py-8 space-y-6 sm:space-y-0 sm:gap-4"
      aria-label={t((m) => m.docsDetail.siblingsNav)}
    >
      <div className="sm:w-1/2">
        {prev ? (
          <>
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase mb-1">
              {t((m) => m.docsDetail.prevArticle)}
            </div>
            <Link
              className="font-semibold flex items-center gap-2 hover:underline"
              href={docsDetailPath(prev.uuid)}
            >
              <ChevronLeft className="size-4 shrink-0" />
              <span className="truncate">{prev.title}</span>
            </Link>
          </>
        ) : null}
      </div>

      <div className="sm:w-1/2 sm:flex sm:flex-col sm:items-end sm:ml-auto">
        {next ? (
          <>
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase mb-1">
              {t((m) => m.docsDetail.nextArticle)}
            </div>
            <Link
              className="font-semibold flex items-center gap-2 hover:underline"
              href={docsDetailPath(next.uuid)}
            >
              <span className="truncate">{next.title}</span>
              <ChevronRight className="size-4 shrink-0" />
            </Link>
          </>
        ) : null}
      </div>
    </nav>
  );
}

/** 加载占位：仅文档主体，侧边栏与 Header 保持真实渲染 */
function DocSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-9 bg-muted rounded w-2/3 mb-3" />
      <div className="h-4 bg-muted rounded w-1/2 mb-8" />

      {Array.from({ length: 3 }).map((_, s) => (
        <div key={s} className="mb-8">
          <div className="h-6 bg-muted rounded w-1/3 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      ))}

      <div className="mb-8 pt-6 border-t border-border">
        <div className="h-5 bg-muted rounded w-1/4 mb-4" />
        <div className="flex gap-3">
          <div className="h-10 bg-muted rounded w-24" />
          <div className="h-10 bg-muted rounded w-24" />
        </div>
      </div>
    </div>
  );
}
