"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLocale } from "@/i18n/useLocale";
import { usePathname } from "next/navigation";
import { ShieldOff } from "lucide-react";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLocale();
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const isRegular = user?.role === "REGULAR";
  const isProfilePage = pathname === "/workspace/profile";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-blue-500" />
      </div>
    );
  }

  // 普通用户仅允许访问个人中心
  if (isRegular && !isProfilePage) {
    return (
      <>
        <Header customNav={[]} customProfileHref="/workspace/profile" />
        <main className="grow bg-background pt-16 md:pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="size-14 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShieldOff className="size-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">{t((m) => m.workspace.noPermissionHint)}</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const allCustomNav = [
    { href: "/workspace", label: t((m) => m.workspace.navMySurveys) },
    { href: "/workspace/stats", label: t((m) => m.workspace.navStats) },
    { href: "/workspace/templates", label: t((m) => m.workspace.navTemplates) },
    { href: "/workspace/trash", label: t((m) => m.workspace.navTrash) },
  ];

  // 根据角色过滤自定义导航
  let customNav: { href: string; label: string }[] = [];
  if (isRegular) {
    customNav = [];
  } else if (user?.role === "ADMIN") {
    customNav = allCustomNav;
  } else if (user?.role === "SYSTEM_ADMIN") {
    customNav = [...allCustomNav, { href: "/workspace/user-management", label: t((m) => m.workspace.navUserManagement) }];
  }

  return (
    <>
      <Header customNav={customNav} customProfileHref="/workspace/profile" />
      <main className="grow bg-background pt-16 md:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
