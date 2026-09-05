/**
 * 问卷相关类型定义
 */

export interface WorkListItem {
  id: number;
  name: string;
  isPublish: boolean;
  isDelete: number; // 0=未删除, 1=回收站, 2=业务删除
  isStopped: boolean;
  starred: boolean;
  settings: Record<string, unknown> | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkTemplateListItem {
  id: number;
  name: string;
  usageCount: number;
  createUser?: { id: number; username: string };
  createdAt: string;
  updatedAt: string;
}

/** 模板详情（预览用，含问卷内容） */
export interface WorkTemplateDetail extends WorkTemplateListItem {
  desc?: string;
  content?: Record<string, unknown>;
}

/** 发布设置 */
export interface PublishSettings {
  requireLogin?: boolean;
  showProgress?: boolean;
  showPublicResults?: boolean;
  maxCount?: number;
  deadline?: number | string;
  [key: string]: unknown;
}

/** 问卷详情 */
export interface WorkDetail {
  id: number;
  name: string;
  desc?: string;
  content?: Record<string, unknown>;
  isPublish: boolean;
  isStopped: boolean;
  starred: boolean;
  settings: PublishSettings | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** 已发布问卷（答题页用） */
export interface PublishedWork {
  id: number;
  name: string;
  desc?: string;
  isPublish: boolean;
  isStopped: boolean;
  publishedContent?: Record<string, unknown>;
  settings?: PublishSettings;
  publishedAt: string | null;
}

/** 历史记录列表项 */
export interface WorkHistoryItem {
  id: number;
  workId: number;
  version?: number;
  isAuto: boolean;
  createdAt: string;
}

/** 历史记录详情 */
export interface WorkHistoryDetail {
  id: number;
  workId: number;
  name?: string;
  desc?: string;
  version?: number;
  content: Record<string, unknown>;
  isAuto: boolean;
  createdAt: string;
}

/** 保存问卷 payload */
export interface WorkSavePayload {
  id: number;
  name?: string;
  desc?: string;
  content: Record<string, unknown>;
  isAuto?: boolean;
}

/** 发布问卷 payload */
export interface WorkPublishPayload {
  settings?: PublishSettings;
}

/** 回滚 payload */
export interface WorkRollbackPayload {
  workId: number;
  historyId: number;
}
