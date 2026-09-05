import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TableCard, Th, Td } from './TableCard';

/**
 * 这几个用例专门盯一个踩过的坑：
 *
 * `empty` 传的是 React 元素（`<EmptyState />`），元素对象恒为 truthy。
 * 早期 TableCard 直接 `if (empty)` 判空，导致**只要有 empty prop 就永远渲染空状态**，
 * 接口数据到了也看不到表格。现在空状态必须由 `isEmpty` 这个布尔值驱动。
 */
describe('TableCard', () => {
  const table = (
    <>
      <thead>
        <tr>
          <Th>标题</Th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <Td>真实数据行</Td>
        </tr>
      </tbody>
    </>
  );

  it('有数据时渲染表格，即使同时传了 empty 节点', () => {
    render(
      <TableCard loading={false} isEmpty={false} empty={<p>空状态</p>}>
        {table}
      </TableCard>,
    );

    expect(screen.getByText('真实数据行')).toBeDefined();
    expect(screen.queryByText('空状态')).toBeNull();
  });

  it('isEmpty 为真时渲染空状态而不是表格', () => {
    render(
      <TableCard loading={false} isEmpty empty={<p>空状态</p>}>
        {table}
      </TableCard>,
    );

    expect(screen.getByText('空状态')).toBeDefined();
    expect(screen.queryByText('真实数据行')).toBeNull();
  });

  it('loading 优先于空状态', () => {
    const { container } = render(
      <TableCard loading isEmpty empty={<p>空状态</p>}>
        {table}
      </TableCard>,
    );

    expect(container.querySelector('.animate-spin')).not.toBeNull();
    expect(screen.queryByText('空状态')).toBeNull();
    expect(screen.queryByText('真实数据行')).toBeNull();
  });

  it('isEmpty 为真但没传 empty 时给出兜底文案', () => {
    render(
      <TableCard loading={false} isEmpty>
        {table}
      </TableCard>,
    );

    expect(screen.getByText('暂无数据')).toBeDefined();
  });
});
