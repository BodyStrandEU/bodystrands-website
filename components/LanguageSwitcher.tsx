"use client";

import { useEffect, useRef, useState } from "react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "nl", label: "Nederlands" },
];

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function setLanguage(code: string) {
  // Switching back to English used to try deleting the cookie, but Google's widget
  // sets it across domain variants we weren't all clearing, so a stale copy survived
  // and kept re-translating to the old language. Setting an explicit "/en/en" (translate
  // English -> English, i.e. a no-op) is unambiguous and sidesteps that entirely.
  const value = `/en/${code}`;
  const host = window.location.hostname;
  const bareHost = host.replace(/^www\./, "");
  const domains = Array.from(new Set(["", host, `.${host}`, bareHost, `.${bareHost}`]));

  for (const d of domains) {
    const domainAttr = d ? `;domain=${d}` : "";
    document.cookie = `googtrans=;path=/${domainAttr};max-age=0`;
  }
  for (const d of domains) {
    const domainAttr = d ? `;domain=${d}` : "";
    document.cookie = `googtrans=${value};path=/${domainAttr}`;
  }
  window.location.reload();
}

export default function LanguageSwitcher({ light }: { light?: boolean }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("en");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cookie = getCookie("googtrans");
    const lang = cookie?.split("/")[2];
    if (lang) setCurrent(lang);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    // translate="no" + notranslate: Google Translate must never touch this subtree.
    // If it rewrites these text nodes (translating "English" -> "Anglais" etc.), it
    // conflicts with React's own DOM reconciliation and the toggle stops responding
    // after the first switch — so this isn't cosmetic, it's what keeps it clickable.
    <div ref={ref} className="relative notranslate" translate="no">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Change language"
        className={`flex items-center gap-1 text-[0.6rem] tracking-[0.18em] uppercase transition-colors duration-200 ${
          light ? "text-[#FDF9F7] hover:text-white" : "text-[#2C2220] hover:text-[#A0622A]"
        }`}
      >
        {current.toUpperCase()}
        <span className={`text-[0.45rem] transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      <div
        className={`absolute top-full right-0 mt-3 w-40 bg-[#FDF9F7] border border-[#E8B4A8]/40 shadow-[0_18px_50px_-12px_rgba(44,34,32,0.25)] transition-all duration-200 ease-out z-50 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            onClick={() => setLanguage(l.code)}
            className={`block w-full text-left px-4 py-2 text-[0.62rem] tracking-[0.06em] transition-colors duration-150 hover:bg-[#F5EDE8]/60 ${
              current === l.code ? "text-[#A0622A]" : "text-[#8C7B6E]"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}
