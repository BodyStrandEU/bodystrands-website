"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import ProductGallery from "@/components/ProductGallery";
import BuyButton from "@/components/BuyButton";
import ProductDetails from "@/components/ProductDetails";
import type { Product } from "@/lib/products";

const SWATCH_COLORS: Record<string, string> = {
  "Gold Tone": "#C8A84B",
  "Silver Tone": "#A8A8A8",
};

export default function ProductPageClient({ product }: { product: Product }) {
  const [activeVariant, setActiveVariant] = useState<string>(
    product.variants?.[0] ?? ""
  );
  const [groupSelections, setGroupSelections] = useState<Record<string, string>>({});

  const symbol =
    product.currency === "EUR" ? "€" : product.currency === "GBP" ? "£" : "$";

  const allGroupsSelected =
    !product.variantGroups ||
    product.variantGroups.every((g) => groupSelections[g.label]);

  const combinedVariant =
    [
      activeVariant,
      ...(product.variantGroups
        ?.map((g) => groupSelections[g.label])
        .filter(Boolean) ?? []),
    ]
      .filter(Boolean)
      .join(" — ") || undefined;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">

      {/* Gallery — full bleed on mobile, media only */}
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

        <p className="text-2xl font-light text-[#A0622A] tracking-wide">
          {symbol}{product.price.toFixed(2)}
        </p>

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

        {/* Additional variant groups (e.g. Attachment type) */}
        {product.variantGroups?.map((group) => (
          <div key={group.label}>
            <p className="text-[0.55rem] tracking-[0.25em] uppercase text-[#8C7B6E] mb-3">
              {group.label}
              {!groupSelections[group.label] ? (
                <span className="ml-2 text-[#A0622A]">— please select</span>
              ) : (
                <span className="ml-2 text-[#2C2220]">— {groupSelections[group.label]}</span>
              )}
            </p>
            <div className="flex gap-3 flex-wrap">
              {group.options.map((opt) => (
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
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Buy button */}
        <BuyButton
          productId={product.id}
          variant={combinedVariant}
          disabled={!allGroupsSelected}
          disabledMessage="Please select all options above"
        />

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
  );
}
