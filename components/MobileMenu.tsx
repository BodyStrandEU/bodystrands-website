"use client";

// Full-screen phone menu (SKIMS-style): large readable rows, collapsible sections, nothing of
// the page showing behind it. Portalled to <body> because the fixed header is transformed,
// which would otherwise trap position:fixed (same reason as CartDrawer).

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { INSTAGRAM_URL, FACEBOOK_URL } from "@/lib/social";

type NavLink = { href: string; label: string };

const COLLECTIONS: NavLink[] = [
  { href: "/bridal", label: "Bridal" },
  { href: "/personalized", label: "Personalized" },
  { href: "/plus-size", label: "Plus Size" },
  { href: "/men", label: "Men" },
];

const GIFTS: NavLink[] = [
  { href: "/gifts#under-25", label: "Gifts Under €25" },
  { href: "/gifts#under-40", label: "Gifts Under €40" },
  { href: "/christmas", label: "Christmas" },
  { href: "/gifts#confirmation", label: "Confirmation & Communion" },
  { href: "/gifts", label: "All Gifts" },
];

const HELP: NavLink[] = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/track", label: "Track Your Order" },
  { href: "/shipping", label: "Shipping & Returns" },
  { href: "/size-guide", label: "Size Guide" },
  { href: "/care", label: "Jewelry Care" },
  { href: "/faq", label: "FAQ" },
];

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden
      className={`flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

const rowCls = "w-full min-h-[58px] flex items-center justify-between gap-4 border-b border-[#E8B4A8]/30 text-left";
// SKIMS-style: smaller, bold rows in the brand sans (Josefin Sans 600); the serif stays for the logo
const mainText = "text-[1rem] font-semibold tracking-[0.04em] text-[#2C2220] pt-0.5";
const smallText = "text-[0.72rem] font-semibold tracking-[0.18em] uppercase text-[#2C2220] pt-0.5";

function Section({ title, links, onNavigate, small = false }: { title: string; links: NavLink[]; onNavigate: () => void; small?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className={`${rowCls} ${small ? "min-h-[52px]" : ""}`}>
        <span className={small ? smallText : mainText}>{title}</span>
        <Chevron open={open} />
      </button>
      {open && (
        <ul className="py-2 border-b border-[#E8B4A8]/30">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} onClick={onNavigate}
                className="flex items-center min-h-[44px] pl-1 text-[0.9rem] font-normal tracking-[0.03em] text-[#2C2220]/80 hover:text-[#A0622A] transition-colors pt-0.5">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Row({ href, children, onNavigate, accent = false }: { href: string; children: ReactNode; onNavigate: () => void; accent?: boolean }) {
  return (
    <Link href={href} onClick={onNavigate} className={rowCls}>
      <span className={`${mainText} ${accent ? "!text-[#A0622A]" : ""}`}>{children}</span>
    </Link>
  );
}

export default function MobileMenu({ open, onClose, categories }: { open: boolean; onClose: () => void; categories: string[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Lock the page behind, and tell the floating WhatsApp button to step aside
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.dataset.menuOpen = "1";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      delete document.body.dataset.menuOpen;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const categoryLinks: NavLink[] = [
    ...categories.map((c) => ({ href: `/shop?category=${encodeURIComponent(c)}`, label: c })),
  ];

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-[1000] bg-[#FDF9F7] flex flex-col animate-page-in md:hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 h-20 border-b border-[#E8B4A8]/30 flex-shrink-0">
        <Link href="/" onClick={onClose} aria-label="Bodystrands home">
          <Image src="/images/logo.png" alt="Bodystrands" width={1802} height={169} className="h-4 w-auto object-contain" />
        </Link>
        <button type="button" onClick={onClose} aria-label="Close menu" className="w-11 h-11 -mr-2 flex items-center justify-center text-[#2C2220]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-6 pb-10">
        <Row href="/shop" onNavigate={onClose}>Shop All</Row>
        <Section title="Shop by Category" links={categoryLinks} onNavigate={onClose} />
        <Section title="Collections" links={COLLECTIONS} onNavigate={onClose} />
        <Section title="Gifts" links={GIFTS} onNavigate={onClose} />
        <Row href="/sales" onNavigate={onClose} accent>Sale</Row>
        <Row href="/blog" onNavigate={onClose}>Journal</Row>

        <div className="mt-8">
          <Section title="Help" links={HELP} onNavigate={onClose} small />
          <div className="min-h-[52px] flex items-center justify-between border-b border-[#E8B4A8]/30">
            <span className={smallText}>Language</span>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Social */}
        <div className="mt-10 flex items-center justify-center gap-8 text-[#2C2220]">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Bodystrands on Instagram" className="w-11 h-11 flex items-center justify-center hover:text-[#A0622A] transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" /></svg>
          </a>
          <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Bodystrands on Facebook" className="w-11 h-11 flex items-center justify-center hover:text-[#A0622A] transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
          </a>
        </div>
      </nav>
    </div>,
    document.body
  );
}
