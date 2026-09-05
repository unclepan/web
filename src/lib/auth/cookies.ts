/**
 * 认证 Cookie 名称常量（客户端 + 服务端共用）
 *
 * - access_token：JS 可读 cookie，存放短期 Access Token（JWT 30min）。
 *   前端读取后放入 Authorization: Bearer 头。
 *   cookie maxAge 设为 7d（与 refresh 对齐），仅用「存在性」判断是否已登录；
 *   JWT 本身 30min 过期，过期后由拦截器自动刷新。
 *
 * - refresh_token：httpOnly cookie，存放长期 Refresh Token（JWT 7d）。
 *   JS 无法读取，XSS 偷不到。仅由 Route Handler / middleware 服务端访问。
 */

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';
