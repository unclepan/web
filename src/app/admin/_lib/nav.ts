import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  FileText,
  FolderTree,
  Inbox,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Newspaper,
  ThumbsUp,
  Users,
} from 'lucide-react';

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** 侧边栏徽标数据的键，由 AdminShell 注入 */
  badge?: 'pendingApply' | 'unreadContacts';
}

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

/**
 * 后台侧边栏导航配置
 *
 * 新增页面时只改这里，AdminSidebar 会自动渲染分组与激活态。
 */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    title: '概览',
    items: [{ label: '仪表盘', href: '/admin', icon: LayoutDashboard }],
  },
  {
    title: '运营',
    items: [
      { label: '用户管理', href: '/admin/users', icon: Users, badge: 'pendingApply' },
      { label: '问卷管理', href: '/admin/works', icon: FileText },
      { label: '答卷管理', href: '/admin/answers', icon: Inbox },
    ],
  },
  {
    title: '内容',
    items: [
      { label: '文章管理', href: '/admin/articles', icon: Newspaper },
      { label: '分类管理', href: '/admin/categories', icon: FolderTree },
      { label: '反馈统计', href: '/admin/feedback', icon: ThumbsUp },
      { label: '留言管理', href: '/admin/contacts', icon: MessageSquare, badge: 'unreadContacts' },
    ],
  },
  {
    title: '系统',
    items: [
      { label: '订阅管理', href: '/admin/newsletter', icon: Mail },
      { label: '服务健康', href: '/admin/system', icon: Activity },
    ],
  },
];

/** 判断导航项是否处于激活态（/admin 要求精确匹配，避免它一直高亮） */
export function isNavItemActive(href: string, pathname: string): boolean {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(`${href}/`);
}
