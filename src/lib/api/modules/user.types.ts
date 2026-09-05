export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: "REGULAR" | "ADMIN" | "SYSTEM_ADMIN";
  isBlacklisted: boolean;
  adminApplyStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserListItem {
  id: number;
  username: string;
  email: string;
  role: string;
  isBlacklisted: boolean;
  adminApplyStatus: string;
  avatar: string | null;
  createdAt: string;
}

export interface UserListResult {
  users: UserListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApplyAdminResult {
  message: string;
}
