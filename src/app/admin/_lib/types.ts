/**
 * 后台管理（admin）类型定义
 *
 * 只描述「后台用到的」字段。后端返回体可能更宽，这里按最小可用原则声明，
 * 新增页面时按需补充即可。
 *
 * 注意：各服务分页返回形状不统一（users / list / items），
 * 所以每个模块各用各的类型，不要抽象成同一个泛型。
 */

// ═══════════════════════════════════════════════════════════
// 角色 / 状态枚举
// ═══════════════════════════════════════════════════════════

export type UserRole = 'REGULAR' | 'ADMIN' | 'SYSTEM_ADMIN';
export type AdminApplyStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type ArticleType = 'DOCUMENTATION' | 'DESIGN';
export type DocsLocale = 'en' | 'zh';
export type FeedbackKind = 'NOT_HELPFUL' | 'CONFUSED' | 'GOOD' | 'EXCELLENT';

// ═══════════════════════════════════════════════════════════
// 聚合统计（apps/admin）
// ═══════════════════════════════════════════════════════════

export interface AdminOverview {
  users: {
    total: number;
    today: number;
    week: number;
    regular: number;
    admin: number;
    systemAdmin: number;
    blacklisted: number;
    pendingApply: number;
  };
  works: {
    total: number;
    published: number;
    draft: number;
    stopped: number;
    trashed: number;
    today: number;
  };
  answers: { total: number; today: number; week: number };
  articles: {
    total: number;
    visible: number;
    featured: number;
    hot: number;
    documentation: number;
    design: number;
  };
  contacts: { total: number; unread: number };
  newsletters: { total: number };
  generatedAt: string;
}

export interface AdminTrendItem {
  /** YYYY-MM-DD（Asia/Shanghai） */
  date: string;
  answers: number;
  users: number;
}

export interface AdminTrend {
  days: number;
  items: AdminTrendItem[];
}

export interface AdminRanking {
  topWorks: Array<{
    id: number;
    name: string;
    answerCount: number;
    authorId: number;
    authorName: string;
  }>;
  topCreators: Array<{
    id: number;
    username: string;
    avatar: string | null;
    workCount: number;
  }>;
}

export interface AdminUserDetail {
  user: {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    isBlacklisted: boolean;
    adminApplyStatus: AdminApplyStatus;
    avatar: string | null;
    createdAt: string;
    updatedAt: string;
  };
  stats: {
    workCount: number;
    answerCount: number;
    articleCount: number;
    contactCount: number;
  };
  /** null 表示未订阅 */
  subscription: { email: string; createdAt: string } | null;
}

// ═══════════════════════════════════════════════════════════
// 用户管理（apps/user）
// ═══════════════════════════════════════════════════════════

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  isBlacklisted: boolean;
  adminApplyStatus: AdminApplyStatus;
  avatar: string | null;
  createdAt: string;
}

export interface AdminUserListResult {
  users: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
}

// ═══════════════════════════════════════════════════════════
// 问卷管理（apps/work）
// ═══════════════════════════════════════════════════════════

export interface AdminWorkAuthor {
  id: number;
  username: string;
  avatar: string | null;
}

export interface AdminWork {
  id: number;
  name: string;
  desc: string | null;
  isPublish: boolean;
  isDelete: number;
  isStopped: boolean;
  starred: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createUser: AdminWorkAuthor;
  _count: { answers: number };
}

export interface AdminWorkListResult {
  items: AdminWork[];
  total: number;
  page: number;
  pageSize: number;
}

// ═══════════════════════════════════════════════════════════
// 答卷管理（apps/answer）
// ═══════════════════════════════════════════════════════════

export interface AdminAnswer {
  id: number;
  score: number;
  duration: number;
  createdAt: string;
  ip: string | null;
  userAgent: string | null;
  work: {
    id: number;
    name: string;
    isDelete: number;
    createUserId: number;
  };
  /** 匿名答卷为 null */
  answerer: { id: number; username: string; avatar: string | null } | null;
}

export interface AdminAnswerListResult {
  list: AdminAnswer[];
  total: number;
  page: number;
  /** 注意：answer 服务用 size 而不是 pageSize */
  size: number;
}

/** 单条答卷详情（/answer/find/:id），比列表多一个 content */
export interface AdminAnswerDetail extends AdminAnswer {
  content: unknown;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════
// 内容管理（apps/docs）
// ═══════════════════════════════════════════════════════════

export interface AdminArticle {
  id: number;
  uuid: string;
  type: ArticleType;
  title: string;
  description: string;
  coverImage: string;
  /** 后台列表接口刻意不返回 sections（正文太大），只有 adminDetail 才带 */
  sections?: unknown;
  categoryId: number | null;
  sortOrder: number;
  isHot: boolean;
  isFeatured: boolean;
  isVisible: boolean;
  isLoginRequired: boolean;
  locale: DocsLocale;
  createdAt: string;
  updatedAt: string;
  author: { id: number; username: string; avatar: string | null };
  category: {
    id: number;
    name: string;
    englishName: string;
    parentId: number | null;
  } | null;
}

export interface AdminArticleListResult {
  items: AdminArticle[];
  total: number;
  page: number;
  pageSize: number;
}

/** PATCH /docs/articles/admin/:id —— 只有四个开关 */
export interface ArticleFlagsPatch {
  isHot?: boolean;
  isFeatured?: boolean;
  isVisible?: boolean;
  isLoginRequired?: boolean;
}

/**
 * POST /docs/articles/admin —— 新建/更新文章
 *
 * `sections` 是正文。后端约定：**不传就保留原正文**（见 article.service.ts），
 * 所以元数据弹窗不传它是安全的；正文编辑器必须传。
 */
export interface ArticleUpsertPayload {
  uuid?: string;
  type: ArticleType;
  locale: DocsLocale;
  title: string;
  description: string;
  sections?: unknown[];
  coverImage?: string;
  categoryId?: number;
  sortOrder?: number;
  isHot?: boolean;
  isFeatured?: boolean;
  isVisible?: boolean;
  isLoginRequired?: boolean;
}

export interface AdminCategory {
  id: number;
  uuid: string;
  name: string;
  englishName: string;
  parentId: number | null;
  children?: AdminCategory[];
  _count?: { articles: number };
}

export interface AdminFeedbackStats {
  total: number;
  distribution: Record<FeedbackKind, number>;
  articles: Array<{
    id: number;
    uuid: string;
    title: string;
    type: ArticleType;
    NOT_HELPFUL: number;
    CONFUSED: number;
    GOOD: number;
    EXCELLENT: number;
    total: number;
  }>;
}

// ═══════════════════════════════════════════════════════════
// 留言管理（apps/contact）
// ═══════════════════════════════════════════════════════════

export interface AdminContact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  country: string | null;
  message: string | null;
  isRead: boolean;
  ipHash: string;
  userAgent: string | null;
  userId: number | null;
  createdAt: string;
}

export interface AdminContactListResult {
  items: AdminContact[];
  total: number;
  page: number;
  pageSize: number;
}

// ═══════════════════════════════════════════════════════════
// 订阅管理（apps/newsletter）
// ═══════════════════════════════════════════════════════════

export interface AdminSubscriber {
  id: number;
  email: string;
  createdAt: string;
  user: { id: number; username: string; avatar: string | null };
}

export interface AdminSubscriberListResult {
  items: AdminSubscriber[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminNewsletterIssue {
  id: number;
  sentAt: string;
  articleIds: unknown;
  subscriberCount: number;
  status: string;
  createdAt: string;
}

export interface AdminIssueListResult {
  items: AdminNewsletterIssue[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DigestRunResult {
  skipped: boolean;
  reason?: string;
  articleCount: number;
  sentCount: number;
  failedCount: number;
}

// ═══════════════════════════════════════════════════════════
// 系统健康（网关 /health）
// ═══════════════════════════════════════════════════════════

export interface UpstreamHealth {
  name: string;
  target: string;
  ok: boolean;
  latency?: number;
  error?: string;
}

export interface SystemHealth {
  status: 'ok' | 'degraded';
  timestamp: string;
  upstreams: UpstreamHealth[];
}
