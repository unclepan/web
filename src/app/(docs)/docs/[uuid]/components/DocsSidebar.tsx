"use client";

/**
 * 文档侧边栏（分类树抽屉）
 *
 * 与线上 docs 工程一致：固定全高 —— 桌面端常驻左侧（内容区靠 `md:pl-64`
 * 让位），移动端从左侧滑出并带遮罩。层级上刻意压在全站 Header（z-30）之下，
 * 树的内容从 `pt-24 md:pt-28` 起排，避开 Header 的 64/80px 高度。
 *
 * 结构照 docs 的 `Sidebar` + `NavItemRenderer`：
 *   - 顶级分组（NavGroupItem）：24×24 立方体图标 + 组名，当前分组带蓝紫渐变背景；
 *   - 嵌套分类（NavItemRenderer）：chevron 箭头 + 组名，可折叠；
 *   - 文档叶子：链接 + 可选「需登录」锁图标。
 *
 * 数据来自 `docsApi.navTree`（服务端已只收录 DOCUMENTATION 且可见的文档并剪掉
 * 空分类），与 `/docs` 索引页同一条接口，无需再按 type 过滤。
 */
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import LoginRequiredBadge from "@/components/LoginRequiredBadge";
import { docsApi } from "@/lib/api";
import type { DocsNavArticle, DocsNavNode } from "@/lib/api";
import { useLocale } from "@/i18n/useLocale";
import { categoryLabel, findActivePath } from "@/lib/docs-tree";
import { docsDetailPath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { ChevronIcon, renderNavIcon } from "./DocsNavIcons";
import type { Locale } from "@/i18n/types";

interface DocsSidebarProps {
  /** 当前文章的 uuid，用于高亮与自动展开 */
  activeUuid: string;
  /** 移动端抽屉是否展开 */
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
}

export default function DocsSidebar({
  activeUuid,
  expanded,
  setExpanded,
}: DocsSidebarProps) {
  const { t, locale, ready } = useLocale();
  const [tree, setTree] = useState<DocsNavNode[]>([]);

  // `ready` 之前 locale 恒为默认 en，等它落定再发请求，否则中文站会白打
  // 一轮英文树。树与具体文章无关，所以依赖里不含 activeUuid —— 同站点内
  // 切换文档不会重新拉树，只有换语言才重拉。
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    docsApi
      .navTree(locale)
      .then((roots) => {
        if (!cancelled) setTree(roots);
      })
      .catch((err) => console.error("[DocsSidebar] 获取导航树失败:", err));
    return () => {
      cancelled = true;
    };
  }, [locale, ready]);

  /**
   * 激活路径 = 顶级分类 → … → 文章所属分类。
   * 整条路径上的节点都默认展开，`path[0]` 即当前顶级分组。
   */
  const activePath = useMemo(
    () => findActivePath(tree, activeUuid),
    [tree, activeUuid],
  );
  const openIds = useMemo(() => new Set(activePath ?? []), [activePath]);

  const sidebarRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const didScrollRef = useRef(false);

  // ESC 关闭（移动端）
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && expanded) setExpanded(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expanded, setExpanded]);

  // 点击侧边栏外部关闭（移动端）
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (
        expanded &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setExpanded(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [expanded, setExpanded]);

  // 首次拿到数据后把激活项滚到容器中部（只在容器内滚动，不影响页面）
  useEffect(() => {
    if (didScrollRef.current) return;
    const container = scrollRef.current;
    if (!container || tree.length === 0) return;

    const raf = requestAnimationFrame(() => {
      const activeEl = container.querySelector<HTMLElement>('[data-active="true"]');
      if (!activeEl) return;
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      container.scrollTop +=
        activeRect.top -
        containerRect.top -
        container.clientHeight / 2 +
        activeRect.height / 2;
      didScrollRef.current = true;
    });
    return () => cancelAnimationFrame(raf);
  }, [tree]);

  /** 移动端点击链接后收起抽屉 */
  const handleNavigate = () => {
    if (expanded) setExpanded(false);
  };

  return (
    <>
      {/* 遮罩层（移动端） */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-10 bg-slate-900/20 transition-opacity duration-200",
          expanded ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        aria-hidden="true"
      />

      {/*
        桌面端定位关键：`md:left-auto`。
        移动端（<md）`left-0` 生效，抽屉贴浏览器左缘滑出；
        桌面端（≥md）`md:left-auto` 取消 left-0，fixed 元素回落到 static 位置
        —— 即它在正常文档流里的位置 = `div.max-w-7xl` 容器内部的左缘。
        这样侧栏与下方内容列（`md:pl-64` 让位）左边对齐，而不是贴浏览器边缘。
      */}
      <aside
        id="docs-sidebar"
        ref={sidebarRef}
        className={cn(
          "fixed left-0 top-0 bottom-0 w-64 h-screen border-r border-border bg-background md:left-auto md:shrink-0 z-10 transition-all duration-200 ease-out md:transition-none",
          expanded
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-full md:opacity-100 md:translate-x-0",
        )}
        style={{ pointerEvents: expanded ? "auto" : undefined }}
      >
        {/*
          内层滚动容器：线上是 `px-4 sm:px-6 md:pl-0 md:pr-8` —— 桌面端取消左
          内边距、右侧留 32px，让分类树更靠左、与右侧正文拉开距离。
          no-scrollbar 在 web 里的等价物是 scrollbar-thin。
        */}
        <div
          ref={scrollRef}
          className="fixed top-0 bottom-0 w-64 px-4 sm:px-6 md:pl-0 md:pr-8 overflow-y-auto scrollbar-thin"
        >
          <div className="pt-24 md:pt-28 pb-8">
            <nav aria-label={t((m) => m.docsDetail.sidebarNav)}>
              <ul className="text-sm">
                {tree.map((group) => (
                  <NavGroupItem
                    key={group.id}
                    node={group}
                    activeUuid={activeUuid}
                    openIds={openIds}
                    locale={locale}
                    onNavigate={handleNavigate}
                  />
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}

interface SharedProps {
  activeUuid: string;
  openIds: Set<number>;
  locale: Locale;
  onNavigate: () => void;
}

/**
 * 顶级分组（docs 的 NavGroupItem）
 *
 * 组头 = 立方体图标 + 组名，**当前激活分组**（含当前文章的那个）带蓝紫渐变
 * 背景。docs 用 `font-[650]`，web 的字体没有这个字重，用 `font-semibold`。
 */
function NavGroupItem({ node, activeUuid, openIds, locale, onNavigate }: SharedProps & { node: DocsNavNode }) {
  const isActiveGroup = openIds.has(node.id);
  const [open, setOpen] = useState(isActiveGroup);
  const hasItems = node.children.length > 0 || node.articles.length > 0;

  // 换文章时把新激活分组展开（不折叠用户手动打开的其它分组）
  useEffect(() => {
    if (openIds.has(node.id)) setOpen(true);
  }, [openIds, node.id]);

  return (
    <li className="mb-1">
      <button
        type="button"
        onClick={() => {
          if (hasItems) setOpen(!open);
        }}
        aria-haspopup={hasItems ? true : undefined}
        aria-expanded={hasItems ? open : undefined}
        className={cn(
          "relative flex items-center w-full text-left font-semibold text-foreground p-1 before:absolute before:inset-0 before:rounded before:bg-gradient-to-tr before:from-blue-400 before:to-purple-500 before:opacity-20 before:-z-10 before:pointer-events-none",
          !isActiveGroup && "before:hidden",
        )}
      >
        {renderNavIcon(node.icon)}
        <span>{categoryLabel(node, locale)}</span>
      </button>

      {hasItems && open ? (
        <ul className="mb-3 ml-4 pl-6 border-l border-border">
          {node.children.map((child) => (
            <NavItemRenderer
              key={child.id}
              node={child}
              level={0}
              activeUuid={activeUuid}
              openIds={openIds}
              locale={locale}
              onNavigate={onNavigate}
            />
          ))}
          {node.articles.map((article) => (
            <LeafItem
              key={article.uuid}
              article={article}
              level={0}
              active={article.uuid === activeUuid}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/**
 * 嵌套分类（docs 的 NavItemRenderer 的 hasChildren 分支）
 *
 * chevron + 组名，可折叠；有子分类时先递归子分类，再列本分类的文档叶子。
 */
function NavItemRenderer({
  node,
  level,
  activeUuid,
  openIds,
  locale,
  onNavigate,
}: SharedProps & { node: DocsNavNode; level: number }) {
  const [expanded, setExpanded] = useState(openIds.has(node.id));
  const hasItems = node.children.length > 0 || node.articles.length > 0;

  useEffect(() => {
    if (openIds.has(node.id)) setExpanded(true);
  }, [openIds, node.id]);

  const textClass = cn(
    "flex items-center space-x-3 w-full text-left",
    level === 0
      ? "font-medium text-foreground"
      : "font-normal text-muted-foreground",
  );

  return (
    <li className="mt-3">
      <button
        type="button"
        className={textClass}
        onClick={() => {
          if (hasItems) setExpanded(!expanded);
        }}
        aria-haspopup={hasItems ? true : undefined}
        aria-expanded={hasItems ? expanded : undefined}
      >
        <span>{categoryLabel(node, locale)}</span>
        {hasItems ? <ChevronIcon expanded={expanded} /> : null}
      </button>

      {hasItems && expanded ? (
        <ul className="mb-3 ml-1 pl-4 border-l border-border">
          {node.children.map((child) => (
            <NavItemRenderer
              key={child.id}
              node={child}
              level={level + 1}
              activeUuid={activeUuid}
              openIds={openIds}
              locale={locale}
              onNavigate={onNavigate}
            />
          ))}
          {node.articles.map((article) => (
            <LeafItem
              key={article.uuid}
              article={article}
              level={level + 1}
              active={article.uuid === activeUuid}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/** 文档叶子（docs 的 NavItemRenderer 的叶子分支）：链接 + 可选锁图标 */
function LeafItem({
  article,
  level,
  active,
  onNavigate,
}: {
  article: DocsNavArticle;
  level: number;
  active: boolean;
  onNavigate: () => void;
}) {
  const textClass = cn(
    "flex items-center space-x-3",
    active
      ? "text-blue-600"
      : level === 0
        ? "text-foreground"
        : "text-muted-foreground",
    level === 0 ? "font-medium" : "font-normal",
  );

  return (
    <li className="mt-3" data-active={active ? "true" : undefined}>
      <Link
        className={textClass}
        href={docsDetailPath(article.uuid)}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
      >
        <span className="inline-flex items-center gap-1.5">
          <span>{article.title}</span>
          {article.isLoginRequired ? <LoginRequiredBadge variant="icon" /> : null}
        </span>
      </Link>
    </li>
  );
}
