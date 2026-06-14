import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#2C2220] text-[#E8B4A8]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="flex flex-col gap-4">
          <Image
            src="/images/logo.png"
            alt="Bodystrands"
            width={1802}
            height={169}
            className="h-4 w-auto object-contain opacity-80"
          />
          <p className="text-[0.7rem] font-light leading-relaxed tracking-wide text-[#E8B4A8]/70 max-w-xs">
            Handmade body jewelry crafted with love. Dainty, minimal, and made to last.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-[0.6rem] tracking-[0.25em] uppercase text-[#E8B4A8]/50 mb-2">Navigate</p>
          {[
            { href: "/", label: "Home" },
            { href: "/shop", label: "Shop" },
            { href: "/about", label: "About" },
            { href: "/contact", label: "Contact" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[0.65rem] font-light tracking-[0.18em] uppercase text-[#E8B4A8]/70 hover:text-[#E8B4A8] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-[0.6rem] tracking-[0.25em] uppercase text-[#E8B4A8]/50 mb-2">Contact</p>
          <a
            href="mailto:storenavaria@gmail.com"
            className="text-[0.65rem] font-light tracking-[0.18em] uppercase text-[#E8B4A8]/70 hover:text-[#E8B4A8] transition-colors"
          >
            storenavaria@gmail.com
          </a>
          <p className="text-[0.65rem] font-light tracking-[0.18em] uppercase text-[#E8B4A8]/70">
            Made in Portugal
          </p>
        </div>
      </div>

      <div className="border-t border-[#E8B4A8]/10 max-w-7xl mx-auto px-6 md:px-10 py-6 flex flex-col md:flex-row justify-between items-center gap-3">
        <p className="text-[0.6rem] tracking-[0.18em] uppercase text-[#E8B4A8]/40">
          © {new Date().getFullYear()} Bodystrands. All rights reserved.
        </p>
        <div className="flex gap-6">
          <Link
            href="/privacy-policy"
            className="text-[0.6rem] tracking-[0.18em] uppercase text-[#E8B4A8]/40 hover:text-[#E8B4A8]/70 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-[0.6rem] tracking-[0.18em] uppercase text-[#E8B4A8]/40 hover:text-[#E8B4A8]/70 transition-colors"
          >
            Terms & Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
}
