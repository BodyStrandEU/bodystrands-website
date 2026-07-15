"use client";

import { useCurrency } from "@/lib/currency-context";

const DOT = <span className="mx-4 text-[#A0622A]/60">✦</span>;

export default function TrustBar() {
  const { currency, format } = useCurrency();

  // US/CA get their own fixed native-currency thresholds instead of a converted EUR50 —
  // keep these two figures in sync by hand with lib/shipping.ts's US/CA freeThreshold.
  const shippingLine = currency === "USD"
    ? "Free Shipping in the USA over $60.00 USD"
    : currency === "CAD"
      ? "Free Shipping in Canada over $75.00 CAD"
      : `Free Shipping Europe & North America over ${format(50)}`;

  const ITEMS = [
    "Handmade in Portugal and Canada",
    shippingLine,
    "Ships in 1–2 Business Days",
    "Easy 14-Day Returns",
    "Tarnish-Resistant Stainless Steel",
    "Worldwide Shipping",
  ];

  const items = [...ITEMS, ...ITEMS];

  return (
    <div className="bg-[#2C2220] text-[#E8B4A8] overflow-hidden py-2.5">
      <div className="flex marquee-track whitespace-nowrap">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center text-[0.55rem] tracking-[0.22em] uppercase font-light flex-shrink-0">
            {item}{DOT}
          </span>
        ))}
      </div>
    </div>
  );
}
