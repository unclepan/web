import type { Metadata } from "next";
import NotFoundContent from "@/components/NotFoundContent";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false },
};

/** Deliberate `/404` route mirroring the original `404.html`. */
export default function NotFoundPage() {
  return <NotFoundContent />;
}
