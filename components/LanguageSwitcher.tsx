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
  const value = code === "en" ? "" : `/en/${code}`;
  const host = window.location.hostname;
  // clear + set on both bare host and dotted domain so the widget reliably picks it up
  document.cookie = `googtrans=;path=/;max-age=0`;
  document.cookie = `googtrans=;path=/;domain=.${host};max-age=0`;
  if (value) {
    document.cookie = `googtrans=${value};path=/`;
    document.cookie = `googtrans=${value};path=/;domain=.${host}`;
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
    <div ref={ref} className="relative">
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
