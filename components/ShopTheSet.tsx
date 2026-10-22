"use client";

// "Shop the Set" — curated matching pieces with SET_DISCOUNT_PERCENT off when bought together.
// The discount itself is computed in the cart (lib/cart.tsx) and at checkout from the cart
// contents, so it applies whether the pieces were added here or one by one.

import { Fragment, useState } from "react";
import Link from "next/link";
import Image from "@/components/SmartImage";
import type { Product } from "@/lib/products";
import type { ProductSet } from "@/lib/productSets";
import { SET_DISCOUNT_PERCENT, setUnitPrice, toneOfLabel, defaultTone, canShowIn, imageIn, toneVariant } from "@/lib/productSets";
import { getSalePrice } from "@/lib/pricing";
import { useCurrency } from "@/lib/currency-context";
import { useCart } from "@/lib/cart";

const needsPicker = (p: Product) => (p.variantGroups ?? []).length > 0 || (p.variants ?? []).length > 1;

export default function ShopTheSet({ set, items: allItems, currentId, activeVariant }: {
  set: ProductSet; items: Product[]; currentId: string;
  activeVariant?: string; // the finish the shopper picked on the product page (passed in by ProductPageClient)
}) {
  const { format } = useCurrency();
  const { add, startSetPicker } = useCart();
  const [picked, setPicked] = useState<Set<string>>(new Set(allItems.map((p) => p.id)));

  // One colour per set: every piece shows (and is added) in the colour of the product being viewed
  const current = allItems.find((p) => p.id === currentId) ?? allItems[0];
  const tone = toneOfLabel(activeVariant) ?? defaultTone(current);
  const items = allItems.filter((p) => canShowIn(p, tone));

  const priceOf = (p: Product) => getSalePrice(p) ?? p.price;
  const chosen = items.filter((p) => picked.has(p.id));
  const separately = chosen.reduce((sum, p) => sum + priceOf(p), 0);
  const discountApplies = chosen.length >= 2;
  const setPrice = discountApplies ? chosen.reduce((sum, p) => sum + setUnitPrice(priceOf(p)), 0) : separately;
  const saving = separately - setPrice;

  function toggle(id: string) {
    if (id === currentId) return;
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function addSet() {
    // Pieces with no choices go straight in; the rest step through the option picker one by one.
    for (const p of chosen.filter((p) => !needsPicker(p))) {
      add({
        productId:   p.id,
        productName: p.name,
        variant:     toneVariant(p, tone) ?? p.variants?.[0],
        priceAdd:    0,
        unitPrice:   priceOf(p),
        image:       imageIn(p, tone),
        currency:    p.currency,
      });
    }
    startSetPicker(chosen.filter(needsPicker), tone);
    if (typeof window !== "undefined") {
      const w = window as Window & { gtag?: (...a: unknown[]) => void };
      w.gtag?.("event", "shop_the_set_click", { set_id: set.id, pieces: chosen.length, value: setPrice });
    }
  }

  const buttonLabel = chosen.length === items.length
    ? `Add the set · ${format(setPrice)}`
    : `Add ${chosen.length} ${chosen.length === 1 ? "piece" : "pieces"} · ${format(setPrice)}`;

  // Not enough pieces left in this colour to call it a set
  if (items.length < 2) return null;

  return (
    <section className="mt-4 pt-8 border-t border-[#E8B4A8]/40">
      <div className="flex items-center gap-5 mb-2">
        <div className="flex-1 h-px bg-[#E8B4A8]/30" />
        <h2 className="font-heading text-2xl md:text-3xl font-light text-[#2C2220] whitespace-nowrap tracking-wide">Shop the Set</h2>
        <div className="flex-1 h-px bg-[#E8B4A8]/30" />
      </div>
      <p className="text-center text-[0.65rem] tracking-[0.2em] uppercase text-[#8C7B6E] mb-6">
        {set.name} — {set.why}
      </p>

      <div className="rounded-sm bg-[#FDF9F7] border border-[#E8B4A8]/30 p-4 md:p-8">
        <div className="flex items-start justify-center gap-2 md:gap-4">
          {items.map((p, i) => {
            const on = picked.has(p.id);
            const sale = getSalePrice(p);
            const isCurrent = p.id === currentId;
            return (
              <Fragment key={p.id}>
                {i > 0 && <span className="self-center -mt-14 font-heading text-2xl md:text-3xl text-[#A0622A] font-light shrink-0">+</span>}
                <div className={`flex-1 basis-0 min-w-0 max-w-[220px] transition-opacity ${on ? "opacity-100" : "opacity-40"}`}>
                  <Link href={`/shop/${p.id}`} className="block relative aspect-square overflow-hidden bg-white">
                    {imageIn(p, tone) && <Image src={imageIn(p, tone)!} alt={p.altText || p.name} fill sizes="(max-width: 768px) 30vw, 220px" className="object-cover" />}
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggle(p.id)}
                    disabled={isCurrent}
                    aria-pressed={on}
                    className="mt-2 flex items-start gap-1.5 text-left w-full min-h-[44px]"
                  >
                    <span className={`mt-0.5 shrink-0 w-4 h-4 border flex items-center justify-center text-[0.6rem] ${on ? "bg-[#2C2220] border-[#2C2220] text-white" : "border-[#8C7B6E]"}`}>{on ? "✓" : ""}</span>
                    <span className="min-w-0">
                      <span className="block text-[0.7rem] md:text-xs leading-snug text-[#2C2220] line-clamp-2">
                        {isCurrent && <span className="text-[#8C7B6E]">This item: </span>}{p.name}
                      </span>
                      <span className="block text-[0.7rem] md:text-xs mt-0.5">
                        {sale !== null ? (
                          <><span className="line-through text-[#8C7B6E] mr-1">{format(p.price)}</span><span className="text-[#A0622A]">{format(sale)}</span></>
                        ) : (
                          <span className="text-[#2C2220]">{format(p.price)}</span>
                        )}
                      </span>
                    </span>
                  </button>
                </div>
              </Fragment>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-[#E8B4A8]/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            {discountApplies ? (
              <>
                <p className="text-sm text-[#8C7B6E]">Separately <span className="line-through">{format(separately)}</span></p>
                <p className="font-heading text-3xl text-[#2C2220]">
                  {format(setPrice)} <span className="text-sm text-[#A0622A] align-middle ml-1">You save {format(saving)} ({SET_DISCOUNT_PERCENT}%)</span>
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-[#8C7B6E]">Pick one more piece to save {SET_DISCOUNT_PERCENT}%</p>
                <p className="font-heading text-3xl text-[#2C2220]">{format(setPrice)}</p>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={addSet}
            className="w-full md:w-auto min-h-[48px] px-8 bg-[#2C2220] text-[#FDF9F7] text-[0.7rem] tracking-[0.2em] uppercase hover:bg-[#A0622A] transition-colors"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
