'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

/**
 * 搜索框：带图标、带清除按钮
 *
 * 受控组件，防抖交给调用方（useDebouncedValue）。
 */
export function SearchInput({
  value,
  onChange,
  placeholder = '搜索…',
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 pl-8 pr-8"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="清除搜索"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
