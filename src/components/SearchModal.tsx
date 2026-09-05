"use client";

/**
 * 全站搜索组件（照线上 docs 工程的 `SearchModal`）
 *
 * 自带触发按钮 + 模态框 + 热门推荐 + 实时搜索 + 快捷键 `/`。
 * 同时检索 DOCUMENTATION 与 DESIGN，每类各显示前 3 条，标题前显示【分类名】。
 *
 * 与 docs 的差异：
 *   - 接口走合并后的 `DocsArticle` 单表：`search` / `hot` 都带 `type` 参数，
 *     用 `type` 区分 DOCUMENTATION / DESIGN，不再分 documentations / designs 两套；
 *   - 分类名前缀来自 `GET /docs/categories`（id/name/englishName），不是单独的
 *     categoryService；
 *   - 色 token 换 web 语义色（slate-* → foreground / muted-foreground / border 等）。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Zap } from "lucide-react";
import LoginRequiredBadge from "@/components/LoginRequiredBadge";
import { docsApi } from "@/lib/api";
import type { DocsArticle, DocsCategoryNode } from "@/lib/api";
import { useLocale, type TranslateFn } from "@/i18n/useLocale";
import { blogDetailPath, docsDetailPath } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** 内容类别：文档 / 设计 */
type ContentKind = "doc" | "design";

/** 搜索结果项的统一渲染结构 */
interface ResultEntry {
  uuid: string;
  title: string;
  description: string;
  categoryId: number | null;
  isLoginRequired: boolean;
  kind: ContentKind;
}

/** 每类最多展示条数 */
const PER_KIND_LIMIT = 3;

/** 无 categoryId 时的兜底前缀（依赖 t 取当前语言） */
function getKindFallbackLabel(t: TranslateFn, kind: ContentKind): string {
  return kind === "doc"
    ? t((m) => m.search.documents)
    : t((m) => m.search.designs);
}

interface SearchModalProps {
  /** 紧凑模式：只渲染一个放大镜图标按钮（适合移动端） */
  compact?: boolean;
}

export default function SearchModal({ compact = false }: SearchModalProps) {
  const router = useRouter();
  const { t, locale } = useLocale();

  // 分类树：做 categoryId → 分类名 映射
  const [categories, setCategories] = useState<DocsCategoryNode[]>([]);
  useEffect(() => {
    let cancelled = false;
    docsApi
      .categories()
      .then((roots) => {
        if (!cancelled) setCategories(roots);
      })
      .catch((err) => console.error("[SearchModal] 获取分类失败:", err));
    return () => {
      cancelled = true;
    };
  }, []);

  const [searchOpen, setSearchOpen] = useState(false); // 控制动画
  const [searchVisible, setSearchVisible] = useState(false); // 控制 DOM 是否存在
  const [searchQuery, setSearchQuery] = useState("");
  const [hotDocs, setHotDocs] = useState<ResultEntry[]>([]);
  const [hotDesigns, setHotDesigns] = useState<ResultEntry[]>([]);
  const [searchDocResults, setSearchDocResults] = useState<ResultEntry[]>([]);
  const [searchDesignResults, setSearchDesignResults] = useState<ResultEntry[]>(
    [],
  );
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** categoryId -> name 映射（拍平分类树） */
  const categoryNameMap = useMemo(() => {
    const map = new Map<number, string>();
    const walk = (nodes: DocsCategoryNode[]) => {
      for (const c of nodes) {
        map.set(
          c.id,
          locale === "zh-CN" ? c.name || c.englishName : c.englishName || c.name,
        );
        walk(c.children);
      }
    };
    walk(categories);
    return map;
  }, [categories, locale]);

  /** 取一项的展示前缀：优先分类名，其次 kind 兜底 */
  const getPrefix = useCallback(
    (entry: ResultEntry): string => {
      if (entry.categoryId != null) {
        const name = categoryNameMap.get(entry.categoryId);
        if (name) return name;
      }
      return getKindFallbackLabel(t, entry.kind);
    },
    [categoryNameMap, t],
  );

  /** 把 DocsArticle 收敛到 ResultEntry，取前 PER_KIND_LIMIT 条 */
  const toEntries = useCallback(
    (items: DocsArticle[], kind: ContentKind): ResultEntry[] =>
      items.slice(0, PER_KIND_LIMIT).map((it) => ({
        uuid: it.uuid,
        title: it.title,
        description: it.description,
        categoryId: it.categoryId ?? null,
        isLoginRequired: Boolean(it.isLoginRequired),
        kind,
      })),
    [],
  );

  // 获取热门（doc + design 并行，各前 3；携带当前 locale）
  const fetchHot = useCallback(async () => {
    try {
      const [docsResp, designsResp] = await Promise.all([
        docsApi.hot("DOCUMENTATION", locale, PER_KIND_LIMIT),
        docsApi.hot("DESIGN", locale, PER_KIND_LIMIT),
      ]);
      setHotDocs(toEntries(docsResp, "doc"));
      setHotDesigns(toEntries(designsResp, "design"));
    } catch (err) {
      console.error("[SearchModal] 拉取热门失败:", err);
      setHotDocs([]);
      setHotDesigns([]);
    }
  }, [locale, toEntries]);

  // 搜索（doc + design 并行，各前 3；携带当前 locale）
  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setSearchDocResults([]);
        setSearchDesignResults([]);
        setHasSearched(false);
        return;
      }
      setIsSearching(true);
      try {
        const [docsResp, designsResp] = await Promise.all([
          docsApi.search(q, "DOCUMENTATION", locale, PER_KIND_LIMIT),
          docsApi.search(q, "DESIGN", locale, PER_KIND_LIMIT),
        ]);
        setSearchDocResults(toEntries(docsResp.items, "doc"));
        setSearchDesignResults(toEntries(designsResp.items, "design"));
        setHasSearched(true);
      } catch (err) {
        console.error("[SearchModal] 搜索失败:", err);
        setSearchDocResults([]);
        setSearchDesignResults([]);
        setHasSearched(true);
      } finally {
        setIsSearching(false);
      }
    },
    [locale, toEntries],
  );

  // 输入变化时 debounce 搜索
  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (!value.trim()) {
      setSearchDocResults([]);
      setSearchDesignResults([]);
      setHasSearched(false);
      return;
    }
    debounceTimerRef.current = setTimeout(() => doSearch(value), 300);
  };

  // 打开搜索（先挂载 DOM，再触发动画）
  const openSearch = useCallback(() => {
    setSearchVisible(true);
    document.body.classList.add("overflow-hidden");
    fetchHot();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSearchOpen(true);
        searchInputRef.current?.focus();
      });
    });
  }, [fetchHot]);

  // 关闭搜索（先触发退出动画，动画结束后卸载 DOM）
  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    document.body.classList.remove("overflow-hidden");
    setTimeout(() => {
      setSearchVisible(false);
      setSearchQuery("");
      setSearchDocResults([]);
      setSearchDesignResults([]);
      setHasSearched(false);
    }, 200);
  }, []);

  // 点击搜索结果跳转：doc -> /docs/uuid, design -> /blog/uuid
  const handleResultClick = (entry: ResultEntry) => {
    closeSearch();
    router.push(
      entry.kind === "design"
        ? blogDetailPath(entry.uuid)
        : docsDetailPath(entry.uuid),
    );
  };

  // 点击模态框外部关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (
      modalContentRef.current &&
      !modalContentRef.current.contains(e.target as Node)
    ) {
      closeSearch();
    }
  };

  // 监听 "/" 快捷键打开搜索 / Esc 关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isEditable =
        tag === "input" || tag === "textarea" || target?.isContentEditable;
      if (e.key === "/" && !searchOpen && !isEditable) {
        e.preventDefault();
        openSearch();
      }
      if (e.key === "Escape" && searchOpen) {
        closeSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, openSearch, closeSearch]);

  /** 渲染单个结果分组（搜索结果 / 热门推荐都用它） */
  const renderGroup = (
    title: string,
    entries: ResultEntry[],
    iconClassName: string,
    emptyText: string | null,
  ) => {
    if (entries.length === 0) {
      if (emptyText === null) return null; // 不显示空状态
      return (
        <div>
          <div className="text-sm font-medium text-muted-foreground px-2 mb-2">
            {title}
          </div>
          <div className="text-sm text-muted-foreground px-2 py-4 text-center">
            {emptyText}
          </div>
        </div>
      );
    }
    return (
      <div>
        <div className="text-sm font-medium text-muted-foreground px-2 mb-2">
          {title}
        </div>
        <ul>
          {entries.map((item) => (
            <li key={`${item.kind}-${item.uuid}`}>
              <button
                type="button"
                className="w-full flex items-center px-2 py-1.5 leading-6 text-sm text-foreground hover:bg-muted rounded outline-none text-left"
                onClick={() => handleResultClick(item)}
              >
                <Zap
                  className={cn("w-3 h-3 shrink-0 mr-3", iconClassName)}
                  fill="currentColor"
                  strokeWidth={0}
                />
                <div className="min-w-0">
                  <div className="font-medium flex items-center gap-1 min-w-0">
                    {item.isLoginRequired ? (
                      <LoginRequiredBadge variant="icon" className="shrink-0" />
                    ) : null}
                    <span className="truncate">
                      <span className="text-muted-foreground mr-1">
                        【{getPrefix(item)}】
                      </span>
                      {item.title}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <>
      {/* 触发按钮 */}
      {compact ? (
        <button
          type="button"
          className="p-2 flex items-center justify-center text-muted-foreground hover:text-foreground transition duration-150 ease-in-out"
          onClick={(e) => {
            e.preventDefault();
            openSearch();
          }}
          aria-controls="search-modal"
          aria-label={t((m) => m.search.triggerAria)}
        >
          <span className="sr-only">{t((m) => m.search.triggerAria)}</span>
          <Search className="w-5 h-5 shrink-0" />
        </button>
      ) : (
        <button
          type="button"
          className="inline-flex h-9 w-[160px] lg:w-[200px] items-center gap-2 rounded-md border border-border bg-muted pl-3 pr-1.5 text-left text-sm text-muted-foreground transition-colors hover:border-ring hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={(e) => {
            e.preventDefault();
            openSearch();
          }}
          aria-controls="search-modal"
        >
          <Search className="size-4 shrink-0" />
          <span className="truncate">{t((m) => m.search.triggerLabel)}</span>
          <kbd className="ml-auto shrink-0 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[11px] leading-none text-muted-foreground">
            /
          </kbd>
        </button>
      )}

      {/* 搜索模态框 */}
      {searchVisible && (
        <>
          {/* 遮罩层 */}
          <div
            className={`fixed inset-0 bg-slate-900/20 z-50 transition-opacity ${
              searchOpen
                ? "duration-200 ease-out opacity-100"
                : "duration-100 ease-out opacity-0"
            }`}
            aria-hidden="true"
            onClick={closeSearch}
          />
          {/* 模态框 */}
          <div
            id="search-modal"
            className={`fixed inset-0 z-50 overflow-hidden flex items-start top-20 md:top-28 mb-4 justify-center px-4 sm:px-6 transition-all duration-200 ease-in-out ${
              searchOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            role="dialog"
            aria-modal="true"
            onClick={handleBackdropClick}
          >
            <div
              ref={modalContentRef}
              className="bg-background overflow-auto max-w-2xl w-full max-h-full rounded shadow-lg border border-border"
            >
              {/* 搜索表单 */}
              <form
                className="border-b border-border"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="flex items-center">
                  <label htmlFor="modal-search">
                    <span className="sr-only">
                      {t((m) => m.search.triggerAria)}
                    </span>
                    <Search className="w-4 h-4 text-muted-foreground shrink-0 ml-4" />
                  </label>
                  <input
                    id="modal-search"
                    className="text-sm w-full bg-background border-0 outline-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground appearance-none py-3 pl-2 pr-4"
                    type="search"
                    placeholder={t((m) => m.search.inputPlaceholder)}
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                  />
                </div>
              </form>
              <div className="py-4 px-2 space-y-4">
                {/* 搜索中状态 */}
                {isSearching && (
                  <div className="text-sm text-muted-foreground px-2 py-4 text-center">
                    {t((m) => m.search.searching)}
                  </div>
                )}

                {/* 搜索结果（分两组：文档 / 设计） */}
                {!isSearching && hasSearched && (
                  <>
                    {searchDocResults.length === 0 &&
                    searchDesignResults.length === 0 ? (
                      <div className="text-sm text-muted-foreground px-2 py-4 text-center">
                        {t((m) => m.search.noResults)}
                      </div>
                    ) : (
                      <>
                        {renderGroup(
                          t((m) => m.search.documents),
                          searchDocResults,
                          "text-slate-400 dark:text-slate-500",
                          null,
                        )}
                        {renderGroup(
                          t((m) => m.search.designs),
                          searchDesignResults,
                          "text-indigo-400 dark:text-indigo-500",
                          null,
                        )}
                      </>
                    )}
                  </>
                )}

                {/* 热门推荐（无搜索时展示，分两组） */}
                {!isSearching && !hasSearched && (
                  <>
                    {renderGroup(
                      t((m) => m.search.hotDocuments),
                      hotDocs,
                      "text-orange-400 dark:text-orange-500",
                      t((m) => m.search.noHotDocuments),
                    )}
                    {renderGroup(
                      t((m) => m.search.hotDesigns),
                      hotDesigns,
                      "text-pink-400 dark:text-pink-500",
                      t((m) => m.search.noHotDesigns),
                    )}
                  </>
                )}

                {/* Actions */}
                <div>
                  <div className="text-sm font-medium text-muted-foreground px-2 mb-2">
                    {t((m) => m.search.actions)}
                  </div>
                  <ul>
                    <li>
                      <Link
                        className="flex items-center px-2 py-1 leading-6 text-sm text-foreground hover:bg-muted rounded outline-none"
                        href="/contact"
                        onClick={closeSearch}
                      >
                        <Zap
                          className="w-3 h-3 text-blue-600 shrink-0 mr-3"
                          fill="currentColor"
                          strokeWidth={0}
                        />
                        <span className="font-medium">
                          {t((m) => m.search.submitFeedback)}
                        </span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
