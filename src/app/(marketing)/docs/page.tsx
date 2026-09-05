import type { Metadata } from "next";
import DocsIndexContent from "./components/DocsIndexContent";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Browse the documentation library by category, or search for a specific article.",
};

/** Docs index — body lives in `DocsIndexContent` (client, i18n-aware). */
export default function DocsPage() {
  return <DocsIndexContent />;
}
