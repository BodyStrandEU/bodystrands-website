import Image from "next/image";
import Link from "next/link";
import { activeCategories } from "@/lib/products";
import SocialLinks from "@/components/SocialLinks";
import CookieSettingsLink from "@/components/CookieSettingsLink";

const SHOP_LINKS = [
  { href: "/shop", label: "All Pieces" },
  ...activeCategories.map((c) => ({ href: `/shop?category=${encodeURIComponent(c)}`, label: c })),
];

const INFO_LINKS = [
  { href: "/about",          label: "About Us" },
  { href: "/contact",        label: "Contact" },
  { href: "/track",          label: "Track Your Order" },
  { href: "/shipping",       label: "Shipping & Returns" },
  { href: "/care",           label: "Jewelry Care" },
  { href: "/faq",            label: "FAQ" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms",          label: "Terms & Conditions" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#2C2220] text-[#E8B4A8]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">

        {/* Brand */}
        <div className="col-span-2 md:col-span-1 flex flex-col gap-5">
          <Image
            src="/images/logo.png"
            alt="Bodystrands"
            width={1802}
            height={169}
            className="h-4 w-auto object-contain opacity-80"
          />
          <p className="text-[0.7rem] font-light leading-relaxed tracking-wide text-[#E8B4A8]/70 max-w-[220px]">
            Handmade body jewelry crafted with love in Portugal. Dainty, minimal, and made to last.
          </p>
          <div className="pt-1">
            <p className="text-[0.55rem] tracking-[0.25em] uppercase text-[#E8B4A8]/50 mb-3">Follow us</p>
            <SocialLinks tone="dark" />
          </div>
        </div>

        {/* Shop */}
        <div className="flex flex-col gap-3">
          <p className="text-[0.6rem] tracking-[0.25em] uppercase text-[#E8B4A8]/50 mb-1">Shop</p>
          {SHOP_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[0.65rem] font-light tracking-[0.1em] text-[#E8B4A8]/60 hover:text-[#E8B4A8] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-3">
          <p className="text-[0.6rem] tracking-[0.25em] uppercase text-[#E8B4A8]/50 mb-1">Info</p>
          {INFO_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[0.65rem] font-light tracking-[0.1em] text-[#E8B4A8]/60 hover:text-[#E8B4A8] transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <CookieSettingsLink className="text-left text-[0.65rem] font-light tracking-[0.1em] text-[#E8B4A8]/60 hover:text-[#E8B4A8] transition-colors" />
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-3">
          <p className="text-[0.6rem] tracking-[0.25em] uppercase text-[#E8B4A8]/50 mb-1">Contact</p>
          <a
            href="mailto:info@bodystrands.com"
            className="text-[0.65rem] font-light tracking-[0.1em] text-[#E8B4A8]/60 hover:text-[#E8B4A8] transition-colors"
          >
            info@bodystrands.com
          </a>
          <a
            href="https://wa.me/351935483918?text=Hi!%20I%20have%20a%20question%20about%20a%20Bodystrands%20piece."
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.65rem] font-light tracking-[0.1em] text-[#E8B4A8]/60 hover:text-[#E8B4A8] transition-colors"
          >
            WhatsApp: +351 935 483 918
          </a>
          <p className="text-[0.65rem] font-light tracking-[0.1em] text-[#E8B4A8]/60">
            Handmade in Portugal & Canada
          </p>
          <p className="text-[0.65rem] font-light tracking-[0.1em] text-[#E8B4A8]/60">
            Ships Worldwide
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#E8B4A8]/10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 pt-5 pb-24 md:pb-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[0.6rem] tracking-[0.18em] uppercase text-[#E8B4A8]/35">
            © {year} Bodystrands. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <span className="w-full md:w-auto text-center text-[0.5rem] tracking-[0.15em] uppercase text-[#E8B4A8]/40 whitespace-nowrap">
              🔒 Secure Checkout
            </span>
            {["VISA", "MASTERCARD", "AMEX", "APPLE PAY", "GOOGLE PAY"].map((brand) => (
              <span
                key={brand}
                className="text-[0.45rem] tracking-[0.08em] font-light border border-[#E8B4A8]/20 text-[#E8B4A8]/35 px-1.5 py-0.5 rounded-sm whitespace-nowrap"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
