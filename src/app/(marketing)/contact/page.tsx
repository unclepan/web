import type { Metadata } from "next";
import ContactContent from "./components/ContactContent";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the uicu team — ask questions, share feedback, or get help with your surveys.",
};

/** Contact page — body lives in `ContactContent` (client, i18n-aware). */
export default function ContactPage() {
  return <ContactContent />;
}
