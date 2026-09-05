"use client";

/**
 * 文档索引页（`DocsArticle` 的 `type=DOCUMENTATION` 全量列表）
 *
 * 数据来自 `docsApi.navTree` —— 服务端已按 `type=DOCUMENTATION && isVisible`
 * 过滤并剪掉空分类，返回的根分类数组既当「目录树」也当「列表数据源」，
 * 不必再打一次列表接口。
 *
 * 结构说明：Header / main / Footer 由 `(marketing)/layout.tsx` 提供，AOS 由
 * 根布局 `AosInit` 全局初始化 —— 这里只写 `data-aos` 属性、只管内容排布。
 * 宽度容器沿用该路由组的惯例：**由页面自己写** `max-w-7xl mx-auto px-4
 * sm:px-6`（与 about / resources / contact 一致；线上 docs 是 max-w-7xl，
 * 那是跟它自己的 Header 对齐的，web 的 Header 是 6xl）。
 */
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FolderOpen, Search } from "lucide-react";
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
import LoginRequiredBadge from "@/components/LoginRequiredBadge";
import { docsApi } from "@/lib/api";
import type { DocsNavNode } from "@/lib/api";
import { format, useLocale } from "@/i18n/useLocale";
import { formatDateTime } from "@/lib/format-date";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { categoryLabel } from "@/lib/docs-tree";
import { docsDetailPath } from "@/lib/routes";
import type { Locale } from "@/i18n/types";

/** 顶部「推荐阅读」区块条数 */
const FEATURED_LIMIT = 6;

/** 分类链上的节点：只留渲染用的字段，不持有整棵子树的引用 */
type CategoryRef = Pick<DocsNavNode, "id" | "name" | "englishName">;

/** 扁平化后的文档叶子 = 文章运营字段 + 它所属的分类链 */
interface FlatDoc {
  uuid: string;
  title: string;
  sortOrder: number;
  updatedAt: string;
  isHot: boolean;
  isFeatured: boolean;
  isLoginRequired: boolean;
  /** 顶级分类 → 直接父分类（不含文章自身） */
  categoryPath: CategoryRef[];
  /** 顶级分类 id，用于 chips 筛选 */
  topGroupId: number;
}

/**
 * 把分类树拍平成文档叶子数组
 *
 * 与线上 docs 的行为一致：先递归子分类，再收本节点的文章；categoryPath 从
 * 顶级分类起逐层累加。一个节点同时有子分类和文章时，文章排在子分类之后。
 */
function flattenNode(
  node: DocsNavNode,
  path: CategoryRef[],
  topGroupId: number,
  out: FlatDoc[],
): void {
  for (const child of node.children) {
    flattenNode(child, [...path, child], topGroupId, out);
  }
  for (const a of node.articles) {
    out.push({
      uuid: a.uuid,
      title: a.title,
      sortOrder: a.sortOrder,
      updatedAt: a.updatedAt,
      isHot: a.isHot,
      isFeatured: a.isFeatured,
      isLoginRequired: a.isLoginRequired,
      categoryPath: path,
      topGroupId,
    });
  }
}

function flattenTree(roots: DocsNavNode[]): FlatDoc[] {
  const out: FlatDoc[] = [];
  for (const root of roots) flattenNode(root, [root], root.id, out);
  return out;
}

/** 二级子分类的排序命名空间键（按顶级分类隔离） */
function subKey(doc: FlatDoc): string {
  return `${doc.topGroupId}//${doc.categoryPath[1]?.id ?? ""}`;
}

export default function DocsIndexContent() {
  // `ready` 之前 locale 恒为默认 en，等它落定再发请求，中文站访客
  // 就不会在首屏白打一轮英文内容（locale 一变 effect 会重跑）
  const { t, locale, ready } = useLocale();

  const [tree, setTree] = useState<DocsNavNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    setIsLoading(true);
    docsApi
      .navTree(locale)
      .then((roots) => {
        if (cancelled) return;
        setTree(roots);
      })
      .catch((err) => console.error("[DocsIndex] 获取导航树失败:", err))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [locale, ready]);

  // 筛选状态：顶级分类 + 二级子分类（仅选中顶级时生效）+ 关键字
  const [activeGroup, setActiveGroup] = useState<number | null>(null);
  const [activeSub, setActiveSub] = useState<number | null>(null);
  const [keyword, setKeyword] = useState("");

  /**
   * 跨分组扁平 + 分组优先的稳定排序：
   * 1) 先按顶级分类聚拢 —— 顺序与 navTree 根数组一致（即与目录树一致）
   * 2) 同一顶级分类内按「二级子分类首次出现顺序」再聚拢一层
   * 3) 组内才按全站约定排序：sortOrder asc，再 updatedAt desc
   *
   * 这样视觉上同一分类的文档不会被打散，又保留运营 sortOrder 的话语权。
   */
  const docs = useMemo(() => {
    const groupRank = new Map<number, number>();
    tree.forEach((g, i) => groupRank.set(g.id, i));

    const all = flattenTree(tree);

    const subRank = new Map<string, number>();
    for (const d of all) {
      const key = subKey(d);
      if (!subRank.has(key)) subRank.set(key, subRank.size);
    }

    all.sort((a, b) => {
      const ga = groupRank.get(a.topGroupId) ?? Number.MAX_SAFE_INTEGER;
      const gb = groupRank.get(b.topGroupId) ?? Number.MAX_SAFE_INTEGER;
      if (ga !== gb) return ga - gb;

      const sa = subRank.get(subKey(a)) ?? Number.MAX_SAFE_INTEGER;
      const sb = subRank.get(subKey(b)) ?? Number.MAX_SAFE_INTEGER;
      if (sa !== sb) return sa - sb;

      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      const ta = a.updatedAt ? Date.parse(a.updatedAt) : 0;
      const tb = b.updatedAt ? Date.parse(b.updatedAt) : 0;
      return tb - ta;
    });

    return all;
  }, [tree]);

  /**
   * 顶部「推荐阅读」：取 isFeatured 的前 N 篇。
   * 该区块独立于下方的筛选 / 搜索，始终显示；被推荐的文档在主列表里也会
   * 出现，方便用户筛选或搜索时仍能从主列表找到它们。
   */
  const featuredDocs = useMemo(
    () => docs.filter((d) => d.isFeatured).slice(0, FEATURED_LIMIT),
    [docs],
  );

  /** 顶级分类 chips 候选（按 navTree 根数组顺序） */
  const topGroups = useMemo<CategoryRef[]>(() => tree, [tree]);

  /** 当前顶级分类下的二级子分类 chips 候选（按首次出现顺序去重） */
  const subcategories = useMemo<CategoryRef[]>(() => {
    if (activeGroup === null) return [];
    const seen = new Set<number>();
    const list: CategoryRef[] = [];
    for (const d of docs) {
      const sub = d.categoryPath[1];
      if (d.topGroupId !== activeGroup || !sub || seen.has(sub.id)) continue;
      seen.add(sub.id);
      list.push(sub);
    }
    return list;
  }, [docs, activeGroup]);

  const filteredDocs = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return docs.filter((d) => {
      if (activeGroup !== null && d.topGroupId !== activeGroup) return false;
      if (activeSub !== null && d.categoryPath[1]?.id !== activeSub) {
        return false;
      }
      if (kw && !d.title.toLowerCase().includes(kw)) return false;
      return true;
    });
  }, [docs, activeGroup, activeSub, keyword]);

  const hasActiveFilter =
    activeGroup !== null || activeSub !== null || keyword.trim().length > 0;

  const clearFilters = () => {
    setActiveGroup(null);
    setActiveSub(null);
    setKeyword("");
  };

  return (
    <>
      {/* Hero */}
      <section className="relative">
        {/* 背景图 */}
        <div className="absolute inset-0 h-[32rem] pt-16 box-content -z-10">
          <Image
            src="/images/hero-bg-02.jpg"
            alt={t((m) => m.docsIndex.heroImageAlt)}
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
              <h1 className="h1 mb-4">{t((m) => m.docsIndex.title)}</h1>
              <p className="text-xl text-muted-foreground">
                {t((m) => m.docsIndex.subtitle)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 列表区 */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="pb-12 md:pb-20">
            {isLoading ? <DocsSkeleton /> : null}

            {/* 数据集为空：当前语言下没有任何可见文档 */}
            {!isLoading && docs.length === 0 ? (
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
            ) : null}

            {!isLoading && docs.length > 0 ? (
              <>
                {/* 推荐阅读：独立于筛选与搜索 */}
                {featuredDocs.length > 0 ? (
                  <section
                    className="mb-8"
                    aria-labelledby="featured-heading"
                    data-aos="fade-up"
                  >
                    <h2
                      id="featured-heading"
                      className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider"
                    >
                      {t((m) => m.docsIndex.featuredTitle)}
                    </h2>
                    <ul
                      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                      data-aos="fade-up"
                      data-aos-delay="100"
                    >
                      {featuredDocs.map((doc, index) => (
                        <li
                          key={doc.uuid}
                          data-aos="fade-up"
                          data-aos-delay={100 + index * 50}
                        >
                          <DocCard
                            doc={doc}
                            locale={locale}
                            t={t}
                            showCategoryPath={false}
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {/* 筛选条 */}
                <div
                  className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6"
                  data-aos="fade-up"
                >
                  {/* 两层 chips：顶级分类 + 其二级子分类 */}
                  <div className="flex flex-col gap-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <CategoryChip
                        active={activeGroup === null}
                        onClick={() => {
                          setActiveGroup(null);
                          setActiveSub(null);
                        }}
                        label={t((m) => m.docsIndex.categoryAll)}
                      />
                      {topGroups.map((g) => (
                        <CategoryChip
                          key={g.id}
                          active={activeGroup === g.id}
                          onClick={() => {
                            // 切换顶级时清空子分类，避免上一组的子项错位生效
                            setActiveGroup(g.id);
                            setActiveSub(null);
                          }}
                          label={categoryLabel(g, locale)}
                        />
                      ))}
                    </div>

                    {/* 二级子分类：再次点击当前激活项即取消，没有显式的「全部」 */}
                    {activeGroup !== null && subcategories.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {subcategories.map((sub) => (
                          <CategoryChip
                            key={sub.id}
                            active={activeSub === sub.id}
                            onClick={() =>
                              setActiveSub((prev) =>
                                prev === sub.id ? null : sub.id,
                              )
                            }
                            label={categoryLabel(sub, locale)}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {/* 搜索框 */}
                  <div className="relative md:w-56 shrink-0">
                    <input
                      type="search"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder={t((m) => m.docsIndex.searchPlaceholder)}
                      aria-label={t((m) => m.docsIndex.searchPlaceholder)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400"
                    />
                    <Search
                      aria-hidden="true"
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"
                    />
                  </div>
                </div>

                {/* 计数 + 清空筛选 */}
                <div className="flex items-baseline justify-between gap-4 mb-4">
                  <span className="text-sm text-muted-foreground">
                    {filteredDocs.length === 1
                      ? t((m) => m.docsIndex.countOne)
                      : format(t((m) => m.docsIndex.countMany), {
                          n: filteredDocs.length,
                        })}
                  </span>
                  {hasActiveFilter ? (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {t((m) => m.docsIndex.clearFilters)}
                    </button>
                  ) : null}
                </div>

                {/* 结果列表 / 无匹配提示 */}
                {filteredDocs.length === 0 ? (
                  <div
                    className="max-w-2xl mx-auto text-center py-16 text-muted-foreground"
                    data-aos="fade-up"
                  >
                    {t((m) => m.docsIndex.noResults)}
                  </div>
                ) : (
                  <ul
                    className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                    data-aos="fade-up"
                    data-aos-delay="100"
                  >
                    {filteredDocs.map((doc) => (
                      <li key={doc.uuid}>
                        <DocCard doc={doc} locale={locale} t={t} />
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}

interface DocCardProps {
  doc: FlatDoc;
  locale: Locale;
  t: ReturnType<typeof useLocale>["t"];
  /** 推荐区不显示分类路径，保持视觉聚焦 */
  showCategoryPath?: boolean;
}

function DocCard({ doc, locale, t, showCategoryPath = true }: DocCardProps) {
  return (
    <Link
      href={docsDetailPath(doc.uuid)}
      className="flex flex-col gap-2 h-full px-4 py-3 rounded-lg border border-border bg-card text-foreground hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition-colors"
    >
      <div className="flex items-start gap-2">
        <span className="font-medium line-clamp-2 grow min-w-0">
          {doc.title}
        </span>
        {/* 右上角角标区：纵向叠放，isHot 在上，isLoginRequired 在下 */}
        {doc.isHot || doc.isLoginRequired ? (
          <span className="shrink-0 inline-flex flex-col items-end gap-1">
            {doc.isHot ? (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-medium leading-none">
                {t((m) => m.docsIndex.tagHot)}
              </span>
            ) : null}
            {doc.isLoginRequired ? <LoginRequiredBadge variant="tag" /> : null}
          </span>
        ) : null}
      </div>

      {/* 分类路径 + 更新时间：分类在前 */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {showCategoryPath && doc.categoryPath.length > 0 ? (
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded bg-muted max-w-[60%] truncate"
            title={doc.categoryPath
              .map((c) => categoryLabel(c, locale))
              .join(" / ")}
          >
            {doc.categoryPath.map((seg, idx) => (
              <span key={seg.id} className="inline-flex items-center">
                {idx > 0 ? (
                  <span aria-hidden="true" className="mx-1 opacity-60">
                    /
                  </span>
                ) : null}
                <span className="truncate">{categoryLabel(seg, locale)}</span>
              </span>
            ))}
          </span>
        ) : null}
        {doc.updatedAt ? (
          <time
            dateTime={doc.updatedAt}
            title={formatDateTime(doc.updatedAt, locale)}
          >
            {formatRelativeTime(doc.updatedAt, t)}
          </time>
        ) : null}
      </div>
    </Link>
  );
}

/** 分类筛选 chip：默认浅色，激活时蓝色高亮 */
function CategoryChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border " +
        (active
          ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
          : "bg-card border-border text-muted-foreground hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400")
      }
    >
      {label}
    </button>
  );
}

/** 加载占位：12 个卡片骨架 */
function DocsSkeleton() {
  return (
    <ul
      aria-hidden="true"
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <li key={i}>
          <Skeleton className="h-16 rounded-lg" />
        </li>
      ))}
    </ul>
  );
}
