/**
 * Contact 留言相关类型定义
 */

/**
 * POST /contact 请求体
 *
 * `companyWebsite` 为蜜罐字段，正常用户应保持空字符串。
 * 后端全局开启 forbidNonWhitelisted，字段缺失或多余都会 400。
 */
export interface ContactSubmitPayload {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  /** 国家 token，传英文原值（如 "China"）；未选择时传 null */
  country: string | null;
  /** 未填写时传 null */
  message: string | null;
  companyWebsite: string;
}

/**
 * POST /contact 响应 data
 *
 * 后端只回显 id 与创建时间，不外泄 ipHash / userAgent。
 * 蜜罐命中时 id 为 0（静默成功的假记录，未落库），调用方无需区分。
 */
export interface ContactSubmitResult {
  id: number;
  /** ISO 字符串 */
  createdAt: string;
}
