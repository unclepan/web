"use client";

import Image from "next/image";
import { useLocale, format } from "@/i18n/useLocale";

/** Timeline item id — matches the `about.timeline` keys in the dictionaries. */
type TimelineId = "y2014" | "y2017" | "y2019" | "y2021";

type TimelineItem = {
  id: TimelineId;
};

type EcosystemTagColor = "indigo" | "teal" | "pink" | "purple";

type EcosystemTagId =
  | "tag1"
  | "tag2"
  | "tag3"
  | "tag4"
  | "tag5"
  | "tag6"
  | "tag7"
  | "tag8"
  | "tag9"
  | "tag10"
  | "tag11"
  | "tag12"
  | "tag13"
  | "tag14";

type EcosystemTag = {
  id: EcosystemTagId;
  color: EcosystemTagColor;
  /**
   * Vertical offset (`mt-*`) plus the `tags-N` stagger class that sets a
   * negative animation-delay. Horizontal position is owned entirely by the
   * `tagsmove` keyframes — never set `left` here.
   */
  position: string;
};

/** Gradient + dark-mode palette per colour family. */
const ECOSYSTEM_TAG_COLOR_CLASS: Record<EcosystemTagColor, string> = {
  indigo:
    "text-white dark:text-indigo-300 bg-gradient-to-tr from-indigo-500 to-indigo-400 dark:from-indigo-500/25 dark:to-indigo-400/25",
  teal: "text-white dark:text-teal-300 bg-gradient-to-tr from-teal-500 to-teal-400 dark:from-teal-500/25 dark:to-teal-400/25",
  pink: "text-white dark:text-pink-300 bg-gradient-to-tr from-pink-500 to-pink-400 dark:from-pink-500/25 dark:to-pink-400/25",
  purple:
    "text-white dark:text-purple-300 bg-gradient-to-tr from-purple-500 to-purple-400 dark:from-purple-500/25 dark:to-purple-400/25",
};

const ecosystemTags: EcosystemTag[] = [
  { id: "tag1", color: "indigo", position: "mt-28" },
  { id: "tag2", color: "teal", position: "tags-1 mt-72" },
  { id: "tag3", color: "pink", position: "tags-2 mt-40" },
  { id: "tag4", color: "indigo", position: "tags-3 mt-80 top-4" },
  { id: "tag5", color: "indigo", position: "tags-4 mt-56" },
  { id: "tag6", color: "pink", position: "tags-4" },
  { id: "tag7", color: "teal", position: "tags-5 mt-14" },
  { id: "tag8", color: "purple", position: "tags-5 mt-80 top-4" },
  { id: "tag9", color: "indigo", position: "tags-6 mt-40" },
  { id: "tag10", color: "indigo", position: "tags-7" },
  { id: "tag11", color: "pink", position: "tags-7 mt-72" },
  { id: "tag12", color: "purple", position: "tags-8 mt-28" },
  { id: "tag13", color: "teal", position: "tags-9 mt-80 top-4" },
  { id: "tag14", color: "teal", position: "tags-10 mt-56" },
];

const timelineItems: TimelineItem[] = [
  { id: "y2014" },
  { id: "y2017" },
  { id: "y2019" },
  { id: "y2021" },
];

/**
 * About page body — rendered inside the marketing layout
 * (which already provides Header / main / Footer).
 *
 * AOS is initialised globally by `AosInit` in the root layout, so this
 * component only needs the `data-aos` attributes.
 */
export default function AboutContent() {
  const { t } = useLocale();

  return (
    <>
      {/* Hero section */}
      <section className="relative">
        {/* Background image */}
        <div className="absolute inset-0 h-[32rem] pt-16 box-content -z-10">
          <Image
            src="/images/about-hero.jpg"
            alt={t((m) => m.about.heroImageAlt)}
            width={1440}
            height={577}
            className="absolute inset-0 w-full h-full object-cover opacity-25"
            priority
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-background"
            aria-hidden="true"
          />
        </div>

        {/* Hero content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="pt-32 pb-12 md:pt-40 md:pb-20">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="h1 mb-4" data-aos="fade-up">
                {t((m) => m.about.pageTitle)}
              </h1>
              <p
                className="text-xl text-muted-foreground"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                {t((m) => m.about.pageSubtitle)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team images */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="relative w-full h-0 pb-[75%]">
              <figure
                className="absolute h-auto"
                style={{ top: "45%", width: "41.67%", maxWidth: "320px" }}
                data-aos="fade-right"
              >
                <Image
                  src="/images/team-mosaic-02.jpg"
                  alt={format(t((m) => m.about.teamImageAlt), { index: 2 })}
                  width={320}
                  height={240}
                  className="w-full h-auto rounded shadow-lg"
                />
              </figure>
              <figure
                className="relative mx-auto h-auto"
                style={{ width: "78.13%", maxWidth: "600px" }}
                data-aos="fade-down"
                data-aos-delay="100"
              >
                <Image
                  src="/images/team-mosaic-01.jpg"
                  alt={format(t((m) => m.about.teamImageAlt), { index: 1 })}
                  width={600}
                  height={338}
                  className="w-full h-auto rounded shadow-lg"
                />
              </figure>
              <figure
                className="absolute h-auto"
                style={{
                  top: "8.5%",
                  right: 0,
                  width: "32.55%",
                  maxWidth: "250px",
                }}
                data-aos="fade-left"
                data-aos-delay="200"
              >
                <Image
                  src="/images/team-mosaic-03.jpg"
                  alt={format(t((m) => m.about.teamImageAlt), { index: 3 })}
                  width={250}
                  height={188}
                  className="w-full h-auto rounded shadow-lg"
                />
              </figure>
              <figure
                className="absolute h-auto"
                style={{
                  bottom: 0,
                  right: "20%",
                  width: "25.52%",
                  maxWidth: "196px",
                }}
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <Image
                  src="/images/team-mosaic-04.jpg"
                  alt={format(t((m) => m.about.teamImageAlt), { index: 4 })}
                  width={196}
                  height={196}
                  className="w-full h-auto rounded shadow-lg"
                />
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="py-12 md:py-20">
            {/* Section header */}
            <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
              <h2 className="h2 mb-4">{t((m) => m.about.timelineTitle)}</h2>
              <p className="text-xl text-muted-foreground">
                {t((m) => m.about.timelineSubtitle)}
              </p>
            </div>

            {/* Items */}
            <div
              className="max-w-3xl mx-auto -my-4 md:-my-6"
              data-aos-id-timeline
            >
              {timelineItems.map((item, index) => {
                const isLast = index === timelineItems.length - 1;
                return (
                  <div
                    key={item.id}
                    className="relative py-4 md:py-6 pl-28"
                    data-aos="fade-up"
                    data-aos-delay={index * 200}
                    data-aos-anchor="[data-aos-id-timeline]"
                  >
                    <div className="pl-2">
                      <div className="text-xl text-blue-600 dark:text-blue-300 dark:text-blue-400 mb-2">
                        {t((m) => m.about.timeline[item.id].label)}
                      </div>
                      <div className="flex items-center mb-3">
                        <div className="absolute left-0 inline-flex text-sm font-semibold py-1 px-3 text-green-700 dark:text-green-300 bg-green-500/20 dark:text-green-400 dark:bg-green-900/40 rounded-full">
                          {t((m) => m.about.timeline[item.id].year)}
                        </div>
                        {!isLast && (
                          <div
                            className="absolute left-0 h-full px-px bg-border ml-26 self-start transform -translate-x-1/2 translate-y-3"
                            aria-hidden="true"
                          />
                        )}
                        <div
                          className="absolute left-0 w-2 h-2 bg-blue-600 dark:bg-blue-500 border-4 box-content border-background rounded-full ml-26 transform -translate-x-1/2"
                          aria-hidden="true"
                        />
                        <h4 className="h4">
                          {t((m) => m.about.timeline[item.id].title)}
                        </h4>
                      </div>
                      <p className="text-lg text-muted-foreground">
                        {t((m) => m.about.timeline[item.id].description)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Custom built ecosystem */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="py-12 md:py-20 border-t border-border">
            <div className="max-w-3xl mx-auto text-center pb-12 md:pb-16">
              <h2 className="h2 mb-4">{t((m) => m.about.ecosystemTitle)}</h2>
              <p className="text-xl text-muted-foreground">
                {t((m) => m.about.ecosystemSubtitle)}
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              {/* 768px track — tags fly across the full width, the 432px
                  circle stays centred in the middle of it */}
              <div className="relative flex justify-center items-center overflow-hidden">
                {/* Concentric circles — light mode */}
                <svg
                  className="shrink-0 dark:hidden"
                  width="432"
                  height="432"
                  viewBox="0 0 432 432"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    <radialGradient
                      cx="50%"
                      cy="50%"
                      fx="50%"
                      fy="50%"
                      r="48.919%"
                      id="about-circle-light"
                    >
                      <stop stopColor="#B2F5EA" stopOpacity=".64" offset="0%" />
                      <stop stopColor="#B2F5EA" stopOpacity="0" offset="100%" />
                    </radialGradient>
                  </defs>
                  <g fill="none" fillRule="evenodd">
                    <circle fill="url(#about-circle-light)" cx="216" cy="216" r="216" />
                    <g transform="translate(22 22)" stroke="#1D1D20">
                      <circle strokeOpacity=".04" cx="194" cy="194" r="193.5" />
                      <circle strokeOpacity=".08" strokeWidth="2" cx="194" cy="194" r="153" />
                      <circle strokeOpacity=".16" strokeWidth="2.5" cx="194" cy="194" r="112.75" />
                    </g>
                  </g>
                </svg>

                {/* Concentric circles — dark mode */}
                <svg
                  className="shrink-0 hidden dark:block"
                  width="432"
                  height="432"
                  viewBox="0 0 432 432"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    <radialGradient
                      cx="50%"
                      cy="50%"
                      fx="50%"
                      fy="50%"
                      r="50%"
                      id="about-circle-dark"
                    >
                      <stop stopColor="#1D1D21" stopOpacity="0" offset="0%" />
                      <stop stopColor="#2E2E33" stopOpacity=".32" offset="100%" />
                    </radialGradient>
                  </defs>
                  <circle cx="216" cy="216" r="216" fill="url(#about-circle-dark)" fillRule="evenodd" />
                </svg>

                {/* Tag cloud */}
                <div className="absolute inset-0">
                  {ecosystemTags.map((tag) => (
                    <div
                      key={tag.id}
                      className={`absolute font-medium px-4 py-2 rounded-full inline-flex items-center justify-center tags-animation ${ECOSYSTEM_TAG_COLOR_CLASS[tag.color]} ${tag.position}`}
                    >
                      {t((m) => m.about.ecosystemTags[tag.id])}
                    </div>
                  ))}
                </div>

                {/* Centre disc */}
                <svg
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-xl dark:hidden"
                  width="148"
                  height="148"
                  viewBox="0 0 148 148"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <circle cx="74" cy="74" r="74" fill="#FFFFFF" fillRule="evenodd" />
                </svg>
                <svg
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-xl hidden dark:block"
                  width="148"
                  height="148"
                  viewBox="0 0 148 148"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <circle cx="74" cy="74" r="74" fill="#2E2E33" fillRule="evenodd" />
                </svg>

                {/* Spinning logo */}
                <svg
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 animate-spin"
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient x1="26%" y1="100%" x2="100%" y2="100%" id="about-logo-a">
                      <stop stopColor="#3ABAB4" offset="0%" />
                      <stop stopColor="#7F9CF5" offset="100%" />
                    </linearGradient>
                    <linearGradient x1="26%" y1="100%" x2="100%" y2="100%" id="about-logo-b">
                      <stop stopColor="#3ABAB4" offset="0%" />
                      <stop stopColor="#3ABAB4" stopOpacity="0" offset="100%" />
                    </linearGradient>
                  </defs>
                  <path d="M32 16h-8a8 8 0 10-16 0H0C0 7.163 7.163 0 16 0s16 7.163 16 16z" fill="url(#about-logo-a)" />
                  <path d="M32 16c0 8.837-7.163 16-16 16S0 24.837 0 16h8a8 8 0 1016 0h8z" fill="url(#about-logo-b)" />
                </svg>

                {/* Edge fades */}
                <div
                  className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-background"
                  aria-hidden="true"
                />
                <div
                  className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-l from-background"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
