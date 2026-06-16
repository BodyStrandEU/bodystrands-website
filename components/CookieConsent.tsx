"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "bs_cookie_consent";

function grantAnalytics() {
  if (typeof window !== "undefined" && typeof (window as { gtag?: Function }).gtag === "function") {
    (window as { gtag: Function }).gtag("consent", "update", {
      analytics_storage: "granted",
    });
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "granted") {
      grantAnalytics();
    } else if (!stored) {
      setVisible(true);
    }
    // "denied" → banner stays hidden, GA stays blocked
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "granted");
    grantAnalytics();
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "denied");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#2C2220] text-[#E8B4A8] shadow-2xl"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <p className="text-[0.65rem] font-light tracking-wide leading-relaxed text-[#E8B4A8]/80 max-w-xl">
          We use cookies to understand how visitors use our site and improve your experience.
          See our{" "}
          <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-[#E8B4A8] transition-colors">
            Privacy Policy
          </Link>
          .
        </p>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={decline}
            className="text-[0.6rem] tracking-[0.2em] uppercase text-[#E8B4A8]/50 hover:text-[#E8B4A8]/80 transition-colors px-3 py-2"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="text-[0.6rem] tracking-[0.2em] uppercase bg-[#A0622A] text-[#FDF9F7] px-5 py-2.5 hover:bg-[#8A5222] transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
