/**
 * 用户管理 API 模块
 */
import { http } from "../client";
import type { UserProfile, UserListResult, ApplyAdminResult } from "./user.types";

export const userApi = {
  /** 获取当前登录用户信息 */
  getMe: () => http.get<UserProfile>("/user/me"),

  /** 用户列表（系统管理员） */
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return http.get<UserListResult>(`/user/list${qs}`);
  },

  /** 设置用户角色（系统管理员） */
  setRole: (id: number, role: string) => http.post<void>(`/user/${id}/set-role`, { role }),

  /** 拉黑/解除拉黑（系统管理员） */
  toggleBlacklist: (id: number) => http.post<void>(`/user/${id}/blacklist`),

  /** 审核管理员申请（系统管理员） */
  reviewApply: (id: number, status: string) => http.post<void>(`/user/${id}/review-apply`, { status }),

  /** 申请转管理员（普通用户） */
  applyAdmin: () => http.post<ApplyAdminResult>("/user/apply-admin"),

  /** 更新头像（上传文件到 COS） */
  updateAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return http.post<{ avatar: string }>("/user/avatar", formData);
  },
};
