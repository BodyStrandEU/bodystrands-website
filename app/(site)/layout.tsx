import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsletterBanner from "@/components/NewsletterBanner";
import CookieConsent from "@/components/CookieConsent";
import FloatingDMButton from "@/components/FloatingDMButton";
import TrustBar from "@/components/TrustBar";
import EmailCapturePopup from "@/components/EmailCapturePopup";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <TrustBar />
      <main className="flex-1">{children}</main>
      <NewsletterBanner />
      <Footer />
      <CookieConsent />
      <FloatingDMButton />
      <EmailCapturePopup />
    </div>
  );
}
