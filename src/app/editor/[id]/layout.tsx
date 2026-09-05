import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editor",
  robots: { index: false },
};

export default function EditorIdLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
