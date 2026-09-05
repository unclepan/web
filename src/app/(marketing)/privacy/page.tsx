import type { Metadata } from "next";
import PrivacyContent from "./components/PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How we handle your personal information.",
};

/** Privacy policy — body lives in `PrivacyContent` (client, i18n-aware). */
export default function PrivacyPage() {
  return (
    <section>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          <PrivacyContent />
        </div>
      </div>
    </section>
  );
}
