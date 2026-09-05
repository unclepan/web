"use client";

/**
 * ProfileUserCard —— 用户信息卡（个人中心的左列）
 *
 * 被两处复用：`/profile`（站点个人中心）与 `/workspace/profile`（工作区个人中心），
 * 因此按项目约定平铺在 `src/components/`，用 `@/components/ProfileUserCard` 导入。
 *
 * 卡片自身取 `useAuth()` 的当前用户，不接受 props；栅格列宽与进场动画由调用方
 * 在外层 div 上控制（两个页面的布局不完全一致）。
 */
import { useState, useRef } from "react";
import {
  Mail,
  Shield,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  UserPlus,
  ShieldCheck,
  Ban,
  Camera,
} from "lucide-react";
import { userApi } from "@/lib/api";
import { useAuth } from "@/lib/auth/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useLocale, format } from "@/i18n/useLocale";
import { cn } from "@/lib/utils";

/** 头像允许的格式，与后端上传校验保持一致 */
const AVATAR_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

/** 头像大小上限（5MB） */
const AVATAR_MAX_SIZE = 5 * 1024 * 1024;

export default function ProfileUserCard({ className }: { className?: string }) {
  const { user, refreshUser } = useAuth();
  const { t } = useLocale();
  const [applyLoading, setApplyLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleApplyAdmin = async () => {
    setApplyLoading(true);
    try {
      const res = await userApi.applyAdmin();
      toast.success(res.message || t((m) => m.workspace.applySubmittedToast));
      refreshUser();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : t((m) => m.workspace.applyFailedToast),
      );
    } finally {
      setApplyLoading(false);
    }
  };

  const handleAvatarClick = () => {
    if (!avatarUploading) fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 校验类型
    if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
      toast.error("仅支持 jpeg/png/gif/webp/svg 格式");
      e.target.value = "";
      return;
    }

    // 校验大小（5MB）
    if (file.size > AVATAR_MAX_SIZE) {
      toast.error("文件大小不能超过 5MB");
      e.target.value = "";
      return;
    }

    setAvatarUploading(true);
    try {
      await userApi.updateAvatar(file);
      await refreshUser();
      toast.success("头像更新成功");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "头像上传失败");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  if (!user) return null;

  const roleLabel: Record<string, string> = {
    REGULAR: t((m) => m.workspace.roleRegular),
    ADMIN: t((m) => m.workspace.roleAdmin),
    SYSTEM_ADMIN: t((m) => m.workspace.roleSystemAdmin),
  };

  function renderRoleBadge(role: string) {
    if (role === "SYSTEM_ADMIN") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/15 text-purple-600 dark:text-purple-300">
          <ShieldCheck className="size-3" />
          {roleLabel[role]}
        </span>
      );
    }
    if (role === "ADMIN") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-600 dark:text-blue-300">
          <Shield className="size-3" />
          {roleLabel[role]}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
        {roleLabel[role] ?? role}
      </span>
    );
  }

  const applyStatusMap: Record<
    string,
    {
      text: string;
      className: string;
      Icon: React.ComponentType<{ className?: string }> | null;
    }
  > = {
    NONE: {
      text: t((m) => m.workspace.applyStatusNone),
      className: "bg-muted text-muted-foreground",
      Icon: null,
    },
    PENDING: {
      text: t((m) => m.workspace.applyStatusPending),
      className: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
      Icon: Clock,
    },
    APPROVED: {
      text: t((m) => m.workspace.applyStatusApproved),
      className: "bg-green-500/15 text-green-600 dark:text-green-300",
      Icon: CheckCircle,
    },
    REJECTED: {
      text: t((m) => m.workspace.applyStatusRejected),
      className: "bg-red-500/15 text-red-600 dark:text-red-300",
      Icon: XCircle,
    },
  };
  const statusInfo = applyStatusMap[user.adminApplyStatus] ?? applyStatusMap.NONE;

  return (
    <div
      className={cn("bg-card rounded-lg border border-border", className)}
      data-testid="profile-user-card"
    >
      <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-lg" />
      <div className="px-6 pb-6 -mt-12 relative">
        <div className="flex flex-col items-center">
          <div
            className="group relative size-24 rounded-full bg-card p-1 shadow-md cursor-pointer"
            onClick={handleAvatarClick}
          >
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={user.username}
                className="size-full rounded-full object-cover"
              />
            ) : (
              <div className="size-full rounded-full bg-blue-600 text-white text-3xl font-bold flex items-center justify-center">
                {user.username?.[0]?.toUpperCase()}
              </div>
            )}
            {/* hover 遮罩 */}
            <div className="absolute inset-1 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {avatarUploading ? (
                <Loader2 className="size-6 animate-spin text-white" />
              ) : (
                <Camera className="size-6 text-white" />
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
            className="hidden"
            onChange={handleFileChange}
          />
          <h2 className="mt-3 text-xl font-semibold text-foreground">
            {user.username}
          </h2>
          <div className="mt-2">{renderRoleBadge(user.role)}</div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground py-2 px-3 rounded-md bg-muted">
            <Mail className="size-4 text-muted-foreground shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground py-2 px-3 rounded-md bg-muted">
            {user.isBlacklisted ? (
              <>
                <Ban className="size-4 text-red-500 shrink-0" />
                <span>
                  {t((m) => m.workspace.accountStatusLabel)}
                  <span className="text-red-600 dark:text-red-300 font-medium">
                    {t((m) => m.workspace.blacklistedStatus)}
                  </span>
                </span>
              </>
            ) : (
              <>
                <Shield className="size-4 text-green-500 shrink-0" />
                <span>
                  {t((m) => m.workspace.accountStatusLabel)}
                  <span className="text-green-600 dark:text-green-300 font-medium">
                    {t((m) => m.workspace.normalStatus)}
                  </span>
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground py-2 px-3 rounded-md bg-muted">
            <Calendar className="size-4 text-muted-foreground shrink-0" />
            <span>
              {format(t((m) => m.workspace.registeredOn), {
                date: new Date(user.createdAt).toLocaleDateString("zh-CN"),
              })}
            </span>
          </div>
        </div>

        {/* 管理员申请 */}
        {user.role === "REGULAR" && (
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                {t((m) => m.workspace.adminApplicationTitle)}
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusInfo.className}`}
              >
                {statusInfo.Icon && <statusInfo.Icon className="size-3" />}
                {statusInfo.text}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {t((m) => m.workspace.adminApplicationDesc)}
            </p>
            {user.adminApplyStatus === "NONE" && (
              <Button
                onClick={handleApplyAdmin}
                disabled={applyLoading}
                className="w-full gap-1.5"
              >
                {applyLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <UserPlus className="size-4" />
                )}
                {applyLoading
                  ? t((m) => m.workspace.submittingBtn)
                  : t((m) => m.workspace.applyForAdminBtn)}
              </Button>
            )}
            {user.adminApplyStatus === "REJECTED" && (
              <Button
                onClick={handleApplyAdmin}
                disabled={applyLoading}
                variant="outline"
                className="w-full gap-1.5"
              >
                {applyLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <UserPlus className="size-4" />
                )}
                {t((m) => m.workspace.reapplyBtn)}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
