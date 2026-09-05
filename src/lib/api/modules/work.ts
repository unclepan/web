/**
 * Work（问卷）API 模块
 */
import { http } from "../client";
import type {
  WorkListItem,
  WorkDetail,
  PublishedWork,
  WorkHistoryItem,
  WorkHistoryDetail,
  WorkSavePayload,
  WorkPublishPayload,
  WorkRollbackPayload,
  WorkTemplateListItem,
  WorkTemplateDetail,
} from "./work.types";

export const workApi = {
  /** 创建问卷 */
  add: (name: string) => http.post<WorkDetail>("/work/add", { name }),

  /** 问卷列表 */
  list: (params?: {
    bin?: boolean;
    keyword?: string;
    status?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.bin) qs.set("bin", "true");
    if (params?.keyword) qs.set("keyword", params.keyword);
    if (params?.status) qs.set("status", params.status);
    const query = qs.toString();
    return http.get<WorkListItem[]>(`/work/list${query ? `?${query}` : ""}`);
  },

  /** 查找问卷（编辑器用） */
  find: (id: number) => http.get<WorkDetail>(`/work/find/${id}`),

  /** 保存（含 isAuto 参数写历史） */
  save: (data: WorkSavePayload) => http.post<WorkDetail>("/work/save", data),

  /** 发布 */
  publish: (id: number, data?: WorkPublishPayload) =>
    http.post<WorkDetail>(`/work/publish/${id}`, data ?? {}),

  /** 停止收集 */
  stop: (id: number) => http.post<WorkDetail>(`/work/stop/${id}`),

  /** 恢复收集 */
  resume: (id: number) => http.post<WorkDetail>(`/work/resume/${id}`),

  /** 移入回收站 */
  delete: (id: number) => http.delete<WorkDetail>(`/work/delete/${id}`),

  /** 彻底删除 */
  deletePermanently: (id: number) =>
    http.delete<WorkDetail>(`/work/delete-permanently/${id}`),

  /** 从回收站恢复 */
  restore: (id: number) => http.post<WorkDetail>(`/work/restore/${id}`),

  /** 复制问卷（可指定新名称，不传则按后端默认逻辑） */
  copy: (id: number, name?: string) =>
    http.post<WorkDetail>(`/work/copy/${id}`, name ? { name } : {}),

  /** 收藏 / 取消收藏 */
  toggleStar: (id: number) => http.post<WorkDetail>(`/work/star/${id}`),

  /** 历史记录列表 */
  history: (workId: number) =>
    http.get<WorkHistoryItem[]>(`/work/history/${workId}`),

  /** 历史记录详情 */
  historyDetail: (historyId: number) =>
    http.get<WorkHistoryDetail>(`/work/history-detail/${historyId}`),

  /** 回滚到历史版本 */
  rollback: (data: WorkRollbackPayload) =>
    http.post<WorkDetail>("/work/rollback", data),

  /** 获取已发布内容（答题页用，无需登录） */
  findPublished: (id: number) =>
    http.get<PublishedWork>(`/work/published/${id}`),

  /** 上传题目图片（图片选择题选项等，上传到 COS，返回 CDN URL） */
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return http.post<{ url: string }>("/work/upload-image", formData);
  },

  /** 模板列表 */
  templateList: () => http.get<WorkTemplateListItem[]>("/work/template/list"),

  /** 模板详情（含 content，预览用） */
  templateDetail: (id: number) =>
    http.get<WorkTemplateDetail>(`/work/template/${id}`),

  /** 从模板创建问卷 */
  createFromTemplate: (templateId: number) =>
    http.post<WorkDetail>(`/work/create-from-template/${templateId}`),

  /** 将问卷转为模板（系统管理员） */
  toTemplate: (id: number) =>
    http.post<{ id: number; name: string }>(`/work/${id}/to-template`),
};
