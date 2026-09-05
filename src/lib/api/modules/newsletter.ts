/**
 * Newsletter 订阅 API 模块
 *
 * 两个接口都要求登录，未登录返回 401。
 *
 * status 请求统一带 `silentAuth`：Footer 在公开营销页也会渲染，
 * 若走默认的 401 处理，request() 会尝试 refresh，失败后把匿名访客
 * 直接重定向到 /signin，属于误伤。
 */
import { http } from "../client";
import type {
  SubscribePayload,
  SubscribeResult,
  SubscriptionStatus,
} from "./newsletter.types";

export const newsletterApi = {
  /** 查询当前登录用户的订阅状态 */
  status: () =>
    http.get<SubscriptionStatus>("/newsletter/subscription", {
      silentAuth: true,
    }),

  /** 订阅 newsletter（幂等，已订阅则更新邮箱） */
  subscribe: (payload: SubscribePayload) =>
    http.post<SubscribeResult>("/newsletter/subscribe", payload),
};
