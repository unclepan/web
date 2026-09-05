'use client';

import { useEffect, useState } from 'react';

/**
 * 输入防抖：搜索框每次按键都发请求会把后端打满，统一延迟 350ms。
 * 值本身立即更新（输入框不卡），只有 debounced 值延迟。
 */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
