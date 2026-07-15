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
import { COUNTRY_GROUPS, getShippingRate } from "@/lib/shipping";
import WishlistButton from "@/components/WishlistButton";
import { trackRecentlyViewed } from "@/lib/recentlyViewed";
import SizeGuideButton from "@/components/SizeGuideButton";
import { useCurrency } from "@/lib/currency-context";
import ProductReviews from "@/components/ProductReviews";
import { TrustBadgesRow } from "@/components/TrustBadges";
import { type Review, dedupeReviews } from "@/data/category-reviews";
import customerReviewsRaw from "@/data/customer-reviews.json";

// Raw (not deduped) — the same real review is intentionally stored once per product
// it applies to (e.g. one review duplicated across 14 near-identical anklets), and
// that per-product productId is exactly what "own reviews for this product" matches
// against below. Only dedupe when falling back to a shop-wide (not product-specific) count.
const ALL_REAL_REVIEWS: Review[] = Object.values(customerReviewsRaw as Record<string, Review[]>).flat();

const FREE_SHIPPING_THRESHOLD = 50;

function ShareButton({ name }: { name: string }) {
  const [done, setDone] = useState(false);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: name, url });
      } else {
        await navigator.clipboard.writeText(url);
        setDone(true);
        setTimeout(() => setDone(false), 2200);
      }
    } catch {}
  }

  return (
    <button
      onClick={handleShare}
      aria-label="Share this piece"
      className="flex items-center gap-1.5 text-[#8C7B6E]/60 hover:text-[#A0622A] transition-colors duration-200"
    >
      {done ? (
        <span className="text-[0.48rem] tracking-[0.18em] uppercase text-[#A0622A]">Copied ✓</span>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      )}
    </button>
  );
}

// `price` is always passed in as EUR — format() converts it to the visitor's local
// currency for display, same as every other price on this page.
function ShippingNudge({ price }: { price: number }) {
  const { format } = useCurrency();
  const remaining = FREE_SHIPPING_THRESHOLD - price;
  if (remaining <= 0) {
    return (
      <p className="mt-2.5 text-[0.58rem] tracking-[0.12em] uppercase text-[#A0622A] flex items-center gap-1.5">
        <span>✓</span>
        <span>Free shipping on EU, UK & North America orders — applied at checkout</span>
      </p>
    );
  }
  return (
    <p className="mt-2.5 text-[0.58rem] tracking-[0.1em] uppercase text-[#8C7B6E] leading-relaxed">
      Add{" "}
      <span className="text-[#2C2220] font-medium">{format(remaining)}</span>
      {" "}more and save up to{" "}
      <span className="text-[#2C2220] font-medium">{format(8)}</span>
      {" "}on shipping for EU, UK & North America orders —{" "}
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
  const { add: addToCart, shippingCountry, setShippingCountry } = useCart();
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

  useEffect(() => {
    trackRecentlyViewed(product.id);
  }, [product.id]);

  // If a variantGroup covers the same options as variants (e.g. Finish dropdown + optionPrices),
  // sync activeVariant from that dropdown so the gallery hero updates, and suppress duplicate swatches.
  const finishGroup = (product.variantGroups ?? []).find(
    (g) => g.options && product.variants?.some((v) => g.options!.includes(v))
  );
  useEffect(() => {
    if (finishGroup && groupSelections[finishGroup.label]) {
      setActiveVariant(groupSelections[finishGroup.label]);
    }
  }, [groupSelections, finishGroup?.label]);

  const { format } = useCurrency();

  // Real review stats for the header badge — this product's own reviews if it has
  // any, otherwise the shop-wide average (same "own vs shop-wide" logic as
  // ProductReviews.tsx, kept in sync by hand since this badge renders above it).
  const ownReviews = ALL_REAL_REVIEWS.filter((r) => r.productId === product.id);
  const badgeReviews = ownReviews.length > 0 ? ownReviews : dedupeReviews(ALL_REAL_REVIEWS);
  const badgeAvg = badgeReviews.length > 0
    ? badgeReviews.reduce((s, r) => s + r.rating, 0) / badgeReviews.length
    : 0;

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
    if (!allGroupsSelected || stickyLoading || !shippingCountry) return;
    setStickyLoading(true);
    setStickyError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, variant: combinedVariant, priceAdd, country: shippingCountry || undefined }),
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
      <div className="-mx-6 md:mx-0 md:col-start-1 md:row-start-1">
        <ProductGallery product={product} activeVariant={activeVariant} />
      </div>

      {/* Details + purchase controls — spans both rows on desktop so it stays beside
          the gallery + reviews stack below it, not just the gallery alone */}
      <div className="flex flex-col gap-5 md:gap-6 px-0 md:sticky md:top-32 md:col-start-2 md:row-start-1 md:row-span-2">

        <div className="flex items-center justify-between">
          <p className="text-[0.55rem] tracking-[0.25em] uppercase text-[#A0622A]">
            {product.category}
          </p>
          <div className="flex items-center gap-4">
            <WishlistButton productId={product.id} variant="page" />
            <ShareButton name={product.name} />
          </div>
        </div>

        <h1 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220]">
          {product.name}
        </h1>

        {/* Inline star rating — real data: this product's own reviews if it has any,
            otherwise the shop-wide average. Hidden entirely if there's no real review data yet. */}
        {badgeReviews.length > 0 && (
        <div className="flex items-center gap-2.5">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= Math.round(badgeAvg) ? "#A0622A" : "none"} stroke={i <= Math.round(badgeAvg) ? "#A0622A" : "#D4B8A8"} strokeWidth="1.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <span className="text-[0.65rem] tracking-[0.12em] text-[#8C7B6E]">{badgeAvg.toFixed(1)} · {badgeReviews.length} review{badgeReviews.length !== 1 ? "s" : ""}</span>
        </div>
        )}

        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-2xl font-light text-[#A0622A] tracking-wide">
              {format(totalPrice)}
              {priceAdd > 0 && (
                <span className="text-sm text-[#8C7B6E] ml-2 font-light">
                  (+{format(priceAdd)})
                </span>
              )}
            </span>
            <span className="text-base font-light text-[#8C7B6E]/60 line-through tracking-wide">
              {format(getOriginalPrice(totalPrice))}
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

        {/* Finish selector — hidden when a variantGroup already covers the same options */}
        {product.variants && product.variants.length > 1 && !finishGroup && (
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
            <div className="flex items-center justify-between mb-3">
              <p className="text-[0.55rem] tracking-[0.25em] uppercase text-[#8C7B6E]">
                {group.label}
                {group.type !== "text" && (
                  !groupSelections[group.label] ? (
                    <span className="ml-2 text-[#A0622A]">— please select</span>
                  ) : (
                    <span className="ml-2 text-[#2C2220]">— {groupSelections[group.label]}</span>
                  )
                )}
              </p>
              {(group.label ?? "").toLowerCase().includes("size") && (
                <SizeGuideButton image={product.sizeGuideImage} />
              )}
            </div>

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
                      {add ? <span className="ml-1 normal-case">+{format(add)}</span> : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Shipping destination selector */}
        <div>
          <p className="text-[0.55rem] tracking-[0.25em] uppercase text-[#8C7B6E] mb-2">
            Ship to
          </p>
          <div className="relative">
            <select
              value={shippingCountry}
              onChange={(e) => setShippingCountry(e.target.value)}
              className="w-full border border-[#E8B4A8]/50 bg-transparent px-4 py-3 text-[0.65rem] tracking-wide text-[#2C2220] focus:outline-none focus:border-[#2C2220] transition-colors appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238C7B6E' stroke-width='1.2' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
            >
              <option value="">Select your country…</option>
              {COUNTRY_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.countries.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          {shippingCountry && (() => {
            const rate = getShippingRate(shippingCountry, totalPrice);
            return (
              <p className="mt-1.5 text-[0.58rem] tracking-[0.1em] uppercase text-[#8C7B6E] flex items-center gap-2">
                <span className="w-1 h-1 bg-[#A0622A] rounded-full inline-block flex-shrink-0" />
                {rate.amount === 0
                  ? <span className="text-[#A0622A]">Free shipping · {rate.deliveryMin}–{rate.deliveryMax} business days</span>
                  : <span>{format(rate.amount / 100)} shipping · {rate.deliveryMin}–{rate.deliveryMax} business days</span>
                }
              </p>
            );
          })()}
          {!shippingCountry && (
            <p className="mt-1.5 text-[0.55rem] tracking-[0.1em] uppercase text-[#8C7B6E]/60">
              Select country to see shipping cost
            </p>
          )}
        </div>

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
              if (typeof window !== "undefined") {
                const w = window as Window & { fbq?: (...a: unknown[]) => void; gtag?: (...a: unknown[]) => void };
                w.fbq?.("track", "AddToCart", { content_ids: [product.id], content_name: product.name, content_type: "product", value: totalPrice, currency: product.currency });
                w.gtag?.("event", "add_to_cart", { currency: product.currency, value: totalPrice, items: [{ item_id: product.id, item_name: product.name, item_variant: combinedVariant ?? "", price: totalPrice, quantity: 1 }] });
              }
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

          <ShippingNudge price={totalPrice} />
        </div>

        {/* Trust badges */}
        <div className="border-t border-[#E8B4A8]/40 pt-5">
          <TrustBadgesRow />
        </div>

        <ProductDetails
          fullDescription={product.fullDescription}
          specs={product.specs}
        />
      </div>

      {/* Reviews — sits below the gallery on desktop (col 1, row 2); on mobile
          it naturally falls after the buy panel so the CTA stays up top */}
      <ProductReviews category={product.category} productId={product.id} className="md:col-start-1 md:row-start-2" />
    </div>

    {/* Sticky mobile buy bar */}
    {showSticky && (
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#FDF9F7]/95 backdrop-blur-sm border-t border-[#E8B4A8]/40 px-4 pt-3 pb-4 flex flex-col gap-1.5 shadow-[0_-4px_24px_rgba(44,34,32,0.08)] animate-slide-up">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[0.55rem] tracking-[0.15em] uppercase text-[#8C7B6E] truncate">{product.name}</p>
            <p className="text-base font-light text-[#A0622A] tracking-wide">{format(totalPrice)}</p>
          </div>
          <button
            onClick={handleStickyBuy}
            disabled={stickyLoading || !shippingCountry}
            title={!shippingCountry ? "Select your shipping country on the product page" : undefined}
            className="flex-shrink-0 bg-[#2C2220] text-[#FDF9F7] px-6 py-3 text-[0.6rem] tracking-[0.2em] uppercase disabled:opacity-60 transition-colors hover:bg-[#A0622A]"
          >
            {stickyLoading ? "Processing…" : !allGroupsSelected ? "Select options" : !shippingCountry ? "Select country ↑" : "Buy Now"}
          </button>
        </div>
        {stickyError && (
          <p className="text-[0.6rem] tracking-wide text-[#A0622A] text-right">{stickyError}</p>
        )}
        {totalPrice < FREE_SHIPPING_THRESHOLD && (
          <p className="text-[0.55rem] tracking-[0.08em] uppercase text-[#8C7B6E] text-center">
            Add <span className="text-[#2C2220]">{format(FREE_SHIPPING_THRESHOLD - totalPrice)}</span> more → save up to <span className="text-[#2C2220]">{format(8)}</span> shipping (Europe & North America)
          </p>
        )}
      </div>
    )}
    </>
  );
}
