import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AdminShell } from './_components/AdminShell';

export const metadata: Metadata = {
  title: '管理后台',
  robots: { index: false, follow: false },
};

/**
 * 后台布局
 *
 * admin 不在任何路由组里，所以不会带上 (marketing) 的全站 Header / Footer；
 * AdminShell 自带后台专用的侧边栏 + 顶栏。
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
