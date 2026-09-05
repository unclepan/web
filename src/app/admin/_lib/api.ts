/**
 * 后台管理接口层
 *
 * 全部接口都要求 SYSTEM_ADMIN（后端 RoleGuard 强制），前端只做路由级提示。
 *
 * 复用项目已有的 request 封装（自动带 token、401 自动 refresh 重试），
 * 不另起炉灶；这里只负责拼路径和过滤空参数。
 *
 * ⚠️ 后端全局开了 forbidNonWhitelisted：多传一个未声明字段直接 400。
 *    所以所有 query 都要经过 buildQuery 过滤空值。
 */

import { http, request } from '@/lib/api/client';
import type {
  AdminAnswerDetail,
  AdminAnswerListResult,
  AdminArticle,
  AdminArticleListResult,
  AdminCategory,
  AdminContact,
  AdminContactListResult,
  AdminFeedbackStats,
  AdminIssueListResult,
  AdminOverview,
  AdminRanking,
  AdminSubscriberListResult,
  AdminTrend,
  AdminUser,
  AdminUserDetail,
  AdminUserListResult,
  AdminWork,
  AdminWorkListResult,
  ArticleFlagsPatch,
  ArticleUpsertPayload,
  DigestRunResult,
  SystemHealth,
} from './types';

/**
 * 拼查询串：跳过 undefined / null / 空串，避免把 "undefined" 发给后端触发 400
 *
 * 泛型而不是 Record<string, …>：具体 query 接口（如 UserListQuery）没有索引签名，
 * 用 Record 会报「Index signature is missing」。
 */
function buildQuery<T extends object>(params: T): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

// ═══════════════════════════════════════════════════════════
// 聚合统计（apps/admin）
// ═══════════════════════════════════════════════════════════

export const adminStatsApi = {
  overview: () => http.get<AdminOverview>('/admin/stats/overview'),

  trend: (days = 7) =>
    http.get<AdminTrend>(`/admin/stats/trend${buildQuery({ days })}`),

  ranking: (limit = 10) =>
    http.get<AdminRanking>(`/admin/stats/ranking${buildQuery({ limit })}`),

  userDetail: (id: number) => http.get<AdminUserDetail>(`/admin/users/${id}`),
};

// ═══════════════════════════════════════════════════════════
// 用户管理（apps/user）
// ═══════════════════════════════════════════════════════════

export interface UserListQuery {
  page?: number;
  pageSize?: number;
  q?: string;
  role?: string;
  isBlacklisted?: string;
  adminApplyStatus?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  order?: string;
}

export const adminUserApi = {
  list: (params: UserListQuery = {}) =>
    http.get<AdminUserListResult>(`/user/list${buildQuery(params)}`),

  /** 后端禁止设为 SYSTEM_ADMIN，只能 REGULAR / ADMIN */
  setRole: (id: number, role: string) =>
    http.post<unknown>(`/user/${id}/set-role`, { role }),

  /** 翻转式：无法保证幂等，调用前必须先拿到最新状态 */
  toggleBlacklist: (id: number) => http.post<unknown>(`/user/${id}/blacklist`),

  reviewApply: (id: number, status: 'APPROVED' | 'REJECTED') =>
    http.post<unknown>(`/user/${id}/review-apply`, { status }),
};

// ═══════════════════════════════════════════════════════════
// 问卷管理（apps/work）
// ═══════════════════════════════════════════════════════════

export interface WorkListQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
  scope?: string;
  createUserId?: string;
  sortBy?: string;
  order?: string;
}

export const adminWorkApi = {
  list: (params: WorkListQuery = {}) =>
    http.get<AdminWorkListResult>(`/work/admin/list${buildQuery(params)}`),

  /** 复用业务接口：跨用户权限由后端 SYSTEM_ADMIN 分支放行 */
  stop: (id: number) => http.post<unknown>(`/work/stop/${id}`),
  resume: (id: number) => http.post<unknown>(`/work/resume/${id}`),
  toggleStar: (id: number) => http.post<unknown>(`/work/star/${id}`),
  trash: (id: number) => http.delete<unknown>(`/work/delete/${id}`),
  restore: (id: number) => http.post<unknown>(`/work/restore/${id}`),
  deletePermanently: (id: number) =>
    http.delete<unknown>(`/work/delete-permanently/${id}`),
};

// ═══════════════════════════════════════════════════════════
// 答卷管理（apps/answer）
// ═══════════════════════════════════════════════════════════

export interface AnswerListQuery {
  page?: number;
  size?: number;
  workId?: string;
  answererId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  order?: string;
}

export const adminAnswerApi = {
  list: (params: AnswerListQuery = {}) =>
    http.get<AdminAnswerListResult>(`/answer/admin/list${buildQuery(params)}`),

  /**
   * 单条详情（含 content 正文）
   *
   * 列表接口刻意不返回 content —— 一页 20 条答卷的正文会把响应撑到几 MB。
   * 详情走业务接口 /answer/find/:id，SYSTEM_ADMIN 可读任意答卷。
   */
  find: (id: number) => http.get<AdminAnswerDetail>(`/answer/find/${id}`),

  delete: (id: number) => http.delete<unknown>(`/answer/admin/${id}`),
};

// ═══════════════════════════════════════════════════════════
// 内容管理（apps/docs）
// ═══════════════════════════════════════════════════════════

export interface ArticleListQuery {
  page?: number;
  pageSize?: number;
  type?: string;
  filter?: string;
  q?: string;
}

export const adminArticleApi = {
  list: (params: ArticleListQuery = {}) =>
    http.get<AdminArticleListResult>(
      `/docs/articles/admin${buildQuery(params)}`,
    ),

  detail: (id: number) => http.get<AdminArticle>(`/docs/articles/admin/${id}`),

  /**
   * 按 uuid 取详情（含 sections 正文）
   *
   * 不能复用公开接口 `/docs/articles/:uuid`：那条对 isVisible=false 直接 404，
   * 而后台要编辑未发布的文章。
   */
  detailByUuid: (uuid: string) =>
    http.get<AdminArticle>(`/docs/articles/admin/uuid/${encodeURIComponent(uuid)}`),

  upsert: (payload: ArticleUpsertPayload) =>
    http.post<AdminArticle>('/docs/articles/admin', payload),

  patchFlags: (id: number, patch: ArticleFlagsPatch) =>
    request<AdminArticle>(`/docs/articles/admin/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    }),
};

export const adminCategoryApi = {
  tree: () => http.get<AdminCategory[]>('/docs/categories'),

  create: (payload: { name: string; englishName?: string; parentId?: number | null }) =>
    http.post<AdminCategory>('/docs/categories', payload),

  update: (
    id: number,
    payload: { name?: string; englishName?: string; parentId?: number | null },
  ) => http.put<AdminCategory>(`/docs/categories/${id}`, payload),

  remove: (id: number, strategy: 'orphan' | 'cascade' = 'orphan') =>
    http.delete<unknown>(`/docs/categories/${id}?strategy=${strategy}`),
};

export const adminFeedbackApi = {
  stats: (limit = 10) =>
    http.get<AdminFeedbackStats>(
      `/docs/feedback/admin/stats${buildQuery({ limit })}`,
    ),
};

// ═══════════════════════════════════════════════════════════
// 留言管理（apps/contact）
// ═══════════════════════════════════════════════════════════

export interface ContactListQuery {
  page?: number;
  pageSize?: number;
  filter?: string;
  q?: string;
}

export const adminContactApi = {
  list: (params: ContactListQuery = {}) =>
    http.get<AdminContactListResult>(`/contact/admin${buildQuery(params)}`),

  markRead: (id: number) =>
    request<AdminContact>(`/contact/admin/${id}/read`, { method: 'PATCH' }),

  remove: (id: number) => http.delete<unknown>(`/contact/admin/${id}`),
};

// ═══════════════════════════════════════════════════════════
// 图片上传（apps/docs，SYSTEM_ADMIN）
// ═══════════════════════════════════════════════════════════

export const adminUploadApi = {
  /**
   * 上传图片到 COS
   *
   * 后端 `POST /docs/upload/cos` 的字段名是 **file**（不是 image），
   * 返回 `{ url }`。Editor.js 图片插件要的是 `{ success:1, file:{url} }`，
   * 格式转换在 _lib/editor/uploader.ts 里做 —— 后端契约不动。
   */
  image: (file: Blob) => {
    const form = new FormData();
    // Editor.js 插件传的是 Blob（粘贴/拖拽时没有名字），multer 需要 filename，
    // 缺了会导致后端拿到空文件名，这里补一个兜底
    form.append('file', file, (file as File).name || 'image');
    return http.post<{ url: string }>('/docs/upload/cos', form);
  },
};

// ═══════════════════════════════════════════════════════════
// 订阅管理（apps/newsletter）
// ═══════════════════════════════════════════════════════════

export const adminNewsletterApi = {
  subscribers: (params: { page?: number; pageSize?: number; q?: string } = {}) =>
    http.get<AdminSubscriberListResult>(
      `/newsletter/admin/subscribers${buildQuery(params)}`,
    ),

  issues: (params: { page?: number; pageSize?: number } = {}) =>
    http.get<AdminIssueListResult>(
      `/newsletter/admin/issues${buildQuery(params)}`,
    ),

  runDigest: () => http.post<DigestRunResult>('/newsletter/digest/run'),
};

// ═══════════════════════════════════════════════════════════
// 系统健康（网关）
// ═══════════════════════════════════════════════════════════

export const adminSystemApi = {
  health: () => http.get<SystemHealth>('/health'),
};

// 方便页面按需整体引入
export type { AdminContact, AdminUser, AdminWork };
