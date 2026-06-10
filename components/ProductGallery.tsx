"use client";
import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/products";

const SWATCH_COLORS: Record<string, string> = {
  "Gold Tone":   "#C8A84B",
  "Silver Tone": "#A8A8A8",
};

export default function ProductGallery({ product }: { product: Product }) {
  const [activeVariant, setActiveVariant] = useState<string>(
    product.variants?.[0] ?? ""
  );
  const [activeIndex, setActiveIndex] = useState(0);

  // Images for the selected variant, falling back to default images
  const images =
    product.variantImages?.[activeVariant] ??
    product.images ??
    [];

  const mainImage = images[activeIndex] ?? images[0];

  const handleVariant = (v: string) => {
    setActiveVariant(v);
    setActiveIndex(0); // reset to first image of new variant
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden bg-[#F2DDD7]">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={`${product.name} — ${activeVariant}`}
            fill
            className="object-cover object-center transition-opacity duration-400"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[#A0622A]/40">Image coming soon</p>
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`flex-shrink-0 relative w-16 h-16 overflow-hidden transition-all duration-200 ${
                activeIndex === i ? "ring-1 ring-[#A0622A]" : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={src} alt={`${product.name} view ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Variant selector */}
      {product.variants && product.variants.length > 1 && (
        <div className="mt-2">
          <p className="text-[0.55rem] tracking-[0.25em] uppercase text-[#8C7B6E] mb-3">
            Finish — <span className="text-[#2C2220]">{activeVariant}</span>
          </p>
          <div className="flex gap-3">
            {product.variants.map((v) => (
              <button
                key={v}
                onClick={() => handleVariant(v)}
                aria-label={v}
                title={v}
                className={`flex items-center gap-2 px-3 py-2 border text-[0.58rem] tracking-[0.15em] uppercase transition-all duration-200 ${
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
    </div>
  );
}
