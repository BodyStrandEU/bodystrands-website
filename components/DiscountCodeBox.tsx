"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency-context";

export type AppliedCode = {
  code: string;
  exclusive: boolean;     // non-stackable code (e.g. SAVE25): full price, then % off the whole order
  percentOff?: number;
  fullTotal?: number;     // exclusive only: order value at full price
  discount?: number;      // exclusive only
  subtotal?: number;      // exclusive only: fullTotal − discount
};

type CheckItem = { productId: string; groupSelections?: Record<string, string>; quantity: number };

// The ONE discount-code box on the site. It sits in the cart and above "Buy Now", shares the
// applied code through the cart context, and the server re-checks the code at checkout.
// (Stripe's own code box is turned off in api/checkout, so there is never a second box.)
export default function DiscountCodeBox({ items, onChange }: { items: CheckItem[]; onChange?: (a: AppliedCode | null) => void }) {
  const { discountCode, setDiscountCode } = useCart();
  const [input, setInput]     = useState("");
  const [error, setError]     = useState("");
  const [busy, setBusy]       = useState(false);
  const [applied, setApplied] = useState<AppliedCode | null>(null);

  async function check(code: string): Promise<(AppliedCode & { valid: boolean; error?: string })> {
    const res = await fetch("/api/validate-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, items }),
    });
    return await res.json();
  }

  function set(a: AppliedCode | null) {
    setApplied(a);
    onChange?.(a);
    setDiscountCode(a ? a.code : "");
  }

  async function apply() {
    if (!input.trim() || busy) return;
    setBusy(true); setError("");
    try {
      const d = await check(input);
      if (d.valid) { set(d); setInput(""); }
      else setError(d.error ?? "That code isn't valid.");
    } catch { setError("Connection error."); }
    setBusy(false);
  }

  // Re-price whenever the items change or a code was applied elsewhere (cart ↔ product page).
  const sig = JSON.stringify(items);
  useEffect(() => {
    if (!discountCode) { if (applied) { setApplied(null); onChange?.(null); } return; }
    let cancelled = false;
    check(discountCode)
      .then((d) => { if (!cancelled) { if (d.valid) { setApplied(d); onChange?.(d); } else set(null); } })
      .catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, discountCode]);

  const { format } = useCurrency();

  if (applied) {
    return (
      <div className="flex justify-between items-baseline">
        <span className="text-[0.58rem] tracking-[0.15em] uppercase text-[#A0622A]">
          {applied.code}{applied.exclusive ? ` −${applied.percentOff}%` : " applied"}{" "}
          <button type="button" onClick={() => set(null)} className="underline underline-offset-2 ml-1 normal-case tracking-normal">remove</button>
        </span>
        <span className="text-sm font-light text-[#A0622A]">{applied.exclusive ? `−${format(applied.discount ?? 0)}` : "at checkout"}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase().slice(0, 30))}
          onKeyDown={(e) => { if (e.key === "Enter") apply(); }}
          placeholder="Discount code"
          className="flex-1 min-w-0 border border-[#E8B4A8]/50 bg-transparent px-3 py-2 text-[0.6rem] tracking-wide text-[#2C2220] placeholder:text-[#8C7B6E]/70 focus:outline-none focus:border-[#2C2220] transition-colors"
        />
        <button
          type="button"
          onClick={apply}
          disabled={busy || !input.trim()}
          className="border border-[#2C2220] px-4 text-[0.55rem] tracking-[0.18em] uppercase text-[#2C2220] hover:bg-[#2C2220] hover:text-[#FDF9F7] transition-colors disabled:opacity-40"
        >
          {busy ? "…" : "Apply"}
        </button>
      </div>
      {error && <p className="mt-1 text-[0.55rem] text-[#A0622A]">{error}</p>}
    </div>
  );
}
