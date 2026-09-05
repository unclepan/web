'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * 分页控件
 *
 * 页码在两端做省略：1 … 4 5 6 … 20
 */
export function Pagination({
  page,
  pageSize,
  total,
  loading,
  onChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  loading?: boolean;
  onChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / (pageSize || 1)));
  if (total === 0) return null;

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        共 <span className="font-medium text-foreground">{total}</span> 条 · 第{' '}
        {page} / {totalPages} 页
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page <= 1 || loading}
          onClick={() => onChange(page - 1)}
          aria-label="上一页"
        >
          <ChevronLeft className="size-4" />
        </Button>

        {buildPages(page, totalPages).map((item, index) =>
          item === '…' ? (
            <span
              key={`gap-${index}`}
              className="px-1.5 text-sm text-muted-foreground"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              disabled={loading}
              onClick={() => onChange(item)}
              className={cn(
                'size-8 rounded-md text-sm transition-colors',
                item === page
                  ? 'bg-primary font-medium text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {item}
            </button>
          ),
        )}

        <Button
          variant="outline"
          size="icon-sm"
          disabled={page >= totalPages || loading}
          onClick={() => onChange(page + 1)}
          aria-label="下一页"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

/** 生成页码序列，两端各留 1 页 + 中间 ±1，其余用省略号 */
function buildPages(current: number, total: number): Array<number | '…'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, total, current]);
  if (current - 1 > 1) pages.add(current - 1);
  if (current + 1 < total) pages.add(current + 1);
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
  }
  if (current >= total - 2) {
    pages.add(total - 1);
    pages.add(total - 2);
  }

  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result: Array<number | '…'> = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push('…');
    result.push(p);
    prev = p;
  }
  return result;
}
