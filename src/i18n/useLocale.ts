"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { en } from "./locales/en";
import { zhCN } from "./locales/zh-CN";
import {
  getLocale as readLocale,
  setLocale as writeLocale,
  format as formatTemplate,
  type TranslateFn,
} from "./locale-utils";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  type Locale,
  type Messages,
} from "./types";

export type { TranslateFn };

export interface UseLocaleResult {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: TranslateFn;
  /** hydration 完成后为 true */
  ready: boolean;
}

const DICTIONARIES: Record<Locale, Messages> = {
  en,
  "zh-CN": zhCN,
};

export function format(
  template: string,
  vars: Record<string, string | number>,
): string {
  return formatTemplate(template, vars);
}

export function useLocale(): UseLocaleResult {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const real = readLocale();

     
    if (real !== DEFAULT_LOCALE) setLocaleState(real);

     
    setReady(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === LOCALE_STORAGE_KEY) setLocaleState(readLocale());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    writeLocale(next);
    setLocaleState(next);
  }, []);

  const t = useCallback<TranslateFn>(
    (selector) => {
      const active = DICTIONARIES[locale] ?? en;
      const value = selector(active);
      if (value === undefined || value === "") {
        return selector(en);
      }
      return value;
    },
    [locale],
  );

  return useMemo(() => ({ locale, setLocale, t, ready }), [locale, setLocale, t, ready]);
}
