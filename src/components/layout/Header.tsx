"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";
import Logo from "@/components/ui/Logo";
import LocaleToggle from "@/components/ui/LocaleToggle";
import ThemeToggle from "@/components/ui/ThemeToggle";
import SearchModal from "@/components/SearchModal";
import { useLocale } from "@/i18n/useLocale";
import { useAuth } from "@/lib/auth/AuthContext";
import type { UserProfile } from "@/lib/api/modules/user.types";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * 外部传入的自定义导航项。
 * `label` 已是翻译后的文案，由调用方自行处理国际化。
 */
export interface CustomNavItem {
  label: string;
  href: string;
}

/**
 * 头像下拉里「个人中心」的默认跳转目标 —— 站点个人中心。
 * 工作区侧通过 `customProfileHref` 覆盖为 `/workspace/profile`。
 */
export const DEFAULT_PROFILE_HREF = "/profile";

interface HeaderProps {
  /** 外部传入的自定义导航；传了就完全替代默认导航 */
  customNav?: CustomNavItem[];
  /**
   * 「个人中心」的跳转地址；不传则走 `DEFAULT_PROFILE_HREF`。
   * 工作区（`workspace/layout.tsx`）传 `/workspace/profile`，
   * 让头像菜单停在带左侧工作区导航的个人中心页。
   */
  customProfileHref?: string;
}

/**
 * 不展示语言切换按钮的路由（正则匹配 `usePathname()` 的返回值）。
 * 目前是两处文章详情页 `/docs/[uuid]` / `/blog/[uuid]`：正文按文章自身语言展示，
 * 顶部的中英切换在这里没有意义，直接隐藏入口。
 */
const NO_LOCALE_ROUTES = [/^\/docs\/[^/]+$/, /^\/blog\/[^/]+$/];

/** 默认导航项 — `labelKey` 索引字典的 `nav` 命名空间。 */
type DefaultNavItem = {
  labelKey: string;
  href: string;
  /** 需要登录后可见（如「工作区」）；未登录时该项自动隐藏 */
  requireAuth?: boolean;
};

const defaultNav: DefaultNavItem[] = [
  { labelKey: "home", href: "/" },
  { labelKey: "resources", href: "/resources" },
  { labelKey: "docs", href: "/docs" },
  { labelKey: "about", href: "/about" },
  { labelKey: "contact", href: "/contact" },
  { labelKey: "workspace", href: "/workspace", requireAuth: true },
];

/** 头像色卡 —— 用 id 简单散列，保证同一用户色一致 */
const AVATAR_COLORS = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-yellow-600",
] as const;

/** 头像：有图片走 img，否则渲染首字母圆形 */
function Avatar({
  user,
  size = "md",
  onClick,
  className,
}: {
  user: UserProfile;
  size?: "md" | "lg";
  onClick?: () => void;
  className?: string;
}) {
  const initial = user.username?.[0]?.toUpperCase() ?? "?";
  const colorIndex = (user.id ?? 0) % AVATAR_COLORS.length;
  const sizeClass = size === "lg" ? "size-10" : "size-8";
  const baseClass = cn(
    sizeClass,
    "rounded-full border-2 border-transparent hover:border-blue-500 transition",
    onClick && "cursor-pointer",
    className,
  );

  if (user.avatar) {
    return (
      <Image
        src={user.avatar}
        alt={user.username ?? "avatar"}
        width={size === "lg" ? 40 : 32}
        height={size === "lg" ? 40 : 32}
        className={cn(baseClass, "object-cover")}
        onClick={onClick}
        unoptimized
      />
    );
  }

  return (
    <div
      className={cn(
        baseClass,
        AVATAR_COLORS[colorIndex],
        "text-white text-sm font-semibold flex items-center justify-center",
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      title={user.username}
    >
      {initial}
    </div>
  );
}

function NavLinks({
  items,
  linkClass,
  getLabel,
}: {
  items: typeof defaultNav;
  linkClass: string;
  getLabel: (key: string) => string;
}) {
  return (
    <>
      {items.map((item) => (
        <li key={item.href}>
          <Link className={linkClass} href={item.href}>
            {getLabel(item.labelKey)}
          </Link>
        </li>
      ))}
    </>
  );
}

export default function Header({ customNav, customProfileHref }: HeaderProps) {
  const { t } = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  const navLabel = (key: string) => t((m) => m.nav[key as keyof typeof m.nav]);
  const isLoggedIn = !!user;
  const hasCustomNav = !!customNav && customNav.length > 0;

  /** 文章详情页不展示语言切换 */
  const showLocaleToggle = useMemo(
    () => !NO_LOCALE_ROUTES.some((re) => re.test(pathname)),
    [pathname],
  );

  /** REGULAR 用户不展示自定义导航 */
  const visibleCustomNav = useMemo(() => {
    if (!hasCustomNav) return [];
    if (!isLoggedIn) return [];
    if (user?.role === "REGULAR") return [];
    return customNav!;
  }, [customNav, hasCustomNav, isLoggedIn, user?.role]);

  /** 默认导航中标记了 requireAuth 的项（如「工作区」），未登录时隐藏 */
  const visibleDefaultNav = useMemo(
    () => defaultNav.filter((item) => !item.requireAuth || isLoggedIn),
    [isLoggedIn],
  );

  // 路由变化时自动关闭移动端菜单
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const desktopNavLinkClass =
    "text-muted-foreground hover:text-foreground px-3 lg:px-5 py-2 flex items-center transition duration-150 ease-in-out";
  const mobileNavLinkClass =
    "flex text-muted-foreground hover:text-foreground py-2";

  const goProfile = () =>
    router.push(customProfileHref ?? DEFAULT_PROFILE_HREF);

  return (
    <header className="fixed w-full z-30">
      {/*
        磨砂背景放在内层背景 div 上，**不要**加在 <header> 元素本身：
        `backdrop-filter` 会为所有 fixed 定位的后代创建新的包含块，
        搜索模态框是 Header 的后代，若 <header> 带 backdrop-blur，
        模态框会相对 80px 高的 Header 定位（而不是视口），高度被压成 0 弹不出来。
        docs 的 Header 就是这么写的（背景层是 absolute inset-0 -z-10 的独立 div）。
      */}
      <div
        className="absolute inset-0 bg-background/70 border-b border-border backdrop-blur -z-10"
        aria-hidden="true"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="shrink-0 mr-4">
            <Logo />
          </div>

          {/* 桌面端导航 */}
          <nav className="hidden md:flex md:grow">
            <ul className="flex grow justify-start flex-wrap items-center">
              {hasCustomNav ? (
                visibleCustomNav.map((item) => (
                  <li key={item.href}>
                    <Link className={desktopNavLinkClass} href={item.href}>
                      {item.label}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <NavLinks
                    items={visibleDefaultNav}
                    linkClass={desktopNavLinkClass}
                    getLabel={navLabel}
                  />
                  {/* <li
                    className="relative"
                    onMouseEnter={() => setResourcesOpen(true)}
                    onMouseLeave={() => setResourcesOpen(false)}
                  >
                    <button
                      type="button"
                      className={desktopNavLinkClass}
                      aria-haspopup="true"
                      aria-expanded={resourcesOpen}
                      onFocus={() => setResourcesOpen(true)}
                      onBlur={() => setResourcesOpen(false)}
                    >
                      {navLabel("resources")}
                      <ChevronDown className="size-3 text-muted-foreground ml-1 shrink-0" />
                    </button>
                    {resourcesOpen && (
                      <ul className="origin-top-right absolute top-full right-0 w-40 bg-card py-2 ml-4 rounded shadow-lg">
                        {resourcesNav.map((item) => (
                          <li key={item.href}>
                            <Link
                              className="font-medium text-sm text-muted-foreground hover:text-foreground flex py-2 px-5 leading-tight"
                              href={item.href}
                              onFocus={() => setResourcesOpen(true)}
                              onBlur={() => setResourcesOpen(false)}
                            >
                              {navLabel(item.labelKey)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li> */}
                </>
              )}
            </ul>

            <ul className="flex grow justify-end flex-wrap items-center gap-3">
              {/* 搜索 */}
              <li>
                <SearchModal />
              </li>
              {/* 暗色切换 + 语言切换：成组的「偏好」控件 */}
              <li>
                <ThemeToggle id="light-switch" />
              </li>
              {showLocaleToggle && (
                <li>
                  <LocaleToggle id="locale-switch" />
                </li>
              )}
              {isLoggedIn ? (
                <li className="flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="rounded-full outline-none focus:outline-none"
                        aria-label={user!.username}
                      >
                        <Avatar user={user!} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      sideOffset={8}
                      className="w-48"
                    >
                      <DropdownMenuLabel className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-foreground truncate">
                          {user!.username}
                        </span>
                        {user!.email && (
                          <span className="text-xs text-muted-foreground truncate">
                            {user!.email}
                          </span>
                        )}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={goProfile}>
                        <UserIcon />
                        <span>{t((m) => m.nav.profile)}</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => logout()}
                      >
                        <LogOut />
                        <span>{t((m) => m.nav.signOut)}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ) : (
                <>
                  <li>
                    <Link
                      className="btn-sm text-primary-foreground bg-primary hover:bg-primary/90 ml-3"
                      href="/signin"
                    >
                      {t((m) => m.nav.signIn)}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

          {/* 移动端：搜索 / 主题 / 语言切换常驻导航，位于汉堡按钮之前 */}
          <div className="inline-flex md:hidden items-center">
            <SearchModal compact />
            <ThemeToggle id="light-switch-mobile" size="md" />
            {showLocaleToggle && (
              <LocaleToggle id="locale-switch-mobile" size="md" />
            )}
            <button
              type="button"
              className="p-2 flex items-center justify-center text-muted-foreground hover:text-foreground transition duration-150 ease-in-out"
              onClick={() => setMobileOpen((v) => !v)}
              aria-controls="mobile-nav"
              aria-expanded={mobileOpen}
            >
              <span className="sr-only">{t((m) => m.nav.menu)}</span>
              <span className="relative w-5 h-4 block" aria-hidden="true">
                <span
                  className={cn(
                    "absolute left-0 w-full h-0.5 bg-current rounded-full transition-all duration-200 ease-out",
                    mobileOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-current rounded-full transition-opacity duration-200 ease-out",
                    mobileOpen ? "opacity-0" : "opacity-100",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 w-full h-0.5 bg-current rounded-full transition-all duration-200 ease-out",
                    mobileOpen
                      ? "top-1/2 -translate-y-1/2 -rotate-45"
                      : "bottom-0",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 移动端菜单 */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          className="absolute top-full h-screen pb-16 z-20 left-0 w-full overflow-scroll bg-background"
          onClick={() => setMobileOpen(false)}
        >
          <ul className="px-5 py-2">
            {hasCustomNav ? (
              visibleCustomNav.map((item) => (
                <li key={item.href}>
                  <Link className={mobileNavLinkClass} href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))
            ) : (
              <>
                <NavLinks
                  items={visibleDefaultNav}
                  linkClass={mobileNavLinkClass}
                  getLabel={navLabel}
                />
                {/* <li className="py-2 my-2 border-t border-b border-border">
                  <span className="flex text-muted-foreground hover:text-foreground py-2">
                    {navLabel("resources")}
                  </span>
                  <ul className="pl-4">
                    {resourcesNav.map((item) => (
                      <li key={item.href}>
                        <Link
                          className="text-sm flex font-medium text-muted-foreground hover:text-foreground py-2"
                          href={item.href}
                        >
                          {navLabel(item.labelKey)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li> */}
              </>
            )}
            {isLoggedIn ? (
              <li className="py-2">
                <button
                  type="button"
                  className="btn-sm w-full block text-center text-primary-foreground bg-primary hover:bg-primary/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    goProfile();
                  }}
                >
                  {user!.username}
                </button>
              </li>
            ) : (
              <li className="py-2">
                <Link
                  className="btn-sm w-full block text-center text-primary-foreground bg-primary hover:bg-primary/90"
                  href="/signin"
                >
                  {t((m) => m.nav.signIn)}
                </Link>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
