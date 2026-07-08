"use client";

import { useEffect, useState } from "react";

const WHATSAPP_NUMBER = "351935483918"; // +351 935 483 918 — Bodystrands Business
const WHATSAPP_MESSAGE = "Hi! I have a question about a Bodystrands piece.";
const COOKIE_STORAGE_KEY = "bs_cookie_consent";

function WhatsAppGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="currentColor">
      <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.386.703 4.608 1.912 6.47L4 29l7.72-1.874A11.93 11.93 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm7.02 16.94c-.297.836-1.47 1.53-2.4 1.72-.638.13-1.47.234-4.27-.916-3.58-1.47-5.885-5.09-6.063-5.327-.17-.237-1.454-1.937-1.454-3.695 0-1.758.92-2.62 1.246-2.978.297-.324.65-.405.867-.405.217 0 .434.002.624.011.2.01.469-.076.734.56.297.71.9 2.246.978 2.41.077.163.128.353.026.567-.102.216-.153.35-.303.54-.153.19-.32.424-.457.57-.153.163-.31.34-.133.667.176.324.786 1.298 1.686 2.102 1.16 1.033 2.138 1.353 2.463 1.505.325.153.514.128.703-.076.19-.203.816-.951 1.036-1.278.216-.325.436-.27.734-.163.297.109 1.882.888 2.204 1.05.325.163.541.244.622.38.08.135.08.78-.216 1.616Z" />
    </svg>
  );
}

export default function FloatingDMButton() {
  // The cookie consent banner is a full-width bar pinned to the bottom (z-50), which would
  // otherwise cover this button entirely on first visit — lift the button above it until resolved.
  const [cookieBannerShowing, setCookieBannerShowing] = useState(false);

  useEffect(() => {
    setCookieBannerShowing(!localStorage.getItem(COOKIE_STORAGE_KEY));
    const onResolved = () => setCookieBannerShowing(false);
    window.addEventListener("bs:cookie-consent-resolved", onResolved);
    return () => window.removeEventListener("bs:cookie-consent-resolved", onResolved);
  }, []);

  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={`group fixed right-6 z-40 flex items-center transition-[bottom] duration-300 ${
        cookieBannerShowing ? "bottom-28 md:bottom-24" : "bottom-6"
      }`}
    >
      {/* Pulse ring — draws the eye without being obnoxious */}
      <span className="absolute inset-0 rounded-full bg-[#2C2220]/40 animate-ping-slow" />

      {/* Hover tooltip */}
      <span className="absolute right-full mr-3 whitespace-nowrap bg-[#2C2220] text-[#FDF9F7] text-[0.6rem] tracking-[0.1em] uppercase px-3 py-2 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none">
        Chat with us
      </span>

      {/* Button */}
      <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#2C2220] text-[#FDF9F7] shadow-[0_8px_24px_rgba(44,34,32,0.35)] group-hover:bg-[#A0622A] transition-colors duration-300">
        <WhatsAppGlyph />
      </span>
    </a>
  );
}
