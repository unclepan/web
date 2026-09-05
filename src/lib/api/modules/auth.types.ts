/**
 * 用户认证相关类型定义
 */
import type { UserProfile } from "./user.types";

/**
 * 登录结果（Route Handler /api/auth/login 返回值）
 *
 * 注意：accessToken 和 refreshToken 由 Route Handler 通过 Set-Cookie 写入，
 * 前端 JS 拿不到，所以响应体只包含 user。
 */
export interface LoginResult {
  user: UserProfile;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  agree: boolean;
  captchaVerifyParam: string;
}

export interface ForgotPasswordPayload {
  email: string;
  captchaVerifyParam: string;
}

export interface ResetPasswordPayload {
  token: string;
  email: string;
  newPassword: string;
}

export interface LoginPayload {
  username: string;
  password: string;
  captchaVerifyParam: string;
}
