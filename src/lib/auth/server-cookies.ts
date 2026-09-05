/**
 * 服务端专用：Auth Cookie 管理 + 后端地址
 *
 * 仅在 Next.js Route Handler / middleware 中使用，不可被客户端组件导入。
 */
import type { NextResponse } from 'next/server';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from './cookies';

const isProd = process.env.NODE_ENV === 'production';

/** Cookie maxAge：7 天（秒），与 refresh_token JWT 过期时间对齐 */
const MAX_AGE = 7 * 24 * 60 * 60;

const baseOptions: { path: string; sameSite: 'lax'; secure: boolean; maxAge: number } = {
  path: '/',
  sameSite: 'lax',
  secure: isProd,
  maxAge: MAX_AGE,
};

/**
 * 后端网关地址（与 next.config.ts rewrites 保持一致）
 * - 本地开发：http://localhost:8001
 * - Docker 生产：http://host.docker.internal:8001
 */
export const BACKEND_URL =
  process.env.BACKEND_URL ??
  (process.env.NODE_ENV === 'production'
    ? 'http://host.docker.internal:8001'
    : 'http://localhost:8001');

/** 在响应上设置 access_token + refresh_token 两个 cookie */
export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
): void {
  // access_token：JS 可读（前端需读取后放入 Authorization 头）
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    ...baseOptions,
    httpOnly: false,
  });
  // refresh_token：httpOnly（JS 不可读，防 XSS 偷取）
  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...baseOptions,
    httpOnly: true,
  });
}

/** 清除两个 auth cookie（登出 / refresh 失败时调用） */
export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, '', {
    path: '/',
    maxAge: 0,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, '', {
    path: '/',
    httpOnly: true,
    maxAge: 0,
  });
}
