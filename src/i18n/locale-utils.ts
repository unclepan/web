import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  type Locale,
  type Messages,
} from "./types";

export type TranslateFn = <S>(selector: (m: Messages) => S) => S;

export function getLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const raw = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (!raw) return DEFAULT_LOCALE;
    return (SUPPORTED_LOCALES as readonly string[]).includes(raw)
      ? (raw as Locale)
      : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function setLocale(locale: Locale): void {
  if (!(SUPPORTED_LOCALES as readonly string[]).includes(locale)) {
    throw new Error(`Unsupported locale: ${locale}`);
  }
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: LOCALE_STORAGE_KEY,
        newValue: locale,
        oldValue: window.localStorage.getItem(LOCALE_STORAGE_KEY),
        storageArea: window.localStorage,
      }),
    );
  } catch (error) {
    console.warn("Failed to set locale:", error);
  }
}

export function format(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key)
      ? String(vars[key])
      : `{${key}}`,
  );
}
