"use client";

/**
 * 首页正文（Hero + Featured + Latest + Popular）
 *
 * 数据全部来自 docs 服务的 `DocsArticle`（`type=DESIGN`），即原 designs
 * 表内容 —— 当前空间已把 documentations / designs 合表，首页只取 DESIGN。
 *
 * 结构说明：Header / main / Footer 由 `(marketing)/layout.tsx` 提供，
 * AOS 由根布局里的 `AosInit` 全局初始化，这里只负责写 `data-aos` 属性。
 */
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import Avatar from "@/components/Avatar";
import AuthorAvatar from "@/components/AuthorAvatar";
import LoginRequiredBadge from "@/components/LoginRequiredBadge";
import { docsApi } from "@/lib/api";
import type { DocsArticle } from "@/lib/api";
import { format, useLocale, type TranslateFn } from "@/i18n/useLocale";
import { formatDate } from "@/lib/format-date";
import { blogDetailPath } from "@/lib/routes";
import type { Locale } from "@/i18n/types";

/** Latest 单页条数 */
const PAGE_SIZE = 6;

/** 首页只取 DESIGN（合表前 designs 表的内容） */
const ARTICLE_TYPE = "DESIGN" as const;

/** Popular 侧栏条数 */
const HOT_LIMIT = 5;

/** Featured 首屏卡片数 */
const FEATURED_LIMIT = 4;

export default function HomeContent() {
  // `ready` 之前 locale 一定是默认的 en；等它落定再发请求，中文站访客
  // 就不会在首屏白打一轮英文内容（locale 一变 effect 会重跑）
  const { t, locale, ready } = useLocale();

  const [latestItems, setLatestItems] = useState<DocsArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [latestLoading, setLatestLoading] = useState(true);

  const [hotArticles, setHotArticles] = useState<DocsArticle[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<DocsArticle[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState<Error | null>(null);

  // hasMore 由「已加载数 < 总数」精确判断，避免多打一次空请求
  const hasMore = latestItems.length < total;

  // Popular 侧栏
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    docsApi
      .hot(ARTICLE_TYPE, locale, HOT_LIMIT)
      .then((rows) => {
        if (!cancelled) setHotArticles(rows);
      })
      .catch((err) => console.error("[Home] 获取热门失败:", err));
    return () => {
      cancelled = true;
    };
  }, [locale, ready]);

  // Featured 推荐位（0 条时整段不渲染，请求失败同样折叠，不占版面）
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    setFeaturedLoading(true);
    docsApi
      .featured(ARTICLE_TYPE, locale, FEATURED_LIMIT)
      .then((rows) => {
        if (cancelled) return;
        setFeaturedArticles(rows);
        setFeaturedError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[Home] 获取推荐失败:", err);
        setFeaturedError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setFeaturedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [locale, ready]);

  // Latest 第一页：locale 切换后要重新拉对应语言的内容
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    setLatestLoading(true);
    setLatestItems([]);
    setTotal(0);
    docsApi
      .latest(ARTICLE_TYPE, locale, PAGE_SIZE, 0)
      .then((resp) => {
        if (cancelled) return;
        setLatestItems(resp.items);
        setTotal(resp.total);
      })
      .catch((err) => console.error("[Home] 获取 Latest 失败:", err))
      .finally(() => {
        if (!cancelled) setLatestLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [locale, ready]);

  /** 加载更多：以已加载条数作 offset，total 每次用最新返回值（并发新增可能变化） */
  const loadMore = useCallback(async () => {
    if (latestLoading || !hasMore) return;
    setLatestLoading(true);
    try {
      const resp = await docsApi.latest(
        ARTICLE_TYPE,
        locale,
        PAGE_SIZE,
        latestItems.length,
      );
      setLatestItems((prev) => [...prev, ...resp.items]);
      setTotal(resp.total);
    } catch (err) {
      console.error("[Home] 加载更多失败:", err);
    } finally {
      setLatestLoading(false);
    }
  }, [hasMore, latestItems.length, latestLoading, locale]);

  return (
    <>
      {/* Hero */}
      <section className="relative">
        {/* 背景图 */}
        <div className="absolute inset-0 h-[32rem] pt-16 box-content -z-10">
          <Image
            src="/images/hero-bg-01.jpg"
            alt={t((m) => m.home.heroImageAlt)}
            width={1440}
            height={577}
            className="absolute inset-0 w-full h-full object-cover opacity-25"
            priority
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-background"
            aria-hidden="true"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="pt-32 pb-12 md:pt-40 md:pb-16" data-aos="fade-down">
            <div className="max-w-3xl" data-aos="fade-up" data-aos-delay="100">
              <h1 className="h1 mb-4">{t((m) => m.home.heroTitle)}</h1>
              <p className="text-xl text-muted-foreground">
                {t((m) => m.home.heroSubtitle)}
              </p>
            </div>

            <div
              className="md:flex md:items-center md:justify-between mt-5"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="flex items-center justify-center">
                <span className="mr-3">
                  <Avatar
                    src={null}
                    name={t((m) => m.home.heroAuthorName)}
                    size="sm"
                  />
                </span>
                <div>
                  <span className="text-muted-foreground">
                    {t((m) => m.home.heroByline)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured posts（动态：不足 4 条自然折叠，0 条整段不渲染） */}
      {!featuredLoading && !featuredError && featuredArticles.length > 0 ? (
        <section>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="pb-12 md:pb-16">
              <div
                className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4"
                data-aos-id-featposts
              >
                {featuredArticles.map((article, idx) => (
                  <article
                    key={article.uuid}
                    className="relative group px-6 py-4 sm:py-8 overflow-hidden bg-muted"
                    data-aos="fade-up"
                    data-aos-anchor="[data-aos-id-featposts]"
                    data-aos-delay={(idx + 1) * 100}
                  >
                    <figure>
                      {article.coverImage ? (
                        <Image
                          className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-75 transition duration-700 ease-out"
                          src={article.coverImage}
                          width={258}
                          height={154}
                          alt={article.title}
                          unoptimized
                        />
                      ) : null}
                      <div
                        className="absolute inset-0 bg-slate-700/60 opacity-75 group-hover:opacity-50 transition duration-700 ease-out"
                        aria-hidden="true"
                      />
                    </figure>

                    <div className="relative flex flex-col h-full text-white min-h-[140px]">
                      <header className="grow">
                        <Link
                          className="hover:underline"
                          href={blogDetailPath(article.uuid)}
                        >
                          <h3 className="text-lg font-bold tracking-tight mb-2">
                            {article.title}
                          </h3>
                        </Link>
                        {article.isLoginRequired ? <LoginRequiredBadge /> : null}
                      </header>

                      <footer>
                        <div className="text-sm opacity-80">
                          {format(t((m) => m.home.byAuthorDate), {
                            name:
                              article.author?.username ||
                              t((m) => m.home.anonymous),
                            date: formatDate(article.updatedAt, locale),
                          })}
                        </div>
                      </footer>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Latest + Sidebar */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="pb-12 md:pb-20">
            <div className="lg:flex lg:justify-between">
              {/* Latest list（动态） */}
              <div className="lg:grow" data-aos="fade-down" data-aos-delay="200">
                <h4 className="h4 mb-8">{t((m) => m.home.latest)}</h4>
                <LatestList
                  items={latestItems}
                  isLoading={latestLoading && latestItems.length === 0}
                  locale={locale}
                  t={t}
                />

                {/* Load more：仅当还有更多时显示 */}
                {hasMore && (
                  <div className="flex justify-center mt-12 md:mt-16">
                    <Button size="lg" onClick={loadMore} disabled={latestLoading}>
                      {latestLoading
                        ? t((m) => m.home.loading)
                        : t((m) => m.home.seePreviousArticles)}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Sidebar Popular（动态） */}
              {hotArticles.length > 0 && (
                <aside
                  className="relative mt-12 lg:mt-0 lg:w-64 lg:ml-16 lg:shrink-0"
                  data-aos="fade-down"
                  data-aos-delay="400"
                >
                  <div className="mb-8">
                    <h4 className="h4 mb-5">
                      {t((m) => m.home.popularOnSimple)}
                    </h4>
                    <ul className="-my-3">
                      {hotArticles.map((post, idx) => (
                        <li
                          key={post.uuid}
                          className="flex py-3 border-b border-border"
                        >
                          <div className="text-2xl font-bold w-12 text-muted-foreground shrink-0 mt-1">
                            {String(idx + 1).padStart(2, "0")}
                          </div>
                          <article>
                            <Link
                              className="hover:underline"
                              href={blogDetailPath(post.uuid)}
                            >
                              <h3 className="font-bold tracking-tight mb-1">
                                {post.title}
                              </h3>
                            </Link>
                            {post.isLoginRequired ? <LoginRequiredBadge /> : null}
                            <div className="text-sm text-muted-foreground">
                              {t((m) => m.home.byPrefix)}
                              <span className="font-medium">
                                {post.author?.username ||
                                  t((m) => m.home.anonymous)}
                              </span>
                              <span> · </span>
                              <span>{formatDate(post.updatedAt, locale)}</span>
                            </div>
                          </article>
                        </li>
                      ))}
                    </ul>
                  </div>
                </aside>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

interface LatestListProps {
  items: DocsArticle[];
  isLoading: boolean;
  locale: Locale;
  t: TranslateFn;
}

function LatestList({ items, isLoading, locale, t }: LatestListProps) {
  // 加载中：6 个骨架占位
  if (isLoading) {
    return (
      <div className="grid gap-12 sm:grid-cols-2 sm:gap-x-6 md:gap-y-8 items-start">
        {Array.from({ length: PAGE_SIZE }).map((_, i) => (
          <article key={i} className="flex flex-col h-full">
            <Skeleton className="h-0 pb-[56.25%] mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-5/6" />
          </article>
        ))}
      </div>
    );
  }

  // 空数据
  if (items.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderOpen />
          </EmptyMedia>
          <EmptyTitle>{t((m) => m.home.noProjectsTitle)}</EmptyTitle>
          <EmptyDescription>
            {t((m) => m.home.noProjectsDescription)}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center gap-2">
          <Button asChild size="lg">
            <Link href="/contact">{t((m) => m.home.learnMore)}</Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="grid gap-12 sm:grid-cols-2 sm:gap-x-6 md:gap-y-8 items-start">
      {items.map((post) => (
        <article key={post.uuid} className="flex flex-col h-full">
          <header>
            <Link className="block mb-4" href={blogDetailPath(post.uuid)}>
              <figure className="relative h-0 pb-[56.25%] bg-muted">
                {post.coverImage ? (
                  <Image
                    className="absolute inset-0 w-full h-full object-cover"
                    src={post.coverImage}
                    width={352}
                    height={198}
                    alt={post.title}
                    unoptimized
                  />
                ) : null}
              </figure>
            </Link>
            <Link className="hover:underline" href={blogDetailPath(post.uuid)}>
              <h3 className="h4 mb-2">
                <span className="inline-flex items-center gap-2 flex-wrap">
                  <span>{post.title}</span>
                  {post.isLoginRequired ? (
                    <LoginRequiredBadge variant="icon" />
                  ) : null}
                </span>
              </h3>
            </Link>
          </header>
          <p className="text-muted-foreground grow">{post.description}</p>
          <footer className="flex items-center mt-4">
            <span className="mr-3">
              <AuthorAvatar
                author={post.author}
                fallbackName={t((m) => m.home.anonymous)}
                size="sm"
              />
            </span>
            <div className="text-sm text-muted-foreground">
              {t((m) => m.home.byPrefix)}
              <span className="font-medium">
                {post.author?.username || t((m) => m.home.anonymous)}
              </span>
              <span> · </span>
              <span>{formatDate(post.updatedAt, locale)}</span>
            </div>
          </footer>
        </article>
      ))}
    </div>
  );
}
