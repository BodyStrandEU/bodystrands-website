"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ProductGallery from "@/components/ProductGallery";
import BuyButton from "@/components/BuyButton";
import ProductDetails from "@/components/ProductDetails";
import type { Product } from "@/lib/products";
import { getOriginalPrice } from "@/lib/pricing";
import CountdownTimer from "@/components/CountdownTimer";
import { useCart } from "@/lib/cart";

const FREE_SHIPPING_THRESHOLD = 50;

function ShippingNudge({ price, symbol }: { price: number; symbol: string }) {
  const remaining = FREE_SHIPPING_THRESHOLD - price;
  if (remaining <= 0) {
    return (
      <p className="mt-2.5 text-[0.58rem] tracking-[0.12em] uppercase text-[#A0622A] flex items-center gap-1.5">
        <span>✓</span>
        <span>Free shipping on EU & UK orders — applied at checkout</span>
      </p>
    );
  }
  return (
    <p className="mt-2.5 text-[0.58rem] tracking-[0.1em] uppercase text-[#8C7B6E] leading-relaxed">
      Add{" "}
      <span className="text-[#2C2220] font-medium">{symbol}{remaining.toFixed(2)}</span>
      {" "}more and save up to{" "}
      <span className="text-[#2C2220] font-medium">{symbol}8.00</span>
      {" "}on shipping for EU & UK orders —{" "}
      <Link href="/shop" className="text-[#A0622A] underline underline-offset-2 hover:text-[#8A5222] transition-colors">
        browse more
      </Link>
    </p>
  );
}

const SWATCH_COLORS: Record<string, string> = {
  "Gold Tone": "#C8A84B",
  "Silver Tone": "#A8A8A8",
};

export default function ProductPageClient({ product }: { product: Product }) {
  const { add: addToCart } = useCart();
  const [activeVariant, setActiveVariant] = useState<string>(
    product.variants?.[0] ?? ""
  );
  const [groupSelections, setGroupSelections] = useState<Record<string, string>>({});
  const [showSticky, setShowSticky]           = useState(false);
  const [stickyLoading, setStickyLoading]     = useState(false);
  const [stickyError, setStickyError]         = useState("");
  const [addedMsg, setAddedMsg]               = useState(false);
  const buyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const symbol =
    product.currency === "EUR" ? "€" : product.currency === "GBP" ? "£" : "$";

  // Sum price add-ons from selected options
  const priceAdd = (product.variantGroups ?? []).reduce((sum, group) => {
    if (group.type === "text") return sum;
    const selected = groupSelections[group.label];
    if (!selected || !group.optionPrices) return sum;
    return sum + (group.optionPrices[selected] ?? 0);
  }, 0);

  const totalPrice = product.price + priceAdd;

  const allGroupsSelected =
    !product.variantGroups ||
    product.variantGroups.every((g) => {
      const val = groupSelections[g.label];
      if (g.type === "text") return val && val.trim().length > 0;
      return !!val;
    });

  const combinedVariant =
    [
      activeVariant,
      ...(product.variantGroups
        ?.map((g) => {
          const val = groupSelections[g.label];
          if (!val) return null;
          return `${g.label}: ${val}`;
        })
        .filter(Boolean) ?? []),
    ]
      .filter(Boolean)
      .join(" — ") || undefined;

  async function handleStickyBuy() {
    if (!allGroupsSelected || stickyLoading) return;
    setStickyLoading(true);
    setStickyError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, variant: combinedVariant, priceAdd }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
      else { setStickyLoading(false); setStickyError(data.error ?? "Something went wrong."); }
    } catch { setStickyLoading(false); setStickyError("Connection error. Please try again."); }
  }

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">

      {/* Gallery — full bleed on mobile */}
      <div className="-mx-6 md:mx-0">
        <ProductGallery product={product} activeVariant={activeVariant} />
      </div>

      {/* Details + purchase controls */}
      <div className="flex flex-col gap-5 md:gap-6 px-0 md:sticky md:top-32">

        <p className="text-[0.55rem] tracking-[0.25em] uppercase text-[#A0622A]">
          {product.category}
        </p>

        <h1 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220]">
          {product.name}
        </h1>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-2xl font-light text-[#A0622A] tracking-wide">
              {symbol}{totalPrice.toFixed(2)}
              {priceAdd > 0 && (
                <span className="text-sm text-[#8C7B6E] ml-2 font-light">
                  (+{symbol}{priceAdd.toFixed(2)})
                </span>
              )}
            </span>
            <span className="text-base font-light text-[#8C7B6E]/60 line-through tracking-wide">
              {symbol}{getOriginalPrice(totalPrice).toFixed(2)}
            </span>
            <span className="text-[0.55rem] tracking-[0.18em] uppercase text-[#FDF9F7] bg-[#A0622A] px-2 py-0.5">
              −25%
            </span>
          </div>
          <CountdownTimer />
        </div>

        <div className="h-px bg-[#E8B4A8]/40" />

        <p className="text-sm font-light leading-relaxed tracking-wide text-[#8C7B6E]">
          {product.description}
        </p>

        <div className="h-px bg-[#E8B4A8]/40" />

        {/* Finish selector */}
        {product.variants && product.variants.length > 1 && (
          <div>
            <p className="text-[0.55rem] tracking-[0.25em] uppercase text-[#8C7B6E] mb-3">
              Finish —{" "}
              <span className="text-[#2C2220]">{activeVariant}</span>
            </p>
            <div className="flex gap-3 flex-wrap">
              {product.variants.map((v) => (
                <button
                  key={v}
                  onClick={() => setActiveVariant(v)}
                  aria-label={v}
                  className={`flex items-center gap-2 px-4 py-3 border text-[0.58rem] tracking-[0.15em] uppercase transition-all duration-200 ${
                    activeVariant === v
                      ? "border-[#2C2220] text-[#2C2220]"
                      : "border-[#E8B4A8]/50 text-[#8C7B6E] hover:border-[#2C2220]"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: SWATCH_COLORS[v] ?? "#888" }}
                  />
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Customer selectors */}
        {product.variantGroups?.map((group) => (
          <div key={group.label}>
            <p className="text-[0.55rem] tracking-[0.25em] uppercase text-[#8C7B6E] mb-3">
              {group.label}
              {group.type !== "text" && (
                !groupSelections[group.label] ? (
                  <span className="ml-2 text-[#A0622A]">— please select</span>
                ) : (
                  <span className="ml-2 text-[#2C2220]">— {groupSelections[group.label]}</span>
                )
              )}
            </p>

            {group.type === "text" ? (
              <input
                type="text"
                value={groupSelections[group.label] ?? ""}
                onChange={(e) =>
                  setGroupSelections((prev) => ({ ...prev, [group.label]: e.target.value }))
                }
                placeholder={group.placeholder ?? `Enter ${group.label.toLowerCase()}`}
                className="w-full border border-[#E8B4A8]/50 px-4 py-3 text-sm font-light text-[#2C2220] tracking-wide placeholder:text-[#8C7B6E]/60 focus:outline-none focus:border-[#2C2220] transition-colors bg-transparent"
              />
            ) : (
              <div className="flex gap-3 flex-wrap">
                {(group.options ?? []).map((opt) => {
                  const add = group.optionPrices?.[opt];
                  return (
                    <button
                      key={opt}
                      onClick={() =>
                        setGroupSelections((prev) => ({ ...prev, [group.label]: opt }))
                      }
                      className={`px-4 py-3 border text-[0.58rem] tracking-[0.15em] uppercase transition-all duration-200 ${
                        groupSelections[group.label] === opt
                          ? "border-[#2C2220] text-[#2C2220]"
                          : "border-[#E8B4A8]/50 text-[#8C7B6E] hover:border-[#2C2220]"
                      }`}
                    >
                      {opt}
                      {add ? <span className="ml-1 normal-case">+{symbol}{add}</span> : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Buttons — observed for sticky bar visibility */}
        <div ref={buyRef} className="flex flex-col gap-2">
          {/* Add to Cart */}
          <button
            onClick={() => {
              if (!allGroupsSelected) return;
              addToCart({
                productId:   product.id,
                productName: product.name,
                variant:     combinedVariant,
                priceAdd,
                unitPrice:   totalPrice,
                image:       product.images?.[0],
                currency:    product.currency,
              });
              setAddedMsg(true);
              setTimeout(() => setAddedMsg(false), 2000);
            }}
            disabled={!allGroupsSelected}
            title={!allGroupsSelected ? "Please complete all options above" : undefined}
            className="btn-primary-filled w-full text-center py-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {addedMsg ? "Added to cart ✓" : !allGroupsSelected ? "Please complete all options above" : "Add to Cart"}
          </button>

          {/* Buy Now — direct checkout */}
          <BuyButton
            productId={product.id}
            variant={combinedVariant}
            priceAdd={priceAdd}
            disabled={!allGroupsSelected}
            secondary
          />

          <ShippingNudge price={totalPrice} symbol={symbol} />
        </div>

        {/* Feature bullets */}
        <div className="flex flex-col gap-2">
          {[
            "Handmade",
            "Tarnish-resistant stainless steel",
            "Water-resistant",
            "Adjustable fit",
          ].map((feat) => (
            <p
              key={feat}
              className="text-[0.6rem] tracking-[0.15em] uppercase text-[#8C7B6E] flex items-center gap-2"
            >
              <span className="w-1 h-1 bg-[#A0622A] inline-block rounded-full" />
              {feat}
            </p>
          ))}
        </div>

        <ProductDetails
          fullDescription={product.fullDescription}
          specs={product.specs}
        />
      </div>
    </div>

    {/* Sticky mobile buy bar */}
    {showSticky && (
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#FDF9F7]/95 backdrop-blur-sm border-t border-[#E8B4A8]/40 px-4 pt-3 pb-4 flex flex-col gap-1.5 shadow-[0_-4px_24px_rgba(44,34,32,0.08)] animate-slide-up">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[0.55rem] tracking-[0.15em] uppercase text-[#8C7B6E] truncate">{product.name}</p>
            <p className="text-base font-light text-[#A0622A] tracking-wide">{symbol}{totalPrice.toFixed(2)}</p>
          </div>
          <button
            onClick={handleStickyBuy}
            disabled={stickyLoading}
            className="flex-shrink-0 bg-[#2C2220] text-[#FDF9F7] px-6 py-3 text-[0.6rem] tracking-[0.2em] uppercase disabled:opacity-60 transition-colors hover:bg-[#A0622A]"
          >
            {stickyLoading ? "Processing…" : !allGroupsSelected ? "Select options" : "Buy Now"}
          </button>
        </div>
        {stickyError && (
          <p className="text-[0.6rem] tracking-wide text-[#A0622A] text-right">{stickyError}</p>
        )}
        {totalPrice < FREE_SHIPPING_THRESHOLD && (
          <p className="text-[0.55rem] tracking-[0.08em] uppercase text-[#8C7B6E] text-center">
            Add <span className="text-[#2C2220]">{symbol}{(FREE_SHIPPING_THRESHOLD - totalPrice).toFixed(2)}</span> more → save up to <span className="text-[#2C2220]">{symbol}8</span> shipping (EU & UK)
          </p>
        )}
      </div>
    )}
    </>
  );
}
