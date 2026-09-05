/**
 * Answer（答卷）API 模块
 */
import { http } from "../client";
import type { AnswerAddPayload, AnswerListResult, AnswerItem, MyAnsweredResult, MyLatestAnswer } from "./answer.types";

export const answerApi = {
  /** 提交答卷（匿名或需登录，由问卷发布设置决定） */
  add: (data: AnswerAddPayload) =>
    http.post<AnswerItem>("/answer/add", data),

  /** 答卷列表（分页） */
  list: (workId: number, page: number = 1, size: number = 20) =>
    http.get<AnswerListResult>(
      `/answer/list?workId=${workId}&page=${page}&size=${size}`,
    ),

  /** 答卷总数 */
  count: (workId: number) =>
    http.get<number>(`/answer/count?workId=${workId}`),

  /** 单份答卷详情 */
  find: (id: number) => http.get<AnswerItem>(`/answer/find/${id}`),

  /** 当前用户已回答的问卷列表（按问卷聚合，分页） */
  myAnswered: (page: number = 1, size: number = 20) =>
    http.get<MyAnsweredResult>(
      `/answer/my-answered?page=${page}&size=${size}`,
    ),

  /**
   * 当前用户在某问卷的最新一份已提交答卷（含 content）
   * 用于答题页回显：登录用户回显已提交答案。
   * 静默鉴权：未登录/token 失效时只抛错，不跳登录页，由调用方降级到本地草稿。
   * 返回 null 表示该用户在该问卷暂无已提交答卷。
   */
  myLatest: (workId: number) =>
    http.get<MyLatestAnswer | null>(
      `/answer/my-latest?workId=${workId}`,
      { silentAuth: true },
    ),
};
