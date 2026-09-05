/**
 * API 客户端核心：统一封装 fetch 请求
 *
 * 功能：
 * 1. 自动从 cookie 读取 access_token，附加 Authorization: Bearer 头
 * 2. 401 响应时自动调用 refresh 接口续期，成功后重试原请求
 * 3. 多个并发 401 请求自动合并为一次刷新（避免 token 浪费）
 */

import { getAccessToken } from '@/lib/auth/token';

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public code: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const BASE_URL = '/api';

// ========== Refresh 拦截器：401 → 刷新 → 重试 ==========

/** 正在进行的 refresh Promise（null 表示没有正在刷新） */
let refreshPromise: Promise<RefreshResult> | null = null;

/**
 * 刷新结果三态 —— 必须区分「确实要重新登录」和「瞬时故障」：
 * - ok：续期成功
 * - unauthorized：refresh_token 缺失/失效，确实需要重新登录
 * - error：网络异常或服务端 5xx 等**瞬时**故障，登录态可能仍然有效，
 *          绝不能当成「需重新登录」去清 token / 跳登录页
 *
 * 早期这里只有 true/false，把 5xx 和 401 混为一谈，导致一次后端抖动
 * 就把用户踢到 /signin 并清空登录态。
 */
type RefreshResult = 'ok' | 'unauthorized' | 'error';

async function tryRefresh(): Promise<RefreshResult> {
  let resp: Response;
  try {
    resp = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    // 网络层失败：瞬时问题，不是鉴权失效
    return 'error';
  }

  if (resp.ok) return 'ok';

  // 只有 401 才代表「refresh_token 没了/失效」→ 确实要重新登录
  if (resp.status === 401) return 'unauthorized';

  // 5xx 等服务端瞬时错误：保留登录态，后续请求/刷新会重试续期
  return 'error';
}

// ========== 核心请求函数 ==========

/** 额外请求选项（不影响 fetch 本身，仅控制客户端行为） */
export interface RequestExtras {
  /**
   * 静默鉴权：遇到 401 时不刷新 token、不跳转登录页，直接抛 ApiError(401)。
   * 适用于"尽力而为"的请求（如答题页回显），失败时由调用方降级处理。
   */
  silentAuth?: boolean;
}

export async function request<T = unknown>(
  path: string,
  options: RequestInit = {},
  extras: RequestExtras = {},
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = isFormData
    ? {}
    : { 'Content-Type': 'application/json' };

  // 合并传入的 headers
  if (options.headers) {
    const headerObj =
      options.headers instanceof Headers
        ? Object.fromEntries(options.headers.entries())
        : Array.isArray(options.headers)
          ? Object.fromEntries(options.headers)
          : (options.headers as Record<string, string>);
    Object.assign(headers, headerObj);
  }

  // 自动附加 JWT access_token（从 JS 可读的 cookie 中读取）
  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const resp = await fetch(url, {
    ...options,
    headers,
  });

  const data: ApiResponse<T> = await resp.json();

  // 401 → 尝试刷新 token 后重试（仅对业务请求触发，排除 /user/login 等）
  if (
    data.code === 401 &&
    resp.status === 401 &&
    !path.startsWith('/auth/') && // 不对自身 auth 路由做 refresh 循环
    !path.startsWith('/user/login')
  ) {
    // 静默鉴权：不刷新、不跳转，直接抛错交给调用方降级
    if (extras.silentAuth) {
      throw new ApiError('未登录', 401);
    }

    // 并发合并：如果已经在刷新中，复用同一个 Promise
    if (!refreshPromise) {
      refreshPromise = tryRefresh().finally(() => {
        refreshPromise = null;
      });
    }

    const refreshed = await refreshPromise;

    if (refreshed === 'ok') {
      // 刷新成功：用新 access_token 重试原请求一次
      const newToken = getAccessToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
      }
      const retryResp = await fetch(url, {
        ...options,
        headers,
      });
      const retryData: ApiResponse<T> = await retryResp.json();
      if (retryData.code !== 200 && retryResp.status >= 400) {
        throw new ApiError(
          typeof retryData.data === 'string'
            ? retryData.data
            : retryData.message || '请求失败',
          retryData.code || retryResp.status,
        );
      }
      return retryData.data;
    }

    if (refreshed === 'unauthorized') {
      // 确认登录已失效 → 跳转登录页（带 callbackUrl，登录后回跳原页面）
      const callback = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/signin?callbackUrl=${callback}`;
      throw new ApiError('登录已过期，请重新登录', 401);
    }

    // refreshed === 'error'：刷新接口自身瞬时故障（网络/5xx）。
    // 这不是鉴权失效 —— 不清 token、不跳登录页，抛一个非 401 的错误让调用方降级，
    // 下次请求或刷新页面会重新走续期，接口恢复后即可自愈。
    throw new ApiError(
      typeof data.data === 'string' ? data.data : '登录态续期失败，请稍后重试',
      0,
    );
  }

  // 非 401 的错误正常抛出
  if (data.code !== 200 && resp.status >= 400) {
    throw new ApiError(
      typeof data.data === 'string' ? data.data : data.message || '请求失败',
      data.code || resp.status,
    );
  }

  return data.data;
}

/** 通用 HTTP 方法封装 */
export const http = {
  get<T = unknown>(path: string, extras?: RequestExtras): Promise<T> {
    return request<T>(path, { method: 'GET' }, extras);
  },

  post<T = unknown>(path: string, body?: unknown, extras?: RequestExtras): Promise<T> {
    const isFormData = body instanceof FormData;
    return request<T>(
      path,
      {
        method: 'POST',
        body: isFormData ? (body as BodyInit) : body ? JSON.stringify(body) : undefined,
        headers: isFormData ? {} : undefined,
      },
      extras,
    );
  },

  put<T = unknown>(path: string, body?: unknown, extras?: RequestExtras): Promise<T> {
    return request<T>(
      path,
      {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      },
      extras,
    );
  },

  delete<T = unknown>(path: string, extras?: RequestExtras): Promise<T> {
    return request<T>(path, { method: 'DELETE' }, extras);
  },
};
