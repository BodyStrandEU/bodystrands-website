"use client";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "@/components/SmartImage";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { products } from "@/lib/products";
import { getSalePrice } from "@/lib/pricing";
import { useCurrency } from "@/lib/currency-context";
import { COUNTRY_GROUPS, getShippingRate } from "@/lib/shipping";
import { TrustBadgesInline } from "@/components/TrustBadges";

const SWATCH_COLORS: Record<string, string> = {
  "Gold Tone":   "#C8A84B",
  "Silver Tone": "#A8A8A8",
};

const FREE_THRESHOLD = 50;
// Keep in sync by hand with GIFT_WRAP_FEE_EUR in app/(site)/api/checkout/route.ts
const GIFT_WRAP_FEE = 4;

// Pre-checkout nudge (shown before a shipping country is entered) — keep these thresholds in
// sync by hand with lib/shipping.ts's US/CA/DISCOUNTED_COUNTRIES blocks and Navbar.tsx's
// SHIPPING_LINES. Once a shipping country is selected, shippingRate.freeThreshold below takes over.
const PRE_CHECKOUT_FREE_SHIPPING: Partial<Record<string, ReactNode>> = {
  USD: <>Free shipping on USA orders over <span className="text-[#2C2220]">$100.00 USD</span></>,
  CAD: <>Free shipping on Canada orders over <span className="text-[#2C2220]">$75.00 CAD</span></>,
  SGD: <>Free shipping on Singapore orders over <span className="text-[#2C2220]">$75.00 SGD</span></>,
  INR: <>Free shipping on India orders over <span className="text-[#2C2220]">₹4,500 INR</span></>,
  AUD: <>Free shipping on Australia orders over <span className="text-[#2C2220]">$85.00 AUD</span></>,
  BRL: <>Free shipping on Brazil orders over <span className="text-[#2C2220]">R$305.00 BRL</span></>,
  SAR: <>Free shipping on Saudi Arabia orders over <span className="text-[#2C2220]">200.00 SAR</span></>,
  TRY: <>Free shipping on Turkey orders over <span className="text-[#2C2220]">₺1,850 TRY</span></>,
  AED: <>Free shipping on UAE orders over <span className="text-[#2C2220]">200.00 AED</span></>,
};

// Single global cart drawer — slides in from the right, rendered once in the site layout.
// Opens either as a "pick required options" panel (quickAddProduct set, from a product
// card's quick-add button) or as the full mini-cart (navbar cart icon, or after a simple
// add completes). Portal straight to document.body + inline styles for the critical
// positioning, same pattern as the panel this replaced — see that component's history
// for why (any transformed ancestor traps position:fixed, so don't nest this anywhere).
export default function CartDrawer() {
  const {
    items, count, subtotal, remove, updateQty, updateVariant, clear,
    shippingCountry, setShippingCountry,
    drawerOpen, closeDrawer, openDrawer,
    quickAddProduct, add: addToCart,
  } = useCart();

  const { currency, format, rates } = useCurrency();

  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftNote, setGiftNote] = useState("");
  const [groupSelections, setGroupSelections] = useState<Record<string, string>>({});
  const [pickerFinish, setPickerFinish] = useState<string | null>(null);
  const [pickerAdded, setPickerAdded] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (drawerOpen) {
      const raf = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(raf);
    }
    setEntered(false);
  }, [drawerOpen]);

  // Lock background scroll while the drawer is open so the page behind it can't scroll
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [drawerOpen]);

  // Reset picker state fresh every time a new product opens the picker
  useEffect(() => {
    setGroupSelections({});
    setPickerFinish(null);
    setPickerAdded(false);
  }, [quickAddProduct?.id]);

  function handleClose() {
    setEntered(false);
    setTimeout(closeDrawer, 250);
  }

  // Shipping calculation
  const shippingRate    = shippingCountry ? getShippingRate(shippingCountry, subtotal, rates) : null;
  const shippingAmount  = shippingRate ? shippingRate.amount / 100 : null;
  const orderTotal      = subtotal + (shippingAmount ?? 0) + (giftWrap ? GIFT_WRAP_FEE : 0);
  const remaining       = Math.max(0, (shippingRate?.freeThreshold ?? FREE_THRESHOLD) - subtotal);

  async function checkout() {
    if (items.length === 0) return;
    if (!shippingCountry) return;
    setLoading(true);
    setError("");

    if (typeof window !== "undefined") {
      const w = window as Window & { fbq?: (...a: unknown[]) => void; gtag?: (...a: unknown[]) => void };
      w.fbq?.("track", "InitiateCheckout");
      w.gtag?.("event", "begin_checkout", {
        currency: "EUR",
        value:    orderTotal,
        items: items.map((i) => ({
          item_id:      i.productId,
          item_name:    i.productName,
          item_variant: i.variant ?? "",
          price:        i.unitPrice,
          quantity:     i.quantity,
        })),
      });
    }
    try {
      const res  = await fetch("/api/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          items:   items.map((i) => ({ productId: i.productId, variant: i.variant, groupSelections: i.groupSelections, quantity: i.quantity })),
          country: shippingCountry,
          giftWrap,
          giftNote: giftWrap ? giftNote : undefined,
        }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) { clear(); window.location.href = data.url; }
      else { setError(data.error ?? "Something went wrong."); setLoading(false); }
    } catch { setError("Connection error."); setLoading(false); }
  }

  // ---- Picker mode (quickAddProduct set) ----
  const product = quickAddProduct;
  const groups  = product?.variantGroups ?? [];
  const salePrice = product ? getSalePrice(product) : null;

  const priceAdd = groups.reduce((sum, group) => {
    if (group.type === "text") return sum;
    const selected = groupSelections[group.label];
    if (!selected || !group.optionPrices) return sum;
    return sum + (group.optionPrices[selected] ?? 0);
  }, 0);

  const totalPrice = product ? (salePrice ?? product.price) + priceAdd : 0;

  // Finish (Gold/Silver Tone etc.) is a swatch on the card, not a variantGroup — but once
  // the picker is already open for another reason (Size), require it too so quick-add can't
  // silently commit to whatever finish happened to be showing.
  const finishOptions = (product?.variants ?? []).length > 1 ? product!.variants! : [];
  const finishSelected = finishOptions.length === 0 || !!pickerFinish;

  const allGroupsSelected = finishSelected && groups.every((g) => {
    const val = groupSelections[g.label];
    if (g.type === "text") return !!val && val.trim().length > 0;
    return !!val;
  });

  const missingGroup = groups.find((g) => {
    const val = groupSelections[g.label];
    if (g.type === "text") return !(val && val.trim().length > 0);
    return !val;
  });
  const missingLabel = !finishSelected ? "Finish" : missingGroup?.label;

  const combinedVariant =
    [
      pickerFinish,
      ...groups.map((g) => {
        const val = groupSelections[g.label];
        if (!val) return null;
        return `${g.label}: ${val}`;
      }),
    ]
      .filter(Boolean)
      .join(" — ") || undefined;

  function handlePickerAdd() {
    if (!product || !allGroupsSelected || pickerAdded) return;
    const finishImage = pickerFinish
      ? (product.variantHeroes?.[pickerFinish] ?? product.variantImages?.[pickerFinish]?.[0])
      : undefined;
    addToCart({
      productId:   product.id,
      productName: product.name,
      variant:     combinedVariant,
      priceAdd,
      groupSelections,
      unitPrice:   totalPrice,
      image:       finishImage ?? product.images?.[0],
      currency:    product.currency,
    });
    setPickerAdded(true);
    if (typeof window !== "undefined") {
      const w = window as Window & { fbq?: (...a: unknown[]) => void; gtag?: (...a: unknown[]) => void };
      w.fbq?.("track", "AddToCart", { content_ids: [product.id], content_name: product.name, content_type: "product", value: totalPrice, currency: product.currency });
      w.gtag?.("event", "add_to_cart", { currency: product.currency, value: totalPrice, items: [{ item_id: product.id, item_name: product.name, item_variant: combinedVariant ?? "", price: totalPrice, quantity: 1 }] });
      fetch("/api/cart-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, variant: combinedVariant }),
      }).catch(() => {});
    }
    // Hand off to the normal cart-list view once the item lands
    setTimeout(openDrawer, 650);
  }

  if (!mounted || !drawerOpen) return null;

  return createPortal(
    <div
      onClick={handleClose}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 999999,
        display: "flex",
        justifyContent: "flex-end",
        background: "rgba(44,34,32,0.4)",
        backdropFilter: "blur(2px)",
        opacity: entered ? 1 : 0,
        transition: "opacity 300ms ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex",
          flexDirection: "column",
          width: "min(100%, 26rem)",
          height: "100%",
          background: "#FDF9F7",
          boxShadow: "-8px 0 30px rgba(0,0,0,0.25)",
          transform: entered ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms ease-out",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8B4A8]/30">
          <p className="text-[0.6rem] tracking-[0.3em] uppercase text-[#A0622A]">
            {product ? product.category : `Your Cart ${count > 0 ? `(${count})` : ""}`}
          </p>
          <button onClick={handleClose} aria-label="Close" className="text-[#2C2220] hover:text-[#A0622A] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {product ? (
          /* ---- Picker mode ---- */
          <>
            <div className="cart-drawer-scroll flex-1 overflow-y-auto px-6 py-6" style={{ minHeight: 0 }}>
              <div className="flex items-start gap-4 mb-8">
                {product.images?.[0] && (
                  <div className="relative w-24 h-24 flex-shrink-0 bg-white overflow-hidden">
                    <Image src={product.images[0]} alt={product.altText || product.name} fill sizes="96px" className="object-cover" />
                  </div>
                )}
                <div className="min-w-0 pt-1">
                  <p className="font-heading text-xl font-light text-[#2C2220] leading-snug">{product.name}</p>
                  <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-sm font-light text-[#2C2220]">{format(totalPrice)}</span>
                    {salePrice !== null && (
                      <span className="text-xs font-light text-[#8C7B6E]/50 line-through">{format(product.price + priceAdd)}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-7">
                {finishOptions.length > 0 && (
                  <div>
                    <p className="text-[0.55rem] tracking-[0.25em] uppercase text-[#8C7B6E] mb-3">
                      Finish
                      {!pickerFinish ? (
                        <span className="ml-2 text-[#A0622A]">— please select</span>
                      ) : (
                        <span className="ml-2 text-[#2C2220]">— {pickerFinish}</span>
                      )}
                    </p>
                    <div className="flex gap-2.5 flex-wrap">
                      {finishOptions.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setPickerFinish(opt)}
                          className={`flex items-center gap-2 px-4 py-3 border text-[0.58rem] tracking-[0.15em] uppercase transition-all duration-200 ${
                            pickerFinish === opt
                              ? "border-[#2C2220] text-[#2C2220]"
                              : "border-[#E8B4A8]/50 text-[#8C7B6E] hover:border-[#2C2220]"
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: SWATCH_COLORS[opt] ?? "#888" }} />
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {groups.map((group) => (
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
                        onChange={(e) => setGroupSelections((prev) => ({ ...prev, [group.label]: e.target.value }))}
                        placeholder={group.placeholder ?? `Enter ${group.label.toLowerCase()}`}
                        className="w-full border border-[#E8B4A8]/50 px-4 py-3 text-sm font-light text-[#2C2220] tracking-wide placeholder:text-[#8C7B6E]/60 focus:outline-none focus:border-[#2C2220] transition-colors bg-transparent"
                      />
                    ) : (
                      <div className="flex gap-2.5 flex-wrap">
                        {(group.options ?? []).map((opt) => {
                          const add = group.optionPrices?.[opt];
                          return (
                            <button
                              key={opt}
                              onClick={() => setGroupSelections((prev) => ({ ...prev, [group.label]: opt }))}
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
              </div>
            </div>

            <div className="px-6 py-5 border-t border-[#E8B4A8]/30">
              <button
                onClick={handlePickerAdd}
                disabled={!allGroupsSelected || pickerAdded}
                className="btn-primary-filled w-full text-center py-4 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {pickerAdded ? "Added to Cart ✓" : !allGroupsSelected ? `Select ${missingLabel ?? "Options"}` : "Add to Cart"}
              </button>
            </div>
          </>
        ) : items.length === 0 ? (
          /* ---- Empty cart ---- */
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[#8C7B6E] mb-4">Your cart is empty</p>
              <Link
                href="/shop"
                onClick={handleClose}
                className="text-[0.6rem] tracking-[0.18em] uppercase text-[#A0622A] hover:text-[#8A5222] transition-colors underline underline-offset-2"
              >
                Browse collection
              </Link>
            </div>
          </div>
        ) : (
          /* ---- Cart list + checkout ---- */
          <>
            <div className="cart-drawer-scroll flex-1 overflow-y-auto divide-y divide-[#E8B4A8]/30" style={{ minHeight: 0 }}>
              {items.map((item) => {
                const fullProduct = products.find((p) => p.id === item.productId);
                const otherVariants = (fullProduct?.variants ?? []).filter((v) => v !== item.variant);
                return (
                  <div key={item.cartId} className="flex gap-4 p-5 items-start">
                    {item.image ? (
                      <div className="w-20 h-20 flex-shrink-0 bg-[#F5EDE8] relative overflow-hidden">
                        <Image src={item.image} alt={item.productName} fill sizes="80px" className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 flex-shrink-0 bg-[#F5EDE8]" />
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-[0.68rem] tracking-wide text-[#2C2220] leading-snug">{item.productName}</p>
                      {item.variant && (
                        <p className="text-[0.55rem] tracking-[0.12em] uppercase text-[#8C7B6E] mt-0.5">{item.variant}</p>
                      )}

                      {/* Switch finish/color — the swatch on the card is small, this gives an easy way to fix a wrong pick */}
                      {fullProduct && otherVariants.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {fullProduct.variants!.map((v) => {
                            const heroImg = fullProduct.variantHeroes?.[v] ?? fullProduct.variantImages?.[v]?.[0];
                            return (
                              <button
                                key={v}
                                aria-label={`Switch to ${v}`}
                                onClick={() => updateVariant(item.cartId, v, heroImg)}
                                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                                  item.variant === v ? "border-[#2C2220]" : "border-transparent"
                                }`}
                                style={{ backgroundColor: SWATCH_COLORS[v] ?? "#888" }}
                              />
                            );
                          })}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
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
                        <p className="text-[0.68rem] text-[#2C2220] font-light">
                          {format(item.unitPrice * item.quantity)}
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
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-[#E8B4A8]/40 p-5 flex flex-col gap-3">

              <div className="flex justify-between items-baseline">
                <span className="text-[0.58rem] tracking-[0.15em] uppercase text-[#8C7B6E]">Subtotal</span>
                <span className="text-base font-light text-[#2C2220]">{format(subtotal)}</span>
              </div>

              <div>
                <label className="block text-[0.52rem] tracking-[0.2em] uppercase text-[#8C7B6E] mb-1.5">
                  Ship to
                </label>
                <select
                  value={shippingCountry}
                  onChange={(e) => setShippingCountry(e.target.value)}
                  className="w-full border border-[#E8B4A8]/50 bg-transparent px-3 py-2 text-[0.6rem] tracking-wide text-[#2C2220] focus:outline-none focus:border-[#2C2220] transition-colors appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238C7B6E' stroke-width='1.2' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
                >
                  <option value="">Select country…</option>
                  {COUNTRY_GROUPS.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.countries.map((c) => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {shippingCountry && shippingRate && (
                <div className="flex justify-between items-baseline">
                  <span className="text-[0.55rem] tracking-[0.12em] uppercase text-[#8C7B6E]">
                    Shipping · {shippingRate.deliveryMin}–{shippingRate.deliveryMax} days
                  </span>
                  <span className="text-[0.65rem] font-light text-[#2C2220]">
                    {shippingRate.amount === 0 ? (
                      <span className="text-[#A0622A]">Free</span>
                    ) : (
                      format(shippingRate.amount / 100)
                    )}
                  </span>
                </div>
              )}

              {shippingCountry && shippingRate && shippingRate.amount > 0 && shippingRate.freeThreshold != null && remaining > 0 && (
                <p className="text-[0.52rem] tracking-[0.08em] uppercase text-[#8C7B6E] leading-relaxed">
                  Add <span className="text-[#A0622A]">{format(remaining)}</span> more for free shipping —{" "}
                  <Link href="/shop" onClick={handleClose} className="text-[#A0622A] underline underline-offset-2">browse more</Link>
                </p>
              )}
              {!shippingCountry && remaining > 0 && (
                <p className="text-[0.52rem] tracking-[0.08em] uppercase text-[#8C7B6E] leading-relaxed">
                  {PRE_CHECKOUT_FREE_SHIPPING[currency] ?? (
                    <>Free shipping on Europe & North America orders over{" "}
                    <span className="text-[#2C2220]">{format(FREE_THRESHOLD)}</span></>
                  )}
                </p>
              )}

              <div className="border-t border-[#E8B4A8]/30 pt-3">
                <label className="flex items-center justify-between gap-2 cursor-pointer">
                  <span className="flex items-center gap-2 text-[0.58rem] tracking-[0.1em] uppercase text-[#2C2220]">
                    <input
                      type="checkbox"
                      checked={giftWrap}
                      onChange={(e) => setGiftWrap(e.target.checked)}
                      className="w-3.5 h-3.5 accent-[#A0622A]"
                    />
                    Gift wrap this order
                  </span>
                  <span className="text-[0.6rem] text-[#8C7B6E]">+{format(GIFT_WRAP_FEE)}</span>
                </label>
                {giftWrap && (
                  <textarea
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value.slice(0, 500))}
                    placeholder="Add a gift note (optional)"
                    rows={2}
                    maxLength={500}
                    className="mt-2 w-full border border-[#E8B4A8]/50 bg-transparent px-3 py-2 text-[0.6rem] tracking-wide text-[#2C2220] placeholder:text-[#8C7B6E]/70 focus:outline-none focus:border-[#2C2220] transition-colors resize-none"
                  />
                )}
              </div>

              {shippingCountry && shippingRate && (
                <div className="flex justify-between items-baseline pt-2 border-t border-[#E8B4A8]/30">
                  <span className="text-[0.6rem] tracking-[0.15em] uppercase text-[#2C2220]">Total</span>
                  <span className="text-lg font-light text-[#2C2220]">{format(orderTotal)}</span>
                </div>
              )}

              {error && <p className="text-[0.55rem] text-[#A0622A]">{error}</p>}

              <button
                onClick={checkout}
                disabled={loading || !shippingCountry}
                title={!shippingCountry ? "Please select your shipping country above" : undefined}
                className="w-full bg-[#2C2220] text-[#FDF9F7] py-3.5 text-[0.6rem] tracking-[0.22em] uppercase hover:bg-[#A0622A] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Processing…"
                  : !shippingCountry
                  ? "Select Country to Checkout"
                  : `Checkout — ${format(orderTotal)}`}
              </button>

              <TrustBadgesInline />

              <Link
                href="/shop"
                onClick={handleClose}
                className="block text-center text-[0.55rem] tracking-[0.15em] uppercase text-[#8C7B6E] hover:text-[#A0622A] transition-colors"
              >
                Continue shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
