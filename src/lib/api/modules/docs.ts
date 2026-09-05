/**
 * docs 服务 API 模块
 *
 * 全部为公开只读接口（网关前缀 /docs → docs 服务）。
 * 统一带 `silentAuth`：这些接口本身不需要登录，但首页 / 详情页都是公开
 * 页面，一旦后端因任何原因回了 401，绝不能让 `request()` 走默认的
 * refresh → 失败 → `window.location.href='/signin'`，把访客弹到登录页。
 *
 * locale 映射：站点语言 `zh-CN` 对应后端 `DocsLocale.zh`。
 * 首页只取 `DESIGN`（原 designs 表内容）。
 */
import { http } from "../client";
import type { Locale } from "@/i18n/types";
import type {
  DocsArticle,
  DocsArticleDetail,
  DocsArticleType,
  DocsCategoryNode,
  DocsFeedbackState,
  DocsLatestResult,
  DocsLocale,
  DocsMyFeedbackResult,
  DocsNavNode,
  FeedbackKind,
} from "./docs.types";

/** 站点语言 → 后端 DocsLocale */
const LOCALE_MAP: Record<Locale, DocsLocale> = {
  en: "en",
  "zh-CN": "zh",
};

function toDocsLocale(locale: Locale): DocsLocale {
  return LOCALE_MAP[locale] ?? "en";
}

/** 拼查询串（跳过 undefined，保证不把 "undefined" 发给后端） */
function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const docsApi = {
  /** 热门文章（首页侧栏 Popular） */
  hot: (type: DocsArticleType, locale: Locale, limit = 5) =>
    http.get<DocsArticle[]>(
      `/docs/articles/hot${buildQuery({ type, locale: toDocsLocale(locale), limit })}`,
      { silentAuth: true },
    ),

  /** 推荐文章（首页 Featured 四卡；0 条时整段不渲染） */
  featured: (type: DocsArticleType, locale: Locale, limit = 4) =>
    http.get<DocsArticle[]>(
      `/docs/articles/featured${buildQuery({ type, locale: toDocsLocale(locale), limit })}`,
      { silentAuth: true },
    ),

  /** 最新文章（首页 Latest，游标分页；total 用于精确判断 hasMore） */
  latest: (
    type: DocsArticleType,
    locale: Locale,
    limit = 6,
    offset = 0,
  ) =>
    http.get<DocsLatestResult>(
      `/docs/articles/latest${buildQuery({ type, locale: toDocsLocale(locale), limit, offset })}`,
      { silentAuth: true },
    ),

  /**
   * 关键字搜索（搜索框用）：标题 / 描述 contains 匹配
   *
   * 返回 `{ items, total, limit, offset }`，搜索框只取 `items` 的前几条。
   * 注意 `q` 是 DTO 必填（MinLength 1），空串会被后端拒成 400 —— 调用方
   * 在防抖里已保证非空才调用。
   */
  search: (
    q: string,
    type: DocsArticleType,
    locale: Locale,
    limit = 3,
    offset = 0,
  ) =>
    http.get<DocsLatestResult>(
      `/docs/articles/search${buildQuery({ q, type, locale: toDocsLocale(locale), limit, offset })}`,
      { silentAuth: true },
    ),

  /**
   * 分类树（搜索框的【分类名】前缀用）
   *
   * 返回根分类数组，节点带 id / name / englishName / parentId / children /
   * _count。搜索框把它拍平成 `categoryId → 分类名` 的映射。
   */
  categories: () =>
    http.get<DocsCategoryNode[]>(`/docs/categories`, { silentAuth: true }),

  /** 文章详情；匿名访问 `isLoginRequired` 文章会抛 ApiError(401) */
  detail: (uuid: string, locale: Locale) =>
    http.get<DocsArticleDetail>(
      `/docs/articles/${encodeURIComponent(uuid)}${buildQuery({ locale: toDocsLocale(locale) })}`,
      { silentAuth: true },
    ),

  /**
   * 分类导航树（/docs 索引页的数据源）
   *
   * 服务端已按 `type=DOCUMENTATION && isVisible` 过滤并剪掉空分类，所以这条
   * 接口天然就是「文档站」的目录兼列表，前端不必再筛。
   * 返回根分类数组（不是 `{ groups }` 包装），叶子带 sortOrder / updatedAt /
   * isHot / isFeatured / isLoginRequired —— 索引页靠它们排序、打角标、显示
   * 相对时间，因此不用再打一次列表接口。
   */
  navTree: (locale: Locale) =>
    http.get<DocsNavNode[]>(
      `/docs/sidebar/nav-tree${buildQuery({ locale: toDocsLocale(locale) })}`,
      { silentAuth: true },
    ),

  /** 相关文章：同分类优先，不足时用最新补齐 */
  related: (uuid: string, locale: Locale, limit = 2) =>
    http.get<DocsArticle[]>(
      `/docs/articles/${encodeURIComponent(uuid)}/related${buildQuery({ locale: toDocsLocale(locale), limit })}`,
      { silentAuth: true },
    ),

  // ─────────────── 反馈（均需登录）───────────────

  /**
   * 查询当前用户对某文章的反馈状态
   *
   * 接口要求登录，但组件挂在公开详情页上 —— 调用方应先用 `isLoggedIn()`
   * 拦一道，这里再叠 `silentAuth` 双保险，避免匿名访客被弹到 /signin。
   */
  feedbackStatus: (articleUuid: string) =>
    http.get<DocsFeedbackState>(
      `/docs/feedback${buildQuery({ articleUuid })}`,
      { silentAuth: true },
    ),

  /**
   * 切换反馈：同 kind 再点 → 撤回；异 kind → 切换；无记录 → 创建
   *
   * 后端 `forbidNonWhitelisted`，body 只能是 `{ articleUuid, kind }` 两个字段。
   */
  toggleFeedback: (articleUuid: string, kind: FeedbackKind) =>
    http.post<DocsFeedbackState>("/docs/feedback", { articleUuid, kind }),

  /**
   * 我的反馈列表（个人中心「我的动态」）
   *
   * 与上面两条不同：这里**不加** `silentAuth` —— 接口本来就要求登录，
   * 调用方（/profile）已先拦过未登录，401 时正常走 refresh 才是对的。
   *
   * `locale` 传站点语言：后端按它过滤文章，避免列表里出现点进去会因
   * 语言不匹配而 404 的条目（详情接口按 uuid + locale 取）。
   * 后端 `forbidNonWhitelisted`，query 只能有 type / locale / limit / offset。
   */
  myFeedbacks: (locale: Locale, limit = 20, offset = 0) =>
    http.get<DocsMyFeedbackResult>(
      `/docs/feedback/mine${buildQuery({ locale: toDocsLocale(locale), limit, offset })}`,
    ),
};
