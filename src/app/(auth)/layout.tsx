import type { Metadata } from "next";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  robots: { index: false },
};

/** Layout for auth pages: header only (no footer). */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="grow">{children}</main>
    </>
  );
}
