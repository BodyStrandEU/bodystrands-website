import type { Metadata } from "next";
import { Cormorant_Garamond, Josefin_Sans } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import PageTransition from "@/components/PageTransition";
import CustomCursor from "@/components/CustomCursor";
import AnalyticsPageview from "@/components/AnalyticsPageview";
import { CartProvider } from "@/lib/cart";

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
  alternates: { canonical: "/" },
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
  verification: { google: "4wuuduuIvTMEvYh_KsNjBGLGBYV3B5yyXhA-jSURoUQ" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${josefin.variable}`}>
      <head>
        {/* Consent defaults: analytics on by default (opt-out), ads always off */}
        <Script id="consent-default" strategy="beforeInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            analytics_storage: 'granted',
            ad_storage: 'denied',
            wait_for_update: 300
          });
        `}</Script>
      </head>
      <body>
        <CartProvider>
          <PageTransition>{children}</PageTransition>
        </CartProvider>
        <CustomCursor />

        {/* Step 2: load GA after page is interactive */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8ZSFBD94RN"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-8ZSFBD94RN', { send_page_view: false });
        `}</Script>
        {/* Manual pageview firing (AnalyticsPageview) skips /admin routes so internal usage never pollutes reporting */}
        <AnalyticsPageview />
        <Analytics />

        {/* Site-level structured data */}
        <Script id="schema-org" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name:    "Bodystrands",
            url:     "https://www.bodystrands.com",
            logo:    "https://www.bodystrands.com/images/logo.png",
            description: "Handmade body jewelry crafted in 316L surgical-grade stainless steel. Made in Portugal.",
            sameAs: ["https://www.instagram.com/bodystrands/"],
            contactPoint: { "@type": "ContactPoint", email: "hello@bodystrands.com", contactType: "customer service" },
          },
          {
            "@context": "https://schema.org",
            "@type":    "WebSite",
            name:       "Bodystrands",
            url:        "https://www.bodystrands.com",
            potentialAction: {
              "@type":       "SearchAction",
              target:        "https://www.bodystrands.com/shop?search={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          },
        ]) }} />

        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1921612571995204');
          if (!window.location.pathname.startsWith('/admin')) {
            fbq('track', 'PageView');
          }
        `}</Script>
        <noscript>{`<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1921612571995204&ev=PageView&noscript=1"/>`}</noscript>
      </body>
    </html>
  );
}
