"use client";

/**
 * 隐私政策正文（i18n）。
 */

import { useLocale, format } from "@/i18n/useLocale";

const LAST_UPDATED_DATE = "May 2026";

export default function PrivacyContent() {
  const { t } = useLocale();

  return (
    <>
      <h1 className="h1 mb-6">{t((m) => m.privacy.pageTitle)}</h1>

      <div className="max-w-none leading-relaxed">
        <p className="text-sm text-muted-foreground mb-6">
          {format(t((m) => m.privacy.lastUpdated), {
            date: LAST_UPDATED_DATE,
          })}
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-3">
          {t((m) => m.privacy.section1Heading)}
        </h2>
        <p className="mb-4">{t((m) => m.privacy.section1Body)}</p>

        <h2 className="text-2xl font-bold mt-8 mb-3">
          {t((m) => m.privacy.section2Heading)}
        </h2>
        <p className="mb-4">{t((m) => m.privacy.section2Intro)}</p>
        <ul className="list-disc ml-6 mb-4 space-y-1">
          <li>{t((m) => m.privacy.section2Item1)}</li>
          <li>{t((m) => m.privacy.section2Item2)}</li>
          <li>{t((m) => m.privacy.section2Item3)}</li>
        </ul>
        <p className="mb-4">{t((m) => m.privacy.section2Outro)}</p>

        <h2 className="text-2xl font-bold mt-8 mb-3">
          {t((m) => m.privacy.section3Heading)}
        </h2>
        <p className="mb-4">
          {t((m) => m.privacy.section3BodyPart1)}
          <code className="px-1.5 py-0.5 mx-1 rounded bg-muted text-sm">
            session_token
          </code>
          {t((m) => m.privacy.section3BodyPart2)}
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-3">
          {t((m) => m.privacy.section4Heading)}
        </h2>
        <p className="mb-4">{t((m) => m.privacy.section4Body)}</p>

        <h2 className="text-2xl font-bold mt-8 mb-3">
          {t((m) => m.privacy.section5Heading)}
        </h2>
        <p className="mb-4">{t((m) => m.privacy.section5Body)}</p>
      </div>
    </>
  );
}
