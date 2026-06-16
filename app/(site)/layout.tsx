import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsletterBanner from "@/components/NewsletterBanner";
import CookieConsent from "@/components/CookieConsent";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <NewsletterBanner />
      <Footer />
      <CookieConsent />
    </div>
  );
}
