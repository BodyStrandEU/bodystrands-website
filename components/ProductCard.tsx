"use client";
import { useRef, useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "@/components/SmartImage";
import type { Product } from "@/lib/products";
import { INFOGRAPHIC_IMAGES } from "@/lib/products";
import { getOriginalPrice } from "@/lib/pricing";

const SWATCH_COLORS: Record<string, string> = {
  "Gold Tone":   "#C8A84B",
  "Silver Tone": "#A8A8A8",
};

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const router = useRouter();

  const [activeVariant, setActiveVariant] = useState<string | null>(
    (product.variants ?? [])[0] ?? null
  );
  const [slideIndex, setSlideIndex] = useState(0);

  const mediaRef   = useRef<HTMLDivElement>(null);
  const touchStart = useRef({ x: 0, y: 0, time: 0 });
  const swipeDir   = useRef<"h" | "v" | null>(null);
  const lastTouch  = useRef(0);

  const symbol = product.currency === "EUR" ? "€" : product.currency === "GBP" ? "£" : "$";

  // All images for the card carousel — infographics excluded
  const combinedImages = useMemo(() => {
    const perProduct = new Set(product.infographicImages ?? []);
    const isInfographic = (src: string) => INFOGRAPHIC_IMAGES.has(src) || perProduct.has(src);
    // Gallery mode: flat unified array
    if (product.gallery) {
      return product.gallery.filter(src => !isInfographic(src));
    }
    // Per-variant mode: combine all variant images in order
    const variants = product.variants ?? [];
    if (variants.length > 0 && product.variantImages) {
      return variants.flatMap((v) => product.variantImages![v] ?? []).filter(src => !isInfographic(src));
    }
    return (product.images ?? []).filter(src => !isInfographic(src));
  }, [product.gallery, product.variants, product.variantImages, product.images, product.infographicImages]);

  // Which variant does each slide belong to? (only used in per-variant mode)
  const slideVariantMap = useMemo(() => {
    if (product.gallery) return [] as (string | null)[];
    const variants = product.variants ?? [];
    if (variants.length === 0 || !product.variantImages) return [] as (string | null)[];
    const result: (string | null)[] = [];
    for (const v of variants) {
      for (let i = 0; i < (product.variantImages[v]?.length ?? 0); i++) {
        result.push(v);
      }
    }
    return result;
  }, [product.gallery, product.variants, product.variantImages]);

  // Active swatch badge follows the carousel position automatically
  useEffect(() => {
    const v = slideVariantMap[slideIndex];
    if (v) setActiveVariant(v);
  }, [slideIndex, slideVariantMap]);

  // Tap a swatch → jump to that variant's hero image
  function jumpToVariant(v: string) {
    if (product.gallery && product.variantHeroes?.[v]) {
      const heroUrl = product.variantHeroes[v];
      const idx = combinedImages.indexOf(heroUrl);
      setSlideIndex(idx !== -1 ? idx : 0);
    } else {
      const idx = slideVariantMap.indexOf(v);
      setSlideIndex(idx !== -1 ? idx : 0);
    }
    setActiveVariant(v);
  }

  // Native touch listeners — direction detected here so preventDefault fires
  // on the very first touchmove before the browser commits to scrolling
  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;

    function onStart(e: TouchEvent) {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
      swipeDir.current = null;
    }

    function onMove(e: TouchEvent) {
      if (swipeDir.current === null) {
        const dx = Math.abs(e.touches[0].clientX - touchStart.current.x);
        const dy = Math.abs(e.touches[0].clientY - touchStart.current.y);
        if (dx > 4 || dy > 4) swipeDir.current = dx >= dy ? "h" : "v";
      }
      if (swipeDir.current === "h") e.preventDefault();
    }

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove",  onMove,  { passive: false });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove",  onMove);
    };
  }, []);

  function goTo(i: number) {
    setSlideIndex(Math.max(0, Math.min(i, combinedImages.length - 1)));
  }

  function onTouchEnd(e: React.TouchEvent) {
    lastTouch.current = Date.now();
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const dt = Date.now() - touchStart.current.time;

    if (swipeDir.current === "h" && Math.abs(dx) > 28) {
      dx < 0 ? goTo(slideIndex + 1) : goTo(slideIndex - 1);
    } else if (Math.abs(dx) < 12 && Math.abs(dy) < 12 && dt < 350) {
      e.preventDefault();
      router.push(`/shop/${product.id}`);
    }
    swipeDir.current = null;
  }

  function onCardClick() {
    if (Date.now() - lastTouch.current < 500) return;
    router.push(`/shop/${product.id}`);
  }

  return (
    <div
      className="group block cursor-pointer relative"
      style={{ borderRadius: "4px" }}
      onClick={onCardClick}
    >
      {/* Media container */}
      <div
        ref={mediaRef}
        className="relative overflow-hidden bg-[#FDF9F7] aspect-[3/4] select-none"
        onTouchEnd={onTouchEnd}
      >
        {combinedImages.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-px bg-[#A0622A]/30" />
            <p className="text-[0.5rem] tracking-[0.25em] uppercase text-[#A0622A]/40">Coming Soon</p>
            <div className="w-8 h-px bg-[#A0622A]/30" />
          </div>
        )}

        {combinedImages.map((src, i) => (
          <Image
            key={src + i}
            src={src}
            alt={product.altText || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority && i === 0}
            loading={priority && i === 0 ? "eager" : "lazy"}
            className={`object-cover transition-opacity duration-300 ${
              i === slideIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Slide dots */}
        {combinedImages.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10 pointer-events-none">
            {combinedImages.map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all duration-200 ${
                  i === slideIndex ? "w-3 h-1 bg-white" : "w-1 h-1 bg-white/45"
                }`}
              />
            ))}
          </div>
        )}

        {/* Quick-view pill — desktop hover only */}
        <div className={`absolute inset-x-0 flex justify-center z-10 pointer-events-none transition-[opacity,transform] duration-300 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 ${
          product.variants && product.variants.length > 1 ? "bottom-14" : "bottom-9"
        }`}>
          <span className="bg-white/85 text-[#2C2220] text-[0.5rem] tracking-[0.25em] uppercase px-5 py-2">
            View Piece
          </span>
        </div>

        {/* Desktop prev / next arrows */}
        {combinedImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goTo(slideIndex - 1); }}
              disabled={slideIndex === 0}
              aria-label="Previous"
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:!opacity-0 z-10 text-[#2C2220] text-sm leading-none"
            >
              ‹
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goTo(slideIndex + 1); }}
              disabled={slideIndex === combinedImages.length - 1}
              aria-label="Next"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:!opacity-0 z-10 text-[#2C2220] text-sm leading-none"
            >
              ›
            </button>
          </>
        )}

        {/* Variant swatches — tap/click to jump to that variant's images */}
        {product.variants && product.variants.length > 1 && (
          <div className="absolute bottom-7 left-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            {product.variants.map((v) => (
              <button
                key={v}
                aria-label={v}
                onClick={(e) => { e.stopPropagation(); jumpToVariant(v); }}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  activeVariant === v ? "border-white scale-110" : "border-white/50"
                }`}
                style={{ backgroundColor: SWATCH_COLORS[v] ?? "#888" }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="pt-3 px-1">
        <h3 className="text-[0.7rem] font-light tracking-[0.03em] text-[#2C2220] leading-tight group-hover:text-[#A0622A] transition-colors duration-300 truncate">
          {product.name}
        </h3>
        <div className="mt-1 flex items-baseline justify-between gap-1.5">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-[0.68rem] font-light tracking-wide text-[#A0622A]">
              {symbol}{product.price.toFixed(2)}
            </span>
            <span className="text-[0.58rem] font-light tracking-wide text-[#8C7B6E]/50 line-through">
              {symbol}{getOriginalPrice(product.price).toFixed(2)}
            </span>
          </div>
          <span className="text-[#A0622A] text-[0.75rem] leading-none opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-[opacity,transform] duration-300">
            →
          </span>
        </div>
        {product.variants && product.variants.length > 1 && (
          <p className="mt-0.5 text-[0.45rem] tracking-[0.12em] uppercase text-[#8C7B6E]">
            {activeVariant ?? product.variants.join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}
