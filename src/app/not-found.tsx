import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NotFoundContent from "@/components/NotFoundContent";

/** Global 404 — rendered for any unmatched route. */
export default function NotFound() {
  return (
    <>
      <Header />
      <main className="grow">
        <NotFoundContent />
      </main>
      <Footer />
    </>
  );
}
