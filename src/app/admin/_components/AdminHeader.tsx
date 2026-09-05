'use client';

import { LogOut, Menu, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import Avatar from '@/components/Avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ADMIN_NAV } from '../_lib/nav';

/** 顶栏：移动端菜单按钮 + 当前页面标题 + 用户菜单 */
export function AdminHeader({
  onOpenSidebar,
  onSignOut,
}: {
  onOpenSidebar: () => void;
  onSignOut: () => void;
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await onSignOut();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-4 sm:px-6">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
        aria-label="打开菜单"
      >
        <Menu className="size-5" />
      </button>

      <h1 className="truncate text-base font-semibold text-foreground">
        {currentPageTitle(pathname)}
      </h1>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
          <Link href="/">查看站点</Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
            >
              <Avatar src={user?.avatar} name={user?.username ?? '?'} size="sm" />
              <span className="hidden max-w-32 truncate text-foreground sm:inline">
                {user?.username}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{user?.username}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => router.push('/workspace')}>
              <UserRound className="size-4" />
              我的工作台
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={signingOut}
              onSelect={(e) => {
                e.preventDefault();
                void handleSignOut();
              }}
            >
              <LogOut className="size-4" />
              {signingOut ? '退出中…' : '退出登录'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

/** 由路径反查导航标题，兜底 "管理后台" */
function currentPageTitle(pathname: string): string {
  for (const group of ADMIN_NAV) {
    for (const item of group.items) {
      if (
        item.href === pathname ||
        (item.href !== '/admin' && pathname.startsWith(`${item.href}/`))
      ) {
        return item.label;
      }
    }
  }
  return '管理后台';
}
