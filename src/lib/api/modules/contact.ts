/**
 * Contact 留言 API 模块
 *
 * POST /contact 为公开接口，无需登录，因此不走 silentAuth（不存在
 * 匿名访客被 401 重定向到 /signin 的风险）。
 *
 * 429 由 http 封装抛 `ApiError(code)`，调用方据此提示「提交过于频繁」。
 * 蜜罐命中时后端返回同形状的假成功（id 为 0），前端按正常成功处理。
 */
import { http } from "../client";
import type {
  ContactSubmitPayload,
  ContactSubmitResult,
} from "./contact.types";

export const contactApi = {
  /** 提交留言（公开；受 IP 速率限制；蜜罐命中则静默成功不落库） */
  submit: (payload: ContactSubmitPayload) =>
    http.post<ContactSubmitResult>("/contact", payload),
};
