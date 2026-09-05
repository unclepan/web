import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/inter/900.css";
import "@fontsource/geist/400.css";
import "@fontsource/geist/500.css";
import "@fontsource/geist/600.css";
import "@fontsource/geist/700.css";
import "./globals.css";
import AosInit from "@/components/ui/AosInit";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import AuthProviderWrapper from "@/components/providers/AuthProviderWrapper";
import ThemeProvider from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "uicu",
    template: "%s — uicu",
  },
  description:
    "uicu is an online survey platform to create, distribute, and analyze questionnaires — design forms, collect responses, and turn answers into clear insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning：next-themes 在 SSR 后同步写入 html.dark，属预期不一致
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", "font-sans")}
    >
      <body className="font-inter antialiased bg-background text-foreground tracking-tight">
        <div className="flex flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip">
          <ThemeProvider>
            <TooltipProvider delayDuration={300}>
              <AuthProviderWrapper>
                {children}
              </AuthProviderWrapper>
            </TooltipProvider>
          </ThemeProvider>
        </div>
        <AosInit />
        <Toaster />
      </body>
    </html>
  );
}