import type { Metadata } from "next";
import { Cormorant_Garamond, Josefin_Sans } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import PageTransition from "@/components/PageTransition";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
});

const josefin = Josefin_Sans({
  variable: "--font-josefin",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400"],
});

export const metadata: Metadata = {
  title: "Bodystrands — Handmade Body Jewelry",
  description: "Dainty handmade body chains, waist chains, and anklets. Crafted in 316L surgical-grade stainless steel. Tarnish-resistant, waterproof, and adjustable.",
  keywords: "body chain, waist chain, anklet, handmade jewelry, body jewelry, gold body chain, stainless steel body chain, dainty body jewelry",
  metadataBase: new URL("https://www.bodystrands.com"),
  openGraph: {
    title: "Bodystrands — Handmade Body Jewelry",
    description: "Dainty handmade body chains, waist chains, and anklets. Crafted in 316L surgical-grade stainless steel.",
    url: "https://www.bodystrands.com",
    siteName: "Bodystrands",
    locale: "en_US",
    type: "website",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630, alt: "Bodystrands — Handmade Body Jewelry" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bodystrands — Handmade Body Jewelry",
    description: "Dainty handmade body chains, waist chains, and anklets.",
    images: ["/images/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${josefin.variable}`}>
      <head>
        {/* Step 1: set consent defaults BEFORE GA loads — nothing is tracked until user accepts */}
        <Script id="consent-default" strategy="beforeInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            wait_for_update: 500
          });
        `}</Script>
      </head>
      <body>
        <PageTransition>{children}</PageTransition>

        {/* Step 2: load GA after page is interactive */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8ZSFBD94RN"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-8ZSFBD94RN', { send_page_view: true });
        `}</Script>
      </body>
    </html>
  );
}
