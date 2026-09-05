'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { ADMIN_NAV, isNavItemActive } from '../_lib/nav';
import { cn } from '@/lib/utils';

export interface AdminSidebarProps {
  /** 徽标计数：待审管理员申请数 / 未读留言数，0 或 undefined 不显示 */
  badges: { pendingApply: number; unreadContacts: number };
  /** 移动端抽屉是否展开 */
  open: boolean;
  onClose: () => void;
}

/**
 * 后台侧边栏
 *
 * 设计参考 mosaic：深色侧栏在深浅色模式下都保持深色，这是后台的视觉锚点，
 * 内容区才跟随主题切换。所以这里不用 bg-sidebar 语义变量而直接锁定深色。
 */
export function AdminSidebar({ badges, open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* 移动端遮罩 */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 transition-transform duration-200',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* 品牌区 */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 px-5">
          <Link
            href="/admin"
            className="flex items-center gap-2"
            onClick={onClose}
          >
            <span className="flex size-7 items-center justify-center rounded bg-blue-600 text-sm font-bold text-white">
              U
            </span>
            <span className="text-sm font-semibold text-white">uicu 管理后台</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="关闭菜单"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* 导航 */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {ADMIN_NAV.map((group) => (
            <div key={group.title} className="mb-6 last:mb-0">
              <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isNavItemActive(item.href, pathname);
                  const badgeCount =
                    item.badge === 'pendingApply'
                      ? badges.pendingApply
                      : item.badge === 'unreadContacts'
                        ? badges.unreadContacts
                        : 0;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                          active
                            ? 'bg-slate-800 font-medium text-white'
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100',
                        )}
                      >
                        <item.icon className="size-4 shrink-0" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {badgeCount > 0 && (
                          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-medium text-white">
                            {badgeCount > 99 ? '99+' : badgeCount}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* 底部返回前台 */}
        <div className="shrink-0 border-t border-slate-800 p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-slate-100"
          >
            <span className="text-xs">←</span>
            返回前台站点
          </Link>
        </div>
      </aside>
    </>
  );
}
