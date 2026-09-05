"use client";

import type { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * 暗色模式 Provider — 基于 next-themes。
 *
 * `attribute="class"` 会在 <html> 上增删 `.dark`，
 * 命中 globals.css 里已有的 `.dark` 令牌块与 `@custom-variant dark`。
 * `defaultTheme="system"` + `enableSystem` 保留跟随系统的能力。
 */
export default function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
