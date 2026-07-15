import type { ReactNode } from "react";

type Badge = {
  key: string;
  label: string;
  sublabel?: string;
  icon: ReactNode;
};

function DropletIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.5s7 7.6 7 12.5a7 7 0 0 1-14 0c0-4.9 7-12.5 7-12.5z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10.5" width="16" height="10" rx="1.5" />
      <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21.5s7-6.5 7-12A7 7 0 0 0 5 9.5c0 5.5 7 12 7 12z" />
      <circle cx="12" cy="9.5" r="2.4" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="7" width="13" height="10" rx="1" />
      <path d="M14.5 10h4.2l3.3 3.4V17h-7.5" />
      <circle cx="6" cy="19" r="1.8" />
      <circle cx="17.5" cy="19" r="1.8" />
    </svg>
  );
}

export const BADGES: Badge[] = [
  {
    key: "handmade",
    label: "Handmade in Portugal and Canada",
    sublabel: "By El & Gio, piece by piece",
    icon: <PinIcon />,
  },
  {
    key: "tarnish",
    label: "Tarnish-Tested",
    sublabel: "Soaked in water for days — zero fade",
    icon: <DropletIcon />,
  },
  {
    key: "secure",
    label: "Secure Checkout",
    sublabel: "Encrypted payment via Stripe",
    icon: <LockIcon />,
  },
  {
    key: "shipping",
    label: "Ships Worldwide",
    sublabel: "Dispatched in 1–2 days",
    icon: <TruckIcon />,
  },
];

/** Full-width 4-icon strip — homepage, below the hero. */
export function TrustBadgesStrip() {
  return (
    <section className="border-y border-[#E8B4A8]/20 bg-[#FAF7F5]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-12 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
        {BADGES.map((b) => (
          <div key={b.key} className="flex flex-col items-center text-center gap-2.5">
            <span className="text-[#A0622A]">{b.icon}</span>
            <div>
              <p className="text-[0.6rem] tracking-[0.15em] uppercase text-[#2C2220]">{b.label}</p>
              {b.sublabel && (
                <p className="text-[0.55rem] tracking-[0.05em] text-[#8C7B6E] mt-1 leading-snug">{b.sublabel}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Compact horizontal row — product page, under the buy buttons. */
export function TrustBadgesRow() {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
      {BADGES.map((b) => (
        <div key={b.key} className="flex items-center gap-2">
          <span className="text-[#A0622A] flex-shrink-0">{b.icon}</span>
          <p className="text-[0.58rem] tracking-[0.08em] uppercase text-[#8C7B6E] leading-snug">{b.label}</p>
        </div>
      ))}
    </div>
  );
}

/** Single-line micro version — cart dropdown, checkout areas. */
export function TrustBadgesInline() {
  return (
    <p className="flex items-center justify-center gap-1.5 text-[0.52rem] tracking-[0.1em] uppercase text-[#8C7B6E]">
      <LockIcon />
      <span>Secure checkout · Ships Worldwide</span>
    </p>
  );
}
