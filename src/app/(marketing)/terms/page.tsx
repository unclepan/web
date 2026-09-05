import type { Metadata } from "next";
import TermsContent from "./components/TermsContent";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions of using this site.",
};

/** Terms & conditions — body lives in `TermsContent` (client, i18n-aware). */
export default function TermsPage() {
  return (
    <section>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          <TermsContent />
        </div>
      </div>
    </section>
  );
}
