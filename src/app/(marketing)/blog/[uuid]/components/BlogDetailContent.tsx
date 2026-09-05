"use client";

/**
 * 文章详情正文（`DocsArticle`，首页卡片点进来的落地页）
 *
 * 接口走 `docsApi.detail`，统一 `silentAuth`：匿名访问 `isLoginRequired`
 * 的文章时后端直接回 401，绝不能让 `request()` 把访客弹到 /signin，
 * 这里把 401 转成「需要登录」占位卡，由用户自己决定去不去登录。
 *
 * 404 / 其它错误一律走 `notFound()`，渲染全站 not-found 页。
 */
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AuthorAvatar from "@/components/AuthorAvatar";
import Feedback from "@/components/Feedback";
import ContentBlockRenderer from "@/components/ContentBlockRenderer";
import { docsApi, ApiError } from "@/lib/api";
import type { DocsArticle, DocsArticleDetail } from "@/lib/api";
import { useLocale } from "@/i18n/useLocale";
import { formatDate } from "@/lib/format-date";
import { blogDetailPath } from "@/lib/routes";

/** Related 区域卡片兜底渐变（按下标循环），无封面图时作底色避免大片空白 */
const RELATED_OVERLAYS = [
  "bg-teal-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-rose-500",
] as const;

/** Related 条数 */
const RELATED_LIMIT = 2;

type LoadState = "loading" | "ok" | "login-required" | "error";

export default function BlogDetailContent({ uuid }: { uuid: string }) {
  // `ready` 之前 locale 恒为默认 en，等它落定再发请求，避免中文站白拉一轮
  const { t, locale, ready } = useLocale();

  const [state, setState] = useState<LoadState>("loading");
  const [article, setArticle] = useState<DocsArticleDetail | null>(null);
  const [related, setRelated] = useState<DocsArticle[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  // 详情
  useEffect(() => {
    if (!ready || !uuid) return;
    let cancelled = false;
    setState("loading");
    docsApi
      .detail(uuid, locale)
      .then((data) => {
        if (cancelled) return;
        setArticle(data);
        setState("ok");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.code === 401) {
          setState("login-required");
          return;
        }
        console.error("[Blog] 获取详情失败:", err);
        setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [uuid, locale, ready]);

  // 相关文章（失败时静默降级为空，不影响正文）
  useEffect(() => {
    if (!ready || !uuid) return;
    let cancelled = false;
    setRelatedLoading(true);
    docsApi
      .related(uuid, locale, RELATED_LIMIT)
      .then((rows) => {
        if (!cancelled) setRelated(rows);
      })
      .catch((err) => console.error("[Blog] 获取相关失败:", err))
      .finally(() => {
        if (!cancelled) setRelatedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [uuid, locale, ready]);

  if (state === "login-required") {
    return (
      <section>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="pt-32 pb-12 md:pt-40 md:pb-20">
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <h1 className="h3 mb-2">{t((m) => m.blog.loginRequiredTitle)}</h1>
              <p className="text-muted-foreground mb-6">
                {t((m) => m.blog.loginRequiredDesc)}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button asChild size="lg">
                  <Link href="/signin">{t((m) => m.blog.signIn)}</Link>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <Link href="/">{t((m) => m.blog.backToHome)}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (state === "error" || (state === "loading" && !uuid)) notFound();

  const coverImage = article?.coverImage || "/images/hero-bg-01.jpg";

  return (
    <>
      {/* Article */}
      <section className="relative">
        {/* 背景图：优先用封面，无封面回落首页 hero 图 */}
        <div className="absolute inset-0 h-[32rem] pt-16 box-content -z-10">
          <Image
            src={coverImage}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-25"
            priority
            unoptimized={!!article?.coverImage}
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-background"
            aria-hidden="true"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="pt-32 pb-12 md:pt-40 md:pb-12">
            <div className="max-w-3xl mx-auto">
              <article>
                <header className="mb-8">
                  {/* 面包屑：首页 › 分类链（后端 breadcrumbs）› 当前标题
                      后端只给分类的 id/name/englishName，没有 href，所以只有首页可点 */}
                  {state === "ok" && article ? (
                    <nav
                      aria-label="breadcrumb"
                      className="mb-4 text-sm text-muted-foreground"
                      data-aos="fade-down"
                    >
                      <ol className="flex items-center flex-wrap gap-x-2 gap-y-1 min-w-0">
                        <li>
                          <Link className="hover:text-foreground" href="/">
                            {t((m) => m.blog.breadcrumbHome)}
                          </Link>
                        </li>
                        {article.breadcrumbs.map((crumb) => (
                          <li key={crumb.id} className="flex items-center gap-2">
                            <ChevronRight
                              className="size-3 shrink-0"
                              aria-hidden="true"
                            />
                            <span className="truncate">
                              {locale === "zh-CN"
                                ? crumb.name || crumb.englishName
                                : crumb.englishName || crumb.name}
                            </span>
                          </li>
                        ))}
                        <li className="flex items-center gap-2">
                          <ChevronRight
                            className="size-3 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="font-medium text-foreground truncate">
                            {article.title}
                          </span>
                        </li>
                      </ol>
                    </nav>
                  ) : null}

                  <div className="text-center md:text-left">
                    {state === "loading" ? (
                      <ArticleHeaderSkeleton />
                    ) : (
                      <>
                        <h1 className="h1 mb-4" data-aos="fade-down">
                          {article?.title}
                        </h1>
                        {article?.description ? (
                          <p
                            className="text-xl text-muted-foreground"
                            data-aos="fade-down"
                            data-aos-delay="150"
                          >
                            {article.description}
                          </p>
                        ) : null}
                      </>
                    )}
                  </div>

                  {state === "ok" && article ? (
                    <div
                      className="md:flex md:items-center md:justify-between mt-5"
                      data-aos="fade-down"
                      data-aos-delay="300"
                    >
                      <div className="flex items-center justify-center">
                        <span className="mr-3">
                          <AuthorAvatar
                            author={article.author}
                            fallbackName={t((m) => m.blog.anonymous)}
                            size="sm"
                          />
                        </span>
                        <div className="text-muted-foreground">
                          <span>{t((m) => m.blog.byPrefix)}</span>
                          <span className="font-medium text-foreground">
                            {article.author?.username ||
                              t((m) => m.blog.anonymous)}
                          </span>
                          <span> · </span>
                          <span>{formatDate(article.updatedAt, locale)}</span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </header>

                <hr
                  className="w-5 h-px pt-px bg-border border-0 mb-8"
                  data-aos="fade-down"
                  data-aos-delay="450"
                />

                {/* 正文：sections 整块 JSON 渲染，空数组时什么都没有（由运营在后台填） */}
                {state === "loading" ? (
                  <ArticleBodySkeleton />
                ) : (
                  <div
                    className="text-lg text-muted-foreground space-y-6"
                    data-aos="fade-up"
                    data-aos-delay="450"
                  >
                    {(article?.sections ?? []).map((section) => (
                      <div key={section.id} className="space-y-6">
                        {section.title ? (
                          <h2
                            id={section.id}
                            className="h3 text-foreground scroll-mt-24"
                          >
                            {section.title}
                          </h2>
                        ) : null}
                        <div className="space-y-4">
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
                )}

                {/* 四档情绪反馈（需登录；匿名时按钮禁用并提示登录） */}
                <Feedback articleUuid={uuid} />
              </article>

              {/* 上下篇：数据来自 detail 的 siblings，两边都没有时整段不渲染 */}
              {state === "ok" &&
              article &&
              (article.siblings?.prev || article.siblings?.next) ? (
                <nav
                  className="sm:flex items-center justify-between py-8 space-y-6 sm:space-y-0 sm:gap-4"
                  aria-label={t((m) => m.blog.relatedTitle)}
                >
                  <div className="sm:w-1/2">
                    {article.siblings?.prev ? (
                      <>
                        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase mb-1">
                          {t((m) => m.blog.prevArticle)}
                        </div>
                        <Link
                          className="font-semibold flex items-center gap-2 hover:underline"
                          href={blogDetailPath(article.siblings.prev.uuid)}
                        >
                          <ChevronLeft className="size-4 shrink-0" />
                          <span className="truncate">
                            {article.siblings.prev.title}
                          </span>
                        </Link>
                      </>
                    ) : null}
                  </div>

                  <div className="sm:w-1/2 sm:flex sm:flex-col sm:items-end sm:ml-auto">
                    {article.siblings?.next ? (
                      <>
                        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase mb-1">
                          {t((m) => m.blog.nextArticle)}
                        </div>
                        <Link
                          className="font-semibold flex items-center gap-2 hover:underline"
                          href={blogDetailPath(article.siblings.next.uuid)}
                        >
                          <span className="truncate">
                            {article.siblings.next.title}
                          </span>
                          <ChevronRight className="size-4 shrink-0" />
                        </Link>
                      </>
                    ) : null}
                  </div>
                </nav>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Related posts —— loading 时出骨架，空数组隐藏整段 */}
      {(relatedLoading || related.length > 0) && (
        <aside>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
            <div className="pb-12 md:pb-20">
              <div className="max-w-3xl mx-auto">
                <h4 className="text-2xl font-bold mb-8" data-aos="fade-down">
                  {t((m) => m.blog.relatedTitle)}
                </h4>
                <div
                  className="grid gap-4 sm:gap-6 sm:grid-cols-2"
                  data-aos-id-relposts
                >
                  {relatedLoading
                    ? Array.from({ length: RELATED_LIMIT }).map((_, i) => (
                        <RelatedCardSkeleton key={`rel-skel-${i}`} />
                      ))
                    : related.map((post, idx) => {
                        const overlay =
                          RELATED_OVERLAYS[idx % RELATED_OVERLAYS.length];
                        return (
                          <article
                            key={post.uuid}
                            className="relative group p-6 text-white overflow-hidden min-h-[180px]"
                            data-aos="fade-down"
                            data-aos-anchor="[data-aos-id-relposts]"
                            data-aos-delay={idx * 100}
                          >
                            <figure className="absolute inset-0">
                              {post.coverImage ? (
                                <Image
                                  className="object-cover opacity-50 group-hover:opacity-75 transition duration-700 ease-out"
                                  src={post.coverImage}
                                  fill
                                  sizes="(min-width: 640px) 372px, 100vw"
                                  alt={post.title}
                                  unoptimized
                                />
                              ) : null}
                              <div
                                className={`absolute inset-0 ${overlay} opacity-75 group-hover:opacity-50 transition duration-700 ease-out`}
                                aria-hidden="true"
                              />
                            </figure>
                            <div className="relative flex flex-col h-full">
                              <header className="grow">
                                <Link
                                  className="hover:underline"
                                  href={blogDetailPath(post.uuid)}
                                >
                                  <h3 className="text-lg font-bold tracking-tight mb-2">
                                    {post.title}
                                  </h3>
                                </Link>
                                <div className="text-sm opacity-80">
                                  {formatDate(post.updatedAt, locale)}
                                </div>
                              </header>
                              <footer>
                                <div className="flex items-center text-sm mt-5">
                                  <span className="mr-3">
                                    <AuthorAvatar
                                      author={post.author}
                                      fallbackName={t((m) => m.blog.anonymous)}
                                      size="sm"
                                    />
                                  </span>
                                  <div>
                                    <span className="opacity-75">
                                      {t((m) => m.blog.byPrefix)}
                                    </span>
                                    <Link
                                      className="font-medium hover:underline"
                                      href={blogDetailPath(post.uuid)}
                                    >
                                      {post.author?.username ||
                                        t((m) => m.blog.anonymous)}
                                    </Link>
                                  </div>
                                </div>
                              </footer>
                            </div>
                          </article>
                        );
                      })}
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}

function ArticleHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-5/6" />
    </div>
  );
}

function ArticleBodySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i % 3 === 0 ? "w-full" : i % 3 === 1 ? "w-11/12" : "w-4/5"}`}
        />
      ))}
    </div>
  );
}

function RelatedCardSkeleton() {
  return (
    <div className="relative p-6 overflow-hidden min-h-[180px]">
      <Skeleton className="h-5 w-3/4 mb-3" />
      <Skeleton className="h-4 w-1/3" />
      <div className="absolute bottom-6 left-6 right-6">
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
