"use client";

/**
 * 服务条款正文（i18n）。
 */

import { useLocale, format } from "@/i18n/useLocale";

const LAST_UPDATED_DATE = "May 2026";

export default function TermsContent() {
  const { t } = useLocale();

  return (
    <>
      <h1 className="h1 mb-6">{t((m) => m.terms.pageTitle)}</h1>

      <div className="max-w-none leading-relaxed">
        <p className="text-sm text-muted-foreground mb-6">
          {format(t((m) => m.terms.lastUpdated), { date: LAST_UPDATED_DATE })}
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-3">
          {t((m) => m.terms.section1Heading)}
        </h2>
        <p className="mb-4">{t((m) => m.terms.section1Body)}</p>

        <h2 className="text-2xl font-bold mt-8 mb-3">
          {t((m) => m.terms.section2Heading)}
        </h2>
        <p className="mb-4">{t((m) => m.terms.section2Body)}</p>

        <h2 className="text-2xl font-bold mt-8 mb-3">
          {t((m) => m.terms.section3Heading)}
        </h2>
        <p className="mb-4">{t((m) => m.terms.section3Body)}</p>

        <h2 className="text-2xl font-bold mt-8 mb-3">
          {t((m) => m.terms.section4Heading)}
        </h2>
        <p className="mb-4">{t((m) => m.terms.section4Body)}</p>

        <h2 className="text-2xl font-bold mt-8 mb-3">
          {t((m) => m.terms.section5Heading)}
        </h2>
        <p className="mb-4">{t((m) => m.terms.section5Body)}</p>

        <h2 className="text-2xl font-bold mt-8 mb-3">
          {t((m) => m.terms.section6Heading)}
        </h2>
        <p className="mb-4">{t((m) => m.terms.section6Body)}</p>
      </div>
    </>
  );
}
