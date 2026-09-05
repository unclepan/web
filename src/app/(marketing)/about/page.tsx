import type { Metadata } from "next";
import AboutContent from "./components/AboutContent";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about uicu — why we built an online survey platform that makes creating, sharing, and analyzing questionnaires simple.",
};

/** About page — body lives in `AboutContent` (client, i18n-aware). */
export default function AboutPage() {
  return <AboutContent />;
}
