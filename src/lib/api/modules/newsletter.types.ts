/**
 * Newsletter 订阅相关类型定义
 */

/**
 * POST /newsletter/subscribe 请求体
 *
 * `companyWebsite` 为蜜罐字段，正常用户应保持空字符串。
 * 后端全局开启 forbidNonWhitelisted，字段缺失或多余都会 400。
 */
export interface SubscribePayload {
  email: string;
  companyWebsite: string;
}

/** POST /newsletter/subscribe 响应 data */
export interface SubscribeResult {
  /** true：此前已订阅（本次为幂等更新）；false：首次订阅 */
  alreadySubscribed: boolean;
  /** 订阅记录的 createdAt（ISO 字符串） */
  subscribedAt: string;
}

/** GET /newsletter/subscription 响应 data */
export interface SubscriptionStatus {
  /** 是否已订阅 */
  subscribed: boolean;
  /** 订阅时点的邮箱快照，未订阅为 null */
  email: string | null;
}
