'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api';

export interface SimpleListResult<T> {
  items: T[];
  total: number;
}

/**
 * 后台列表通用拉取逻辑
 *
 * 项目里没有 SWR / React Query，每个页面都是 useEffect + useState，
 * 这个 hook 把「分页 + loading + 错误 toast + 筛选变化回到第 1 页」收敛掉。
 *
 * @param fetcher 只负责按页码取一页数据；筛选条件通过闭包带进去
 * @param reloadKey 筛选条件的字符串指纹 —— 变化即回到第 1 页重新拉取
 *
 * 为什么用 reloadKey 而不是把 fetcher 放进依赖：
 * 调用方十有八九会传内联箭头函数，那样每次渲染都是新引用，
 * 直接进 deps 会造成无限循环。显式指纹没有这个坑。
 */
export function useAdminList<T>(
  fetcher: (page: number) => Promise<SimpleListResult<T>>,
  reloadKey: string,
  pageSize = 20,
  errorText = '加载失败，请稍后重试',
) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const load = useCallback(
    async (target: number) => {
      setLoading(true);
      try {
        const res = await fetcherRef.current(target);
        setItems(res.items);
        setTotal(res.total);
        setPage(target);
      } catch (err) {
        setItems([]);
        setTotal(0);
        toast.error(err instanceof ApiError ? err.message : errorText);
      } finally {
        setLoading(false);
      }
    },
    [errorText],
  );

  // 筛选条件变化 → 回到第 1 页
  useEffect(() => {
    void load(1);
  }, [load, reloadKey]);

  const goToPage = useCallback(
    (target: number) => {
      void load(target);
    },
    [load],
  );

  /** 操作完成后停在当页重拉 */
  const refresh = useCallback(() => {
    void load(page);
  }, [load, page]);

  return {
    items,
    total,
    page,
    pageSize,
    loading,
    goToPage,
    refresh,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
