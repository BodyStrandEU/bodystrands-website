"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

// Mounted once (in app/layout.tsx) — loads the Google Translate engine that
// LanguageSwitcher's toggle drives via the googtrans cookie.
export default function GoogleTranslateLoader() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null; // never translate the owner's dashboard

  return (
    <>
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
      <Script id="google-translate-init" strategy="afterInteractive">
        {`
          function googleTranslateElementInit() {
            new google.translate.TranslateElement(
              { pageLanguage: "en", autoDisplay: false },
              "google_translate_element"
            );
          }
        `}
      </Script>
      <div id="google_translate_element" className="hidden" />
    </>
  );
}
