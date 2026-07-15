"use client";

import { useCurrency } from "@/lib/currency-context";

const DOT = <span className="mx-4 text-[#A0622A]/60">✦</span>;

export default function TrustBar() {
  const { format } = useCurrency();

  const ITEMS = [
    "Handmade in Portugal and Canada",
    `Free Shipping Europe & North America over ${format(50)}`,
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
