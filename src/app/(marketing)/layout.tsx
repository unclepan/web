import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

/** Layout for marketing/content pages: header + footer. */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="grow">{children}</main>
      <Footer />
    </>
  );
}
