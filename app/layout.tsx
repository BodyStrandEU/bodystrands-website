import type { Metadata } from "next";
import { Cormorant_Garamond, Josefin_Sans } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import CustomCursor from "@/components/CustomCursor";
import AnalyticsPageview from "@/components/AnalyticsPageview";
import GoogleTranslateLoader from "@/components/GoogleTranslateLoader";
import { CartProvider } from "@/lib/cart";
import { CurrencyProvider } from "@/lib/currency-context";
import { fetchExchangeRates } from "@/lib/currency";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
});

const josefin = Josefin_Sans({
  variable: "--font-josefin",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "600"],
});

export const metadata: Metadata = {
  title: "Bodystrands — Handmade Body Jewelry",
  description: "Dainty handmade body chains, waist chains, and anklets. Crafted in high-quality stainless steel. Tarnish-resistant, waterproof, and adjustable.",
  keywords: "body chain, waist chain, anklet, handmade jewelry, body jewelry, gold body chain, stainless steel body chain, dainty body jewelry",
  metadataBase: new URL("https://www.bodystrands.com"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Bodystrands — Handmade Body Jewelry",
    description: "Dainty handmade body chains, waist chains, and anklets. Crafted in high-quality stainless steel.",
    url: "https://www.bodystrands.com",
    siteName: "Bodystrands",
    locale: "en_US",
    type: "website",
    // Square goddess shoulder chain photo — the picture Google shows next to the site (user's choice, Oct 22, 2026)
    images: [{ url: "/images/og-goddess-shoulder-chain.jpg", width: 1200, height: 1200, alt: "Bodystrands handmade crossover shoulder chain" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bodystrands — Handmade Body Jewelry",
    description: "Dainty handmade body chains, waist chains, and anklets.",
    images: ["/images/og-goddess-shoulder-chain.jpg"],
  },
  // Lets Google show large photo previews in results and Discover (default is a small thumbnail)
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  verification: {
    google: "4wuuduuIvTMEvYh_KsNjBGLGBYV3B5yyXhA-jSURoUQ",
    // Pinterest website claim (Oct 2, 2026) — renders <meta name="p:domain_verify">.
    other: { "p:domain_verify": "07fab5b91327a4c64fcf7dd7387df72d" },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Cached fetch only (no cookies()/headers() here) — keeps the site's static/SSG
  // pages (product pages, blog posts, etc.) prerendered instead of forcing them dynamic.
  const rates = await fetchExchangeRates();

  return (
    <html lang="en" className={`${cormorant.variable} ${josefin.variable}`}>
      <body>
        {/* Consent defaults (Google Consent Mode v2) — see lib/consent.ts. EU/UK/CH visitors
            start denied until they press Accept; Google still gets anonymous cookieless pings.
            Everyone else starts granted and can opt out from "Cookie settings" in the footer.
            beforeInteractive scripts must be a normal child here, not wrapped in a
            manual <head> tag — Next.js hoists it into <head> itself. */}
        <Script id="consent-default" strategy="beforeInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          var bsRegion = (document.cookie.match(/(?:^|; )bs_region=([^;]+)/) || [])[1] || 'eu';
          var bsChoice = null; try { bsChoice = localStorage.getItem('bs_cookie_consent'); } catch (e) {}
          window.__bsConsent = bsChoice === 'granted' || (bsRegion === 'row' && bsChoice !== 'denied');
          var bsState = window.__bsConsent ? 'granted' : 'denied';
          gtag('consent', 'default', {
            analytics_storage: bsState,
            ad_storage: bsState,
            ad_user_data: bsState,
            ad_personalization: bsState,
            wait_for_update: 500
          });
          // Own visits: open any page once with ?internal=1 on each of your devices (?internal=0
          // undoes it). Those visits are tagged traffic_type=internal, which GA4's "Internal
          // traffic" data filter removes from reports once that filter is set to Active.
          try {
            var bsQ = new URLSearchParams(location.search).get('internal');
            if (bsQ === '1') localStorage.setItem('bs_internal', '1');
            if (bsQ === '0') localStorage.removeItem('bs_internal');
            if (localStorage.getItem('bs_internal') === '1') gtag('set', { traffic_type: 'internal' });
          } catch (e) {}
          gtag('set', 'ads_data_redaction', true);
          gtag('set', 'url_passthrough', true);
        `}</Script>
        <CurrencyProvider rates={rates}>
          <CartProvider>
            {children}
          </CartProvider>
        </CurrencyProvider>
        <CustomCursor />
        <GoogleTranslateLoader />

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

        {/* Site-level structured data */}
        <Script id="schema-org" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name:    "Bodystrands",
            url:     "https://www.bodystrands.com",
            logo:    "https://www.bodystrands.com/images/logo.png",
            image:   "https://www.bodystrands.com/images/og-goddess-shoulder-chain.jpg",
            description: "Handmade body jewelry crafted in high-quality stainless steel. Made in Portugal and Canada.",
            sameAs: ["https://www.instagram.com/bodystrandseu/", "https://www.facebook.com/profile.php?id=61595265520885"],
            contactPoint: { "@type": "ContactPoint", email: "info@bodystrands.com", contactType: "customer service" },
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

        {/* Microsoft Clarity — session recordings/heatmaps. Skips /admin so it never
            records customer PII (names, emails, addresses) visible in the orders panel. */}
        <Script id="ms-clarity" strategy="afterInteractive">{`
          window.__bsLoadClarity = function () {
            if (window.__bsClarityLoaded || window.location.pathname.startsWith('/admin')) return;
            window.__bsClarityLoaded = true;
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "xivm4b8y1m");
          };
          // Session recordings only with consent (CookieConsent calls this on Accept)
          if (window.__bsConsent) window.__bsLoadClarity();
        `}</Script>

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
          // No consent yet → the pixel holds everything until CookieConsent calls fbq('consent','grant')
          if (!window.__bsConsent) fbq('consent', 'revoke');
          fbq('init', '308224535511163');
          if (!window.location.pathname.startsWith('/admin')) {
            fbq('track', 'PageView');
          }
        `}</Script>
      </body>
    </html>
  );
}
