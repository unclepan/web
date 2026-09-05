import type { Metadata } from "next";
import ResourcesContent from "./components/ResourcesContent";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Curated guides, tools, and templates to help you design better surveys and get more from your response data.",
};

/** Resources — body lives in `ResourcesContent` (client, i18n-aware). */
export default function ResourcesPage() {
  return <ResourcesContent />;
}
