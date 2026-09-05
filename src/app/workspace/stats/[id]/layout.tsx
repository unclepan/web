import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Survey Analytics",
  robots: { index: false },
};

export default function SurveyStatsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
