"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart";

const FREE_THRESHOLD = 50;

export default function CartIcon({ light }: { light?: boolean }) {
  const { items, count, subtotal, remove, updateQty, clear } = useCart();
  const [open, setOpen]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const symbol   = "€";
  const remaining = Math.max(0, FREE_THRESHOLD - subtotal);

  async function checkout() {
    if (items.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ items: items.map((i) => ({ productId: i.productId, variant: i.variant, priceAdd: i.priceAdd, quantity: i.quantity })) }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) { clear(); window.location.href = data.url; }
      else { setError(data.error ?? "Something went wrong."); setLoading(false); }
    } catch { setError("Connection error."); setLoading(false); }
  }

  const iconColor = light ? "text-[#FDF9F7]" : "text-[#2C2220]";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label={`Cart — ${count} item${count !== 1 ? "s" : ""}`}
        className={`relative flex items-center justify-center w-8 h-8 transition-colors duration-200 hover:text-[#A0622A] ${iconColor}`}
      >
        {/* Bag icon */}
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

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full right-0 mt-4 w-80 bg-[#FDF9F7] border border-[#E8B4A8]/40 shadow-xl z-50">

          {items.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[0.58rem] tracking-[0.2em] uppercase text-[#8C7B6E] mb-4">Your cart is empty</p>
              <Link
                href="/shop"
                onClick={() => setOpen(false)}
                className="text-[0.58rem] tracking-[0.18em] uppercase text-[#A0622A] hover:text-[#8A5222] transition-colors underline underline-offset-2"
              >
                Browse collection
              </Link>
            </div>
          ) : (
            <>
              {/* Items */}
              <div className="max-h-72 overflow-y-auto divide-y divide-[#E8B4A8]/30">
                {items.map((item) => (
                  <div key={item.cartId} className="flex gap-3 p-4 items-start">
                    {item.image ? (
                      <div className="w-14 h-14 flex-shrink-0 bg-[#F5EDE8] relative overflow-hidden">
                        <Image src={item.image} alt={item.productName} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 flex-shrink-0 bg-[#F5EDE8]" />
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-[0.62rem] tracking-wide text-[#2C2220] leading-snug truncate">{item.productName}</p>
                      {item.variant && (
                        <p className="text-[0.55rem] tracking-[0.12em] uppercase text-[#8C7B6E] mt-0.5 truncate">{item.variant}</p>
                      )}
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-2 border border-[#E8B4A8]/40">
                          <button
                            onClick={() => updateQty(item.cartId, item.quantity - 1)}
                            className="w-6 h-6 text-[#8C7B6E] hover:text-[#A0622A] text-xs flex items-center justify-center transition-colors"
                          >
                            −
                          </button>
                          <span className="text-[0.6rem] text-[#2C2220] w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.cartId, item.quantity + 1)}
                            className="w-6 h-6 text-[#8C7B6E] hover:text-[#A0622A] text-xs flex items-center justify-center transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-[0.65rem] text-[#A0622A] font-light">
                          {symbol}{(item.unitPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => remove(item.cartId)}
                      aria-label="Remove"
                      className="text-[#8C7B6E]/50 hover:text-[#A0622A] transition-colors mt-0.5 flex-shrink-0"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-[#E8B4A8]/40 p-4">
                {/* Subtotal */}
                <div className="flex justify-between items-baseline mb-3">
                  <span className="text-[0.58rem] tracking-[0.15em] uppercase text-[#8C7B6E]">Subtotal</span>
                  <span className="text-base font-light text-[#2C2220]">{symbol}{subtotal.toFixed(2)}</span>
                </div>

                {/* Shipping nudge */}
                {remaining > 0 ? (
                  <p className="text-[0.55rem] tracking-[0.08em] uppercase text-[#8C7B6E] mb-3 leading-relaxed">
                    Add <span className="text-[#A0622A]">{symbol}{remaining.toFixed(2)}</span> more for free shipping on EU & UK orders —{" "}
                    <Link href="/shop" onClick={() => setOpen(false)} className="text-[#A0622A] underline underline-offset-2">browse more</Link>
                  </p>
                ) : (
                  <p className="text-[0.55rem] tracking-[0.08em] uppercase text-[#A0622A] mb-3">
                    ✓ Free shipping on EU & UK orders
                  </p>
                )}

                {error && <p className="text-[0.55rem] text-[#A0622A] mb-2">{error}</p>}

                <button
                  onClick={checkout}
                  disabled={loading}
                  className="w-full bg-[#2C2220] text-[#FDF9F7] py-3.5 text-[0.6rem] tracking-[0.22em] uppercase hover:bg-[#A0622A] transition-colors duration-200 disabled:opacity-60"
                >
                  {loading ? "Processing…" : `Checkout — ${symbol}${subtotal.toFixed(2)}`}
                </button>

                <Link
                  href="/shop"
                  onClick={() => setOpen(false)}
                  className="block text-center mt-3 text-[0.55rem] tracking-[0.15em] uppercase text-[#8C7B6E] hover:text-[#A0622A] transition-colors"
                >
                  Continue shopping
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
