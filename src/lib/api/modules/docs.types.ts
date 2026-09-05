/**
 * docs 服务（DocsArticle）相关类型定义
 *
 * 与后端 `apps/docs/src/services/article.service.ts` 的 `ARTICLE_SELECT`
 * 严格一一对应。注意：当前空间是**合表**设计 —— 原 documentations /
 * designs 两张表已合并为 `DocsArticle`，由 `type` 字段区分，首页走
 * `DESIGN`，因此这里不再有 `DesignSummary` / `DocumentationSummary` 之分。
 */

/** 文章类型：DOCUMENTATION=产品文档（无作者），DESIGN=设计稿（有作者） */
export type DocsArticleType = "DOCUMENTATION" | "DESIGN";

/** 后端 DocsLocale 枚举只有 en / zh（zh-CN 在 API 层做映射） */
export type DocsLocale = "en" | "zh";

/** 文章作者（User join 出来的一小撮字段，不含敏感信息） */
export interface DocsAuthor {
  id: number;
  username: string;
  /** 头像 URL；未设置为 null，前端回落首字母圆形 */
  avatar: string | null;
}

/** 文章所属分类（面包屑用，可空） */
export interface DocsCategoryRef {
  id: number;
  name: string;
  englishName: string;
  parentId: number | null;
}

/** 内容区块：与后端 sections JSON 的多态结构保持一致 */
export type DocsContentBlock =
  | { type: "heading"; level: 2 | 3; text: string; id?: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; style: "disc" | "ordered"; items: string[] }
  | { type: "code"; language: string; code: string }
  | {
      type: "callout";
      variant: "info" | "success" | "warning";
      text: string;
    }
  | { type: "link"; text: string; href: string }
  | {
      type: "table";
      columns: { header: string; align?: "left" | "center" | "right" }[];
      rows: { cells: string[] }[];
      caption?: string;
    }
  | {
      type: "image" | "image-modal";
      config: {
        src: string;
        width: number;
        height: number;
        alt: string;
        modal?: boolean;
        videoSrc?: string;
      };
    }
  | {
      type: "collapsible";
      title: string;
      content: string;
      defaultExpanded?: boolean;
    }
  | {
      type: "download";
      config: {
        url: string;
        filename: string;
        size?: string;
        description?: string;
      };
    };

/** 文章分节 */
export interface DocsSection {
  /** 区块唯一标识（用于锚点定位） */
  id: string;
  title: string;
  blocks: DocsContentBlock[];
}

/** 列表项 / 详情基础体（ARTICLE_SELECT 的完整投影） */
export interface DocsArticle {
  id: number;
  /** 对外业务键，路由与 API 参数都用它 */
  uuid: string;
  type: DocsArticleType;
  title: string;
  description: string;
  /** 封面图 URL；未设置时为空字符串 */
  coverImage: string;
  sections: DocsSection[];
  categoryId: number | null;
  sortOrder: number;
  isHot: boolean;
  isFeatured: boolean;
  isVisible: boolean;
  /** 仅登录用户可见正文；匿名访问详情接口会拿到 401 */
  isLoginRequired: boolean;
  locale: DocsLocale;
  /** ISO 8601 字符串 */
  createdAt: string;
  /** ISO 8601 字符串 */
  updatedAt: string;
  author: DocsAuthor | null;
  category: DocsCategoryRef | null;
}

/**
 * 面包屑项
 *
 * 注意这是 `categoryService.getBreadcrumb()` 的真实返回：只有分类链的
 * `{ id, name, englishName }`，**没有 href**，所以前端不能当链接渲染。
 * 展示规则：英文站优先 englishName，中文站优先 name，空则回落另一个。
 */
export interface DocsBreadcrumb {
  id: number;
  name: string;
  englishName: string;
}

/** 同分类相邻文章 */
export interface DocsSiblings {
  prev: { uuid: string; title: string; type: DocsArticleType } | null;
  next: { uuid: string; title: string; type: DocsArticleType } | null;
}

/** 详情响应：在文章体之上补 breadcrumbs / siblings */
export interface DocsArticleDetail extends DocsArticle {
  breadcrumbs: DocsBreadcrumb[];
  siblings: DocsSiblings;
}

/** latest / search 的分页响应 */
export interface DocsLatestResult {
  items: DocsArticle[];
  total: number;
  limit: number;
  offset: number;
}

// ─────────────── 分类树（搜索框的【分类名】前缀用）───────────────

/**
 * 分类节点（`GET /docs/categories` 返回的树根数组）
 *
 * 搜索框用它做 `categoryId → 分类名` 的映射，给搜索结果标题加【分类】前缀。
 * 与 `DocsNavNode` 不同：这里带 `_count`，且不含文章列表，只是一棵纯分类树。
 */
export interface DocsCategoryNode {
  id: number;
  name: string;
  englishName: string;
  parentId: number | null;
  children: DocsCategoryNode[];
  _count: { articles: number };
}

// ─────────────── 分类树（/docs 索引页的数据源）───────────────

/**
 * 分类树上的文档叶子
 *
 * 与 `sidebar.service.ts` 的 `NavArticle` 一一对应。相比 `DocsArticle` 它是
 * 精简投影：只带索引页排序 / 角标 / 相对时间需要的字段，不含 description、
 * sections、coverImage 这些列表用不上的大字段。
 */
export interface DocsNavArticle {
  uuid: string;
  title: string;
  type: DocsArticleType;
  /** 同分类内排序权重，越小越靠前 */
  sortOrder: number;
  /** ISO 8601 字符串 */
  updatedAt: string;
  isHot: boolean;
  isFeatured: boolean;
  isLoginRequired: boolean;
}

/**
 * 分类树节点
 *
 * `GET /docs/sidebar/nav-tree` 直接返回**根分类数组**（不是 `{ groups }` 包装），
 * 且服务端已只收录 `type=DOCUMENTATION` 且 `isVisible` 的文档并剪掉空分类，
 * 前端无需再按 type 过滤。
 * 中英双名都在节点上，展示时按站点 locale 取：中文站 name，英文站 englishName。
 */
export interface DocsNavNode {
  id: number;
  name: string;
  englishName: string;
  parentId: number | null;
  /** 仅顶级分类有值，由服务端 ICON_MAP 按分类名匹配 */
  icon?: string;
  children: DocsNavNode[];
  articles: DocsNavArticle[];
}

// ─────────────── 文章反馈 ───────────────

/** 四档情绪，与详情页四个 SVG 图标一一对应 */
export type FeedbackKind =
  | "NOT_HELPFUL"
  | "CONFUSED"
  | "GOOD"
  | "EXCELLENT";

/**
 * 反馈状态 / 切换结果
 *
 * `kind` 为 null 表示当前用户未表态（或刚撤回）。后端 `(userId, articleId)`
 * 唯一：同 kind 再点视为撤回，异 kind 视为切换。
 */
export interface DocsFeedbackState {
  articleUuid: string;
  kind: FeedbackKind | null;
}

/**
 * 「我的动态」单条反馈
 *
 * 后端 `GET /docs/feedback/mine` 的 item：反馈侧给 kind + updatedAt（表态时间），
 * 文章侧只给渲染卡片够用的字段（不含 sections 正文）。
 * `type` 决定跳哪个详情页：DESIGN → /blog/[uuid]，DOCUMENTATION → /docs/[uuid]。
 */
export interface DocsMyFeedbackItem {
  articleUuid: string;
  title: string;
  description: string;
  coverImage: string;
  type: DocsArticleType;
  locale: DocsLocale;
  categoryName: string;
  categoryEnglishName: string;
  kind: FeedbackKind;
  /** ISO 时间戳（表态时间，不是文章更新时间） */
  updatedAt: string;
}

/** 「我的动态」分页结果 */
export interface DocsMyFeedbackResult {
  items: DocsMyFeedbackItem[];
  total: number;
  limit: number;
  offset: number;
}
