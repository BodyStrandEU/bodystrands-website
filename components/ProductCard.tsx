"use client";
import { useRef, useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Product } from "@/lib/products";

const SWATCH_COLORS: Record<string, string> = {
  "Gold Tone":   "#C8A84B",
  "Silver Tone": "#A8A8A8",
};

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const router = useRouter();

  const [activeVariant, setActiveVariant] = useState<string | null>(null);
  const [slideIndex, setSlideIndex]       = useState(0);

  const mediaRef   = useRef<HTMLDivElement>(null);
  const touchStart = useRef({ x: 0, y: 0, time: 0 });
  const swipeDir   = useRef<"h" | "v" | null>(null);
  const lastTouch  = useRef(0);

  const symbol = product.currency === "EUR" ? "€" : product.currency === "GBP" ? "£" : "$";

  // Images only — video lives on the product detail page
  const defaultImages =
    product.variantImages && Object.values(product.variantImages)[0]?.length
      ? Object.values(product.variantImages)[0]
      : product.images;

  const images = useMemo(
    () =>
      activeVariant && product.variantImages?.[activeVariant]?.length
        ? product.variantImages[activeVariant]
        : defaultImages ?? [],
    [activeVariant, product.variantImages, defaultImages]
  );

  // Reset to first image when variant changes
  useEffect(() => { setSlideIndex(0); }, [activeVariant]);

  // Native touch listeners — direction detected here so preventDefault fires
  // on the very first touchmove, before the browser commits to scrolling
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
    setSlideIndex(Math.max(0, Math.min(i, images.length - 1)));
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
        {images.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-px bg-[#A0622A]/30" />
            <p className="text-[0.5rem] tracking-[0.25em] uppercase text-[#A0622A]/40">Coming Soon</p>
            <div className="w-8 h-px bg-[#A0622A]/30" />
          </div>
        )}

        {/* All images rendered; opacity controls which is visible */}
        {images.map((src, i) => (
          <Image
            key={src + i}
            src={src}
            alt={product.name}
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
        {images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10 pointer-events-none">
            {images.map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all duration-200 ${
                  i === slideIndex ? "w-3 h-1 bg-white" : "w-1 h-1 bg-white/45"
                }`}
              />
            ))}
          </div>
        )}

        {/* Desktop prev / next arrows */}
        {images.length > 1 && (
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
              disabled={slideIndex === images.length - 1}
              aria-label="Next"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:!opacity-0 z-10 text-[#2C2220] text-sm leading-none"
            >
              ›
            </button>
          </>
        )}

        {/* Variant swatches — desktop hover */}
        {product.variants && product.variants.length > 1 && (
          <div className="absolute bottom-7 left-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            {product.variants.map((v) => (
              <button
                key={v}
                aria-label={v}
                onMouseEnter={() => setActiveVariant(v)}
                onClick={(e) => e.stopPropagation()}
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
      <div className="pt-1.5 px-0.5">
        <h3 className="text-[0.65rem] font-light tracking-[0.03em] text-[#2C2220] leading-tight group-hover:text-[#A0622A] transition-colors duration-300 truncate">
          {product.name}
        </h3>
        <p className="mt-0.5 text-[0.65rem] font-light tracking-wide text-[#2C2220]">
          {symbol}{product.price.toFixed(2)}
        </p>
        {product.variants && product.variants.length > 1 && (
          <p className="mt-0 text-[0.45rem] tracking-[0.12em] uppercase text-[#8C7B6E]">
            {activeVariant ?? product.variants.join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}
