import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Table } from '@/components/ui/table';

/**
 * 表格卡片外壳：统一处理 loading / empty / 有数据三种状态
 *
 * 表格本体由调用方自己写（列结构差异太大，做泛型收益不高），
 * 这里只负责白卡片容器、横向滚动和三态切换。
 */
export function TableCard({
  loading,
  isEmpty = false,
  empty,
  children,
  /** 表格最小宽度，窄屏靠横向滚动 */
  minWidth = 'min-w-[720px]',
}: {
  loading: boolean;
  /**
   * 数据是否为空 —— 必须显式传布尔值。
   *
   * ⚠️ 不能靠 `empty` 节点本身判断：`<EmptyState />` 是个 React 元素对象，
   * 恒为 truthy，写成 `empty={<EmptyState/>}` 会让表格永远渲染不出来，
   * 只有空状态（接口明明有数据）。这个坑踩过一次。
   */
  isEmpty?: boolean;
  empty?: ReactNode;
  children: ReactNode;
  minWidth?: string;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-card py-20">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="rounded-lg border border-border bg-card">
        {empty ?? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            暂无数据
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Table className={minWidth}>{children}</Table>
    </div>
  );
}

/** 表格头单元格：统一字号/字重/配色，避免每页各写一遍 */
export function Th({
  children,
  className = '',
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`whitespace-nowrap border-b border-border bg-muted px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}

/** 表格体单元格 */
export function Td({
  children,
  className = '',
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`border-b border-border px-4 py-3 text-sm text-foreground ${className}`}
    >
      {children}
    </td>
  );
}

export { Table };
