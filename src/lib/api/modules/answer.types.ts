/**
 * Answer（答卷）相关类型定义
 */

/** 提交答卷 DTO */
export interface AnswerAddPayload {
  workId: number;
  content: Record<string, unknown>;
  duration?: number;
}

/** 答卷列表项 */
export interface AnswerItem {
  id: number;
  content: Record<string, unknown>;
  score: number;
  duration: number;
  userAgent: string | null;
  ip: string | null;
  answererId: number | null;
  answerer: { id: number; username: string } | null;
  workId: number;
  work: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
}

/** 分页列表结果 */
export interface AnswerListResult {
  list: AnswerItem[];
  total: number;
  page: number;
  size: number;
}

/** 我的已回答问卷列表项（按问卷聚合，每条问卷保留最近一次作答信息） */
export interface MyAnsweredItem {
  workId: number;
  workName: string;
  isPublish: boolean;
  isStopped: boolean;
  latestAnswerId: number;
  answeredAt: string;
  score: number;
  duration: number;
  answerCount: number;
}

/** 我的已回答问卷分页结果 */
export interface MyAnsweredResult {
  list: MyAnsweredItem[];
  total: number;
  page: number;
  size: number;
}

/** 当前用户在某问卷的最新一份已提交答卷（用于答题页回显） */
export interface MyLatestAnswer {
  id: number;
  /** 各题答案，key = feUuid，value = AnswerValue */
  content: Record<string, unknown>;
  duration: number;
  createdAt: string;
}
