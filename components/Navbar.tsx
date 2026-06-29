"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { activeCategories } from "@/lib/products";
import SearchModal from "@/components/SearchModal";
import CartIcon from "@/components/CartIcon";

export default function Navbar() {
  const pathname = usePathname();
  const isHero = pathname === "/"; // only homepage has a dark full-bleed hero behind the nav

  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [shopOpen,    setShopOpen]    = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShopOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const pages = [
    { href: "/blog", label: "Journal" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  // Split active categories into two columns
  const col1 = activeCategories.slice(0, Math.ceil(activeCategories.length / 2));
  const col2 = activeCategories.slice(Math.ceil(activeCategories.length / 2));

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Announcement bar */}
      <div
        className={`bg-[#2C2220] overflow-hidden transition-all duration-300 ${
          scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100"
        }`}
      >
        <p className="text-[0.52rem] tracking-[0.22em] uppercase text-[#E8B4A8]/70 text-center py-2.5 px-4">
          Handmade&nbsp;&nbsp;·&nbsp;&nbsp;Ships in 1–2 Days&nbsp;&nbsp;·&nbsp;&nbsp;
          <span className="hidden sm:inline">Free Shipping in Europe Over €50</span>
          <span className="sm:hidden">Free EU Shipping Over €50</span>
        </p>
      </div>

      <div
        className={`transition-all duration-300 ${
          scrolled ? "bg-[#FDF9F7]/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 md:h-24 flex items-center justify-between">
          <Link href="/" className="flex-shrink-0 outline-none">
            <Image
              src="/images/logo.png"
              alt="Bodystrands"
              width={1802}
              height={169}
              className={`h-3 md:h-3.5 w-auto object-contain transition-all duration-300 ${
                scrolled ? "" : "[filter:drop-shadow(0_1px_6px_rgba(0,0,0,0.55))]"
              }`}
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-10">
            {/* Shop with dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setShopOpen(!shopOpen)}
                className={`flex items-center gap-1.5 text-[0.65rem] font-light tracking-[0.22em] uppercase transition-colors duration-200 ${
                  shopOpen ? "text-[#A0622A]" : (scrolled || !isHero) ? "text-[#2C2220] hover:text-[#A0622A]" : "text-[#FDF9F7] hover:text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]"
                }`}
              >
                Shop
                <span className={`text-[0.5rem] transition-transform duration-200 ${shopOpen ? "rotate-180" : ""}`}>
                  ▾
                </span>
              </button>

              {/* Dropdown panel — always in DOM, animated via CSS */}
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-6 w-96 bg-[#FDF9F7] border border-[#E8B4A8]/30 shadow-lg p-8 transition-all duration-200 ease-out ${
                  shopOpen
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 -translate-y-2 pointer-events-none"
                }`}
              >
                <div className="flex gap-12">
                  <div className="flex flex-col gap-0">
                    <Link
                      href="/shop"
                      onClick={() => setShopOpen(false)}
                      className="py-2 text-[0.6rem] tracking-[0.18em] uppercase text-[#A0622A] hover:text-[#2C2220] transition-colors border-b border-[#E8B4A8]/30 mb-2 font-normal"
                    >
                      All Pieces
                    </Link>
                    {col1.map((cat) => (
                      <Link
                        key={cat}
                        href={`/shop?category=${encodeURIComponent(cat)}`}
                        onClick={() => setShopOpen(false)}
                        className="py-1.5 text-[0.58rem] tracking-[0.15em] uppercase text-[#8C7B6E] hover:text-[#2C2220] transition-colors"
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                  <div className="flex flex-col gap-0 pt-10">
                    {col2.map((cat) => (
                      <Link
                        key={cat}
                        href={`/shop?category=${encodeURIComponent(cat)}`}
                        onClick={() => setShopOpen(false)}
                        className="py-1.5 text-[0.58rem] tracking-[0.15em] uppercase text-[#8C7B6E] hover:text-[#2C2220] transition-colors"
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {pages.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[0.65rem] font-light tracking-[0.22em] uppercase transition-colors duration-200 ${
                  (scrolled || !isHero) ? "text-[#2C2220] hover:text-[#A0622A]" : "text-[#FDF9F7] hover:text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop: search + cart */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className={`flex items-center justify-center w-8 h-8 transition-colors duration-200 ${
                (scrolled || !isHero) ? "text-[#2C2220] hover:text-[#A0622A]" : "text-[#FDF9F7] hover:text-white"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>
            <CartIcon light={!scrolled && isHero} />
          </div>

          {/* Mobile: search + cart + hamburger */}
          <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="flex items-center justify-center w-8 h-8 text-[#2C2220]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>
          <CartIcon />
          <button
            className="flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-px bg-[#A0622A] transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-px bg-[#A0622A] transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-px bg-[#A0622A] transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2.5" : ""}`} />
          </button>
          </div>
        </div>

        {/* Mobile menu — always in DOM, animated via max-height */}
        <div
          className={`md:hidden bg-[#FDF9F7] border-t border-[#E8B4A8]/30 overflow-hidden transition-all duration-300 ease-in-out ${
            menuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 py-8">
            <p className="text-[0.52rem] tracking-[0.3em] uppercase text-[#A0622A] mb-4">Shop</p>
            <Link
              href="/shop"
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-[0.62rem] font-light tracking-[0.18em] uppercase text-[#2C2220] hover:text-[#A0622A] transition-colors"
            >
              All Pieces
            </Link>
            {activeCategories.map((cat) => (
              <Link
                key={cat}
                href={`/shop?category=${encodeURIComponent(cat)}`}
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-[0.62rem] font-light tracking-[0.18em] uppercase text-[#8C7B6E] hover:text-[#2C2220] transition-colors border-t border-[#E8B4A8]/20"
              >
                {cat}
              </Link>
            ))}
            <div className="mt-6 pt-6 border-t border-[#E8B4A8]/30 flex flex-col gap-4">
              {pages.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-[0.65rem] font-light tracking-[0.22em] uppercase text-[#2C2220] hover:text-[#A0622A] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>

    {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </>
  );
}
