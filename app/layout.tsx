import type { Metadata } from "next";
import { Cormorant_Garamond, Josefin_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Script from "next/script";

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
  title: "Body Strands — Handmade Body Jewelry",
  description: "Dainty handmade body chains, waist chains, and anklets. Crafted in 316L surgical-grade stainless steel. Tarnish-resistant, waterproof, and adjustable.",
  keywords: "body chain, waist chain, anklet, handmade jewelry, body jewelry, gold body chain, stainless steel body chain, dainty body jewelry",
  metadataBase: new URL("https://www.bodystrands.com"),
  openGraph: {
    title: "Body Strands — Handmade Body Jewelry",
    description: "Dainty handmade body chains, waist chains, and anklets. Crafted in 316L surgical-grade stainless steel.",
    url: "https://www.bodystrands.com",
    siteName: "Bodystrands",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Body Strands — Handmade Body Jewelry",
    description: "Dainty handmade body chains, waist chains, and anklets.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${josefin.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8ZSFBD94RN"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8ZSFBD94RN');
          `}
        </Script>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
