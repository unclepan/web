import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics",
  robots: { index: false },
};

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
