import type { DocsNavNode } from "@/lib/api";
import type { Locale } from "@/i18n/types";

/**
 * 文档分类树（`GET /docs/sidebar/nav-tree`）的取用工具
 *
 * 索引页 `/docs` 现在用它；以后详情页的侧边栏也会用，所以放在 `lib/` 而不是
 * 某个页面目录下，避免两处各写一份走偏。
 */

/** 分类名按站点语言取值，互为兜底（中英任一为空都能正常展示） */
export function categoryLabel(
  node: Pick<DocsNavNode, "name" | "englishName">,
  locale: Locale,
): string {
  return locale === "zh-CN"
    ? node.name || node.englishName
    : node.englishName || node.name;
}

/**
 * 找出某篇文章在分类树上的完整路径（含它所属的那一层节点 id）
 *
 * 返回 `[顶级分类id, 子分类id, …]`，因此 `path[0]` 就是顶级分组，整条路径
 * 即「需要默认展开的节点」集合 —— 详情页侧边栏靠它把当前文档所在分支展开。
 */
export function findActivePath(
  nodes: DocsNavNode[],
  targetUuid: string,
  path: number[] = [],
): number[] | null {
  for (const node of nodes) {
    const next = [...path, node.id];
    if (node.articles.some((a) => a.uuid === targetUuid)) return next;
    const found = findActivePath(node.children, targetUuid, next);
    if (found) return found;
  }
  return null;
}
