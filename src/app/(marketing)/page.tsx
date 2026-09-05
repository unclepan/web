import type { Metadata } from "next";
import HomeContent from "./components/HomeContent";

export const metadata: Metadata = {
  description:
    "Create and share online surveys in minutes. uicu helps you design questionnaires, collect responses, and analyze results with clear charts.",
};

/** Home page — body lives in `HomeContent` (client, i18n-aware). */
export default function HomePage() {
  return <HomeContent />;
}
