"use client";

/**
 * 右侧目录导航（On this page）
 *
 * 目录项由文章的 `sections` 派生 —— 后端不返回 toc 字段（schema 注释写明
 * 「breadcrumbs / toc 由分类表与 sections 派生，不入库」），前端按
 * `section.id` + `section.title` 现算即可。
 *
 * 线上 docs 的实现是直接操作 DOM 的 classList 加 `.scrollspy-active`，但那条
 * CSS 规则在 docs 里并不存在（高亮恒失效）。这里改成 React state 驱动，高亮
 * 走条件类名，不额外依赖全局样式。
 */
import { useEffect, useState } from "react";
import { useLocale } from "@/i18n/useLocale";
import { cn } from "@/lib/utils";

/** 命中判定提前量：滚到标题上方 100px 即算进入该节 */
const TARGET_MARGIN = 100;

export interface TocItem {
  id: string;
  title: string;
}

export default function DocsToc({ items }: { items: TocItem[] }) {
  const { t } = useLocale();
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    if (items.length === 0) return;
    setActiveId(items[0]?.id ?? null);

    const handleScroll = () => {
      // 取最后一个「已滚过顶部」的目标，即当前阅读位置所在的小节
      let current = items[0]?.id ?? null;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && window.scrollY >= el.offsetTop - TARGET_MARGIN) {
          current = item.id;
        }
      }
      setActiveId(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="hidden xl:block w-48 shrink-0">
      <div className="fixed bottom-0 h-[calc(100vh-5rem)] w-48 overflow-y-auto pt-32 pb-8 scrollbar-thin">
        <div className="border-l border-border">
          <div className="text-xs font-semibold text-muted-foreground uppercase pl-4 py-1.5">
            {t((m) => m.docsDetail.onThisPage)}
          </div>
          <ul className="text-sm">
            {items.map((item) => {
              const active = item.id === activeId;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={cn(
                      "relative block font-normal pl-4 py-1.5 before:absolute before:-left-px before:top-2 before:bottom-2 before:w-0.5",
                      active
                        ? "text-blue-600 before:bg-blue-600"
                        : "text-muted-foreground before:bg-transparent hover:text-foreground",
                    )}
                  >
                    {item.title}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
