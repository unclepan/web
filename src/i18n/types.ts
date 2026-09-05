/**
 * i18n 公共类型与白名单常量。
 */
import type { en } from "./locales/en";

export type Locale = "en" | "zh-CN";

export const SUPPORTED_LOCALES: readonly Locale[] = ["en", "zh-CN"] as const;

export const DEFAULT_LOCALE: Locale = "en";

type Loosen<T> = T extends string
  ? string
  : { [K in keyof T]: Loosen<T[K]> };

export type Messages = Loosen<typeof en>;

export const LOCALE_STORAGE_KEY = "locale";
