"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { CONSENT_KEY, readRegion, readChoice } from "@/lib/consent";

// Shown only to EU/EEA, UK and Swiss visitors who haven't answered yet (see lib/consent.ts).
// Accept and Decline are equally easy to reach — EU law requires saying no to be as easy as
// saying yes. "Cookie settings" in the footer reopens it for anyone, anywhere.

type W = Window & {
  gtag?: (...a: unknown[]) => void;
  fbq?: (...a: unknown[]) => void;
  __bsLoadClarity?: () => void;
};

function applyConsent(granted: boolean) {
  const w = window as W;
  const state = granted ? "granted" : "denied";
  w.gtag?.("consent", "update", {
    analytics_storage: state,
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
  });
  w.fbq?.("consent", granted ? "grant" : "revoke");
  // No page view re-sent here: Google already got this visit as a cookieless ping, and the
  // Meta pixel releases the events it held while consent was revoked — re-sending double counts.
  if (granted) w.__bsLoadClarity?.();
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (readRegion() === "eu" && readChoice() === null) setVisible(true);
    const reopen = () => setVisible(true);
    window.addEventListener("bs:open-cookie-settings", reopen);
    return () => window.removeEventListener("bs:open-cookie-settings", reopen);
  }, []);

  function choose(granted: boolean) {
    try { localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied"); } catch {}
    applyConsent(granted);
    setVisible(false);
    window.dispatchEvent(new Event("bs:cookie-consent-resolved"));
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#2C2220] text-[#E8B4A8] shadow-2xl"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 justify-between">
        <p className="text-[0.7rem] font-light tracking-wide leading-relaxed text-[#E8B4A8]/85 max-w-xl">
          We&apos;re a small studio, and cookies help us see which pieces you love so we can make more of them.
          Is that okay?{" "}
          <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-[#E8B4A8] transition-colors">
            Privacy Policy
          </Link>
        </p>

        <div className="grid grid-cols-2 gap-3 flex-shrink-0 sm:w-72">
          <button
            onClick={() => choose(false)}
            className="min-h-[44px] text-[0.6rem] tracking-[0.2em] uppercase border border-[#E8B4A8]/40 text-[#E8B4A8] px-5 hover:border-[#E8B4A8] transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => choose(true)}
            className="min-h-[44px] text-[0.6rem] tracking-[0.2em] uppercase bg-[#A0622A] text-[#FDF9F7] px-5 hover:bg-[#8A5222] transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
