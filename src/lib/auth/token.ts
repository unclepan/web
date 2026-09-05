/**
 * Access Token 管理工具
 *
 * 统一通过 cookie 存取 access_token（JS 可读，短期 JWT）。
 *
 * 关于「如果本来就有别的 cookie 值」：
 * - 使用精确名称匹配（split + trim），不会误读其他 cookie。
 * - 即使域名下存在大量其他 cookie 也只取名为 access_token 的那一个。
 */

import { ACCESS_TOKEN_COOKIE } from './cookies';

/** 从 document.cookie 精确读取指定名称的 cookie 值（仅客户端可用） */
export function getAccessToken(): string | null {
  if (typeof document === 'undefined') return null;
  // 精确分割：按 ";" 切割 → 每个 key=value 做 trim → 找到 name 完全一致的项
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    // 用 startsWith 而非 indexOf/regex，确保精确前缀匹配
    if (trimmed.startsWith(ACCESS_TOKEN_COOKIE + '=')) {
      return trimmed.slice(ACCESS_TOKEN_COOKIE.length + 1);
    }
  }
  return null;
}

/** 写入 access_token 到 cookie（供登录 / refresh 成功后调用） */
export function setAccessToken(token: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${token}; path=/; max-age=${
    7 * 24 * 60 * 60
  }; SameSite=Lax`;
}

/** 清除 access_token cookie（登出时配合 Route Handler 清除 httpOnly 的 refresh_token） */
export function clearAccessToken(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * 快速判断是否已登录（仅检查 access_token cookie 是否存在）
 * 不解析 JWT、不校验过期时间 — 仅用于 UI 层面的显示控制。
 * 真正的鉴权由后端 Guard 完成。
 */
export function isLoggedIn(): boolean {
  return getAccessToken() !== null;
}

/**
 * 注意：`setAccessToken` 当前无调用方 —— 登录成功后 access_token
 * 由 Route Handler 在服务端写入 cookie（见 `app/api/auth/login/route.ts`）。
 * 保留它是因为在前端手动写入的场景下它是唯一入口，删除前请确认。
 */
