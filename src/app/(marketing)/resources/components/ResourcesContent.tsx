"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/useLocale";
import {
  Palette,
  Brush,
  Layers,
  Code2,
  Component,
  Blocks,
  Sparkles,
  Wand2,
  Server,
  Database,
  Cloud,
  Cpu,
  BookOpen,
  GraduationCap,
  Library,
  Compass,
  MessagesSquare,
  Rocket,
  Workflow,
  Wrench,
  Zap,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// 与 i18n 字典 resourcesPage.categories 结构严格对齐
// ---------------------------------------------------------------------------
type CategoryId =
  | "frontend"
  | "design"
  | "backend"
  | "productivity"
  | "learning"
  | "community";

type ResourceLink = {
  /** 字典 link key */
  id: string;
  href: string;
  icon: LucideIcon;
};

type AccentColor =
  | "blue"
  | "teal"
  | "indigo"
  | "purple"
  | "pink"
  | "emerald";

type ResourceCategory = {
  id: CategoryId;
  accent: AccentColor;
  links: ResourceLink[];
};

const categories: ResourceCategory[] = [
  {
    id: "frontend",
    accent: "blue",
    links: [
      { id: "nextjs", href: "https://nextjs.org", icon: Code2 },
      { id: "tailwind", href: "https://tailwindcss.com", icon: Wand2 },
      { id: "shadcn", href: "https://ui.shadcn.com", icon: Component },
      { id: "shadcnblocks", href: "https://www.shadcnblocks.com/", icon: Blocks },
      { id: "lucide", href: "https://lucide.dev", icon: Sparkles },
    ],
  },
  {
    id: "design",
    accent: "pink",
    links: [
      { id: "dribbble", href: "https://dribbble.com", icon: Brush },
      { id: "behance", href: "https://www.behance.net", icon: Palette },
      { id: "mobbin", href: "https://mobbin.com", icon: Layers },
    ],
  },
  {
    id: "backend",
    accent: "teal",
    links: [
      { id: "prisma", href: "https://www.prisma.io", icon: Database },
      { id: "vercel", href: "https://vercel.com", icon: Cloud },
      { id: "cloudflare", href: "https://www.cloudflare.com", icon: Server },
      { id: "supabase", href: "https://supabase.com", icon: Cpu },
    ],
  },
  {
    id: "productivity",
    accent: "indigo",
    links: [
      { id: "notion", href: "https://www.notion.so", icon: BookOpen },
      { id: "linear", href: "https://linear.app", icon: Workflow },
      { id: "raycast", href: "https://www.raycast.com", icon: Zap },
      { id: "arc", href: "https://arc.net", icon: Compass },
    ],
  },
  {
    id: "learning",
    accent: "emerald",
    links: [
      { id: "mdn", href: "https://developer.mozilla.org", icon: Library },
      {
        id: "freecodecamp",
        href: "https://www.freecodecamp.org",
        icon: GraduationCap,
      },
      {
        id: "frontendmasters",
        href: "https://frontendmasters.com",
        icon: Rocket,
      },
      { id: "patternsdev", href: "https://www.patterns.dev", icon: Wrench },
    ],
  },
  {
    id: "community",
    accent: "purple",
    links: [
      {
        id: "stackoverflow",
        href: "https://stackoverflow.com",
        icon: MessagesSquare,
      },
    ],
  },
];

// 颜色族映射：写成静态字符串，避免 Tailwind 因动态类名 purge 失败
const accentMap: Record<
  AccentColor,
  { iconText: string; iconBg: string; hoverBorder: string; hoverTitle: string }
> = {
  blue: {
    iconText: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    hoverBorder: "hover:border-blue-400 dark:hover:border-blue-500/60",
    hoverTitle: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
  },
  teal: {
    iconText: "text-teal-600 dark:text-teal-400",
    iconBg: "bg-teal-100 dark:bg-teal-900/40",
    hoverBorder: "hover:border-teal-400 dark:hover:border-teal-500/60",
    hoverTitle: "group-hover:text-teal-600 dark:group-hover:text-teal-400",
  },
  indigo: {
    iconText: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/40",
    hoverBorder: "hover:border-indigo-400 dark:hover:border-indigo-500/60",
    hoverTitle: "group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
  },
  purple: {
    iconText: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-100 dark:bg-purple-900/40",
    hoverBorder: "hover:border-purple-400 dark:hover:border-purple-500/60",
    hoverTitle: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
  },
  pink: {
    iconText: "text-pink-600 dark:text-pink-400",
    iconBg: "bg-pink-100 dark:bg-pink-900/40",
    hoverBorder: "hover:border-pink-400 dark:hover:border-pink-500/60",
    hoverTitle: "group-hover:text-pink-600 dark:group-hover:text-pink-400",
  },
  emerald: {
    iconText: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    hoverBorder: "hover:border-emerald-400 dark:hover:border-emerald-500/60",
    hoverTitle: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
  },
};

/**
 * Resources page body — rendered inside the marketing layout (Header/Footer).
 *
 * AOS is initialised globally by `AosInit` in the root layout, so this
 * component only needs the `data-aos` attributes.
 */
export default function ResourcesContent() {
  const { t } = useLocale();

  return (
    <>
      {/* Hero section */}
      <section className="relative">
        {/* 背景渐变 */}
        <div
          className="absolute inset-0 h-[24rem] pt-16 box-content -z-10 bg-gradient-to-b from-blue-50 via-background to-background dark:from-muted dark:via-background dark:to-background"
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="pt-32 pb-12 md:pt-40 md:pb-20">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="h1 mb-4" data-aos="fade-up">
                {t((m) => m.resourcesPage.heroTitle)}
              </h1>
              <p
                className="text-xl text-muted-foreground"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                {t((m) => m.resourcesPage.heroSubtitle)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="pb-12 md:pb-20 space-y-12 md:space-y-16">
            {categories.map((category) => {
              const accent = accentMap[category.accent];
              return (
                <div key={category.id}>
                  {/* 分类标题 */}
                  <div className="max-w-3xl mb-8 md:mb-10" data-aos="fade-up">
                    <h3 className="h3 mb-2">
                      {t((m) => m.resourcesPage.categories[category.id].title)}
                    </h3>
                    <p className="text-base text-muted-foreground">
                      {t(
                        (m) => m.resourcesPage.categories[category.id].subtitle,
                      )}
                    </p>
                  </div>

                  {/* 链接卡片网格 */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {category.links.map((link, index) => {
                      const Icon = link.icon;
                      const linkTitle = t(
                        (m) =>
                          (
                            m.resourcesPage.categories[category.id].links as Record<
                              string,
                              { title: string; description: string }
                            >
                          )[link.id].title,
                      );
                      const linkDesc = t(
                        (m) =>
                          (
                            m.resourcesPage.categories[category.id].links as Record<
                              string,
                              { title: string; description: string }
                            >
                          )[link.id].description,
                      );
                      return (
                        <a
                          key={link.id}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-aos="fade-up"
                          data-aos-delay={100 + index * 80}
                          className={`group relative flex flex-col gap-2 h-full px-4 py-3 rounded-lg border border-border bg-card text-foreground ${accent.hoverBorder} hover:shadow-sm transition-colors`}
                        >
                          {/* 顶部：图标 + 跳转箭头 */}
                          <div className="flex items-start justify-between">
                            <div
                              className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${accent.iconBg} ${accent.iconText}`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <ArrowUpRight
                              className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-colors"
                              aria-hidden="true"
                            />
                          </div>

                          {/* 标题与描述 */}
                          <h3
                            className={`text-sm font-semibold transition ${accent.hoverTitle}`}
                          >
                            {linkTitle}
                          </h3>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {linkDesc}
                          </p>
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="py-12 md:py-16 border-t border-border">
            <div className="max-w-3xl mx-auto text-center" data-aos="fade-up">
              <h2 className="h2 mb-4">{t((m) => m.resourcesPage.ctaTitle)}</h2>
              <p className="text-lg text-muted-foreground mb-8">
                {t((m) => m.resourcesPage.ctaSubtitle)}
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
              >
                {t((m) => m.resourcesPage.ctaButton)}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
