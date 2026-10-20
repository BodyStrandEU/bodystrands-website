"use client";

import { useCart } from "@/lib/cart";

// Icon only — the dropdown/checkout UI now lives in the shared CartDrawer (see that
// component), opened from here and from every product card's quick-add button.
export default function CartIcon({ light }: { light?: boolean }) {
  const { count, openDrawer } = useCart();
  const iconColor = light ? "text-[#FDF9F7]" : "text-[#2C2220]";

  return (
    <button
      onClick={openDrawer}
      aria-label={`Cart — ${count} item${count !== 1 ? "s" : ""}`}
      className={`relative flex items-center justify-center w-8 h-8 transition-colors duration-200 hover:text-[#A0622A] ${iconColor}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-[#A0622A] text-[#FDF9F7] text-[0.5rem] font-light flex items-center justify-center leading-none">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}
