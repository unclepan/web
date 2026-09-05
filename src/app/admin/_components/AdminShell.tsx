'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { AdminGuard } from './AdminGuard';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { adminStatsApi } from '../_lib/api';

/**
 * 后台外壳：门禁 → 侧边栏 + 顶栏 + 内容区
 *
 * 内容区用 `lg:pl-64` 让位固定侧栏（侧栏 w-64 = 16rem），
 * 与 (docs) 详情页侧栏的让位方式一致。
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [badges, setBadges] = useState({ pendingApply: 0, unreadContacts: 0 });

  // 徽标计数：失败静默（后台可用性不依赖这两个数字）
  const loadBadges = useCallback(async () => {
    try {
      const data = await adminStatsApi.overview();
      setBadges({
        pendingApply: data.users.pendingApply,
        unreadContacts: data.contacts.unread,
      });
    } catch {
      /* 忽略 */
    }
  }, []);

  useEffect(() => {
    void loadBadges();
  }, [loadBadges]);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-muted">
        <AdminSidebar
          badges={badges}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="lg:pl-64">
          <AdminHeader
            onOpenSidebar={() => setSidebarOpen(true)}
            onSignOut={logout}
          />
          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
