"use client";

import { useMemo } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import SubscribeBox from "./SubscribeBox";
import { useLocale } from "@/i18n/useLocale";

/** 链接列：标题 + 项 */
interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

/** 社交平台图标（path = SVG path 的 d），按数组顺序渲染 */
const socials = [
  {
    label: "Twitter",
    path: "m13.063 9 3.495 4.475L20.601 9h2.454l-5.359 5.931L24 23h-4.938l-3.866-4.893L10.771 23H8.316l5.735-6.342L8 9h5.063Zm-.74 1.347h-1.457l8.875 11.232h1.36l-8.778-11.232Z",
  },
  {
    label: "Github",
    path: "M16 8.2c-4.4 0-8 3.6-8 8 0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4V22c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.7-3.7 3.9.3.4.6.9.6 1.6v2.2c0 .2.1.5.6.4 3.2-1.1 5.5-4.1 5.5-7.6-.1-4.4-3.7-8-8.1-8z",
  },
  {
    label: "Facebook",
    path: "M14.023 24L14 17h-3v-3h3v-2c0-2.7 1.672-4 4.08-4 1.153 0 2.144.086 2.433.124v2.821h-1.67c-1.31 0-1.563.623-1.563 1.536V14H21l-1 3h-2.72v7h-3.257z",
  },
];

interface FooterProps {
  /**
   * 嵌入模式：去掉自身 `max-w-7xl mx-auto px-4 sm:px-6` 容器，由父容器决定宽度。
   *
   * 只有 `/docs/[uuid]` 用得到 —— 文档详情页的侧边栏是 `fixed` 全高的
   * （16rem），全站 Footer 会被它盖住左侧一大块，所以要把 Footer 收进
   * `md:pl-64` 的内容列里，与线上 docs 工程的 `<Footer embedded />` 一致。
   */
  embedded?: boolean;
}

/** Site footer with newsletter, link blocks, social icons and copyright. */
export default function Footer({ embedded = false }: FooterProps = {}) {
  const { t } = useLocale();

  // 链接配置：按需增删项目，空数组的列不会渲染
  const footerColumns: FooterColumn[] = useMemo(
    () => [
      {
        title: t((m) => m.footer.resources),
        links: [
          { label: t((m) => m.footer.documentation), href: "/docs" },
          // 博客没有独立索引页：首页 `/` 就是 DESIGN 文章的列表
          { label: t((m) => m.footer.blog), href: "/" },
          { label: t((m) => m.footer.resources), href: "/resources" },
        ],
      },
      {
        title: t((m) => m.footer.company),
        links: [
          { label: t((m) => m.footer.about), href: "/about" },
          { label: t((m) => m.footer.contact), href: "/contact" },
        ],
      },
      {
        title: t((m) => m.footer.legal),
        links: [
          { label: t((m) => m.footer.terms), href: "/terms" },
          { label: t((m) => m.footer.privacy), href: "/privacy" },
        ],
      },
    ],
    [t]
  );

  return (
    <footer>
      {/* embedded 时不传 className，避免渲染出空的 class="" */}
      <div className={embedded ? undefined : "max-w-7xl mx-auto px-4 sm:px-6"}>
        {/* 顶部：网格布局 */}
        <div className="grid sm:grid-cols-12 gap-8 py-8 md:py-12 border-t border-border">
          {/* 1. 品牌区 */}
          <div className="sm:col-span-12 lg:col-span-3">
            <div className="mb-2">
              {/* 注意：不要再给 Logo 外面套一层 <Link>。
                  web 的 Logo 组件内部已经渲染了 <Link href="/">（Logo.tsx），
                  而参考工程用的是裸 <Image>（不带链接）才需要外面包一层。
                  照抄会造成 <a> 嵌套 <a>，触发 hydration 失败。 */}
              <Logo id="footer-logo" />
            </div>
            <div className="text-sm text-muted-foreground">
              <Link className="text-muted-foreground hover:text-foreground transition duration-150 ease-in-out" href="/terms">
                {t((m) => m.footer.terms)}
              </Link>
              {" · "}
              <Link className="text-muted-foreground hover:text-foreground transition duration-150 ease-in-out" href="/privacy">
                {t((m) => m.footer.privacy)}
              </Link>
            </div>
          </div>

          {/* 2-N. 链接列（空数组的列不渲染） */}
          {footerColumns.map((col) =>
            col.links.length > 0 ? (
              <div key={col.title} className="sm:col-span-6 md:col-span-3 lg:col-span-2">
                <h6 className="text-foreground font-medium mb-2">{col.title}</h6>
                <ul className="text-sm">
                  {col.links.map((link) => (
                    <li key={link.label} className="mb-2">
                      <Link className="text-muted-foreground hover:text-foreground transition duration-150 ease-in-out" href={link.href}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null
          )}

          {/* 末列：订阅 */}
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-3">
            <h6 className="text-foreground font-medium mb-2">{t((m) => m.footer.subscribe)}</h6>
            <p className="text-sm text-muted-foreground mb-2">{t((m) => m.footer.subscribeBlurb)}</p>
            <SubscribeBox />
          </div>
        </div>

        {/* 底部：社交 + 版权 */}
        <div className="md:flex md:items-center md:justify-between py-4 md:py-8 border-t border-border">
          <ul className="flex mb-4 md:order-1 md:ml-4 md:mb-0">
            {socials.map((s, i) => (
              <li key={s.label} className={i === 0 ? "" : "ml-4"}>
                <a
                  className="flex justify-center items-center text-muted-foreground hover:text-foreground bg-card hover:bg-muted rounded-full shadow transition duration-150 ease-in-out"
                  href="#0"
                  aria-label={s.label}
                >
                  <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <path d={s.path} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
          <div className="text-sm text-muted-foreground mr-4">{t((m) => m.footer.copyright)}</div>
        </div>
      </div>
    </footer>
  );
}
