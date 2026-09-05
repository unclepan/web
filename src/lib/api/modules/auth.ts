/**
 * 用户认证 API 模块
 *
 * 注意：login 和 logout 走 Next.js Route Handler（/api/auth/*），
 * 由服务端管理 httpOnly refresh_token cookie。
 * 其余接口仍直连后端微服务（通过 next.config.ts rewrites 代理）。
 */
import { http } from "../client";
import type {
  LoginPayload,
  LoginResult,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "./auth.types";

export const authApi = {
  /**
   * 登录（走 Route Handler，自动设置双 Token cookie）
   *
   * 返回 { user }，accessToken / refreshToken 由响应头 Set-Cookie 自动写入浏览器
   */
  login: (data: LoginPayload) => http.post<LoginResult>("/auth/login", data),

  /** 登出（走 Route Handler，清除所有 auth cookie） */
  logout: () => http.post<string>("/auth/logout"),

  /** 提交注册（带滑块验证） */
  register: (data: RegisterPayload) => http.post<string>("/user/register", data),

  /** 激活账号 */
  activate: (token: string, email: string) =>
    http.get<string>(
      `/user/activate?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`,
    ),

  /** 忘记密码 — 发送重置邮件（带滑块验证） */
  forgotPassword: (data: ForgotPasswordPayload) =>
    http.post<string>("/user/forgot-password", data),

  /** 校验重置 Token 是否有效 */
  verifyResetToken: (token: string, email: string) =>
    http.get<string>(
      `/user/reset-password/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`,
    ),

  /** 提交新密码 */
  resetPassword: (data: ResetPasswordPayload) =>
    http.post<string>("/user/reset-password", data),
};
