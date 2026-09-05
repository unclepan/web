"use client";

import { EditorProvider } from "@/components/editor/store/EditorProvider";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLocale } from "@/i18n/useLocale";
import { ShieldOff } from "lucide-react";

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLocale();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-blue-500" />
      </div>
    );
  }

  // 普通用户无权限访问编辑器
  if (user && user.role === "REGULAR") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="size-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <ShieldOff className="size-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">{t((m) => m.workspace.noPermissionHint)}</p>
        </div>
      </div>
    );
  }

  return <EditorProvider>{children}</EditorProvider>;
}
