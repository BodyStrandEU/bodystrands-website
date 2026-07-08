import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsletterBanner from "@/components/NewsletterBanner";
import CookieConsent from "@/components/CookieConsent";
import FloatingDMButton from "@/components/FloatingDMButton";
import TrustBar from "@/components/TrustBar";
import EmailCapturePopup from "@/components/EmailCapturePopup";
import PageTransition from "@/components/PageTransition";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <TrustBar />
      {/* PageTransition's transform-based animation must stay scoped to page content only —
          wrapping fixed-position chrome below (cookie banner, WhatsApp widget, popups) in it
          would make it their containing block and break their viewport-fixed positioning. */}
      <main className="flex-1"><PageTransition>{children}</PageTransition></main>
      <NewsletterBanner />
      <Footer />
      <CookieConsent />
      <FloatingDMButton />
      <EmailCapturePopup />
    </div>
  );
}
