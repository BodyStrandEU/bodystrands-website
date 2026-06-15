"use client";
import { useRef, useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Product } from "@/lib/products";

const SWATCH_COLORS: Record<string, string> = {
  "Gold Tone":   "#C8A84B",
  "Silver Tone": "#A8A8A8",
};

type MediaItem =
  | { type: "image"; src: string }
  | { type: "video"; src: string };

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const router   = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [activeVariant, setActiveVariant] = useState<string | null>(null);
  const [slideIndex, setSlideIndex]       = useState(0);

  const mediaRef   = useRef<HTMLDivElement>(null);
  const touchStart = useRef({ x: 0, y: 0, time: 0 });
  const swipeDir   = useRef<"h" | "v" | null>(null);
  const lastTouch  = useRef(0);

  const symbol = product.currency === "EUR" ? "€" : product.currency === "GBP" ? "£" : "$";

  // Default to first variant's full image set so shop grid shows all photos
  const defaultImages =
    product.variantImages && Object.values(product.variantImages)[0]?.length
      ? Object.values(product.variantImages)[0]
      : product.images;

  const displayImages =
    activeVariant && product.variantImages?.[activeVariant]?.length
      ? product.variantImages[activeVariant]
      : defaultImages;

  const defaultVideo =
    product.video ??
    (product.variantVideos ? Object.values(product.variantVideos)[0] : undefined);

  const displayVideo =
    activeVariant && product.variantVideos?.[activeVariant]
      ? product.variantVideos[activeVariant]
      : defaultVideo;

  // First image → video (if any) → remaining images
  const mediaList = useMemo<MediaItem[]>(() => {
    const imgs   = displayImages ?? [];
    const result: MediaItem[] = [];
    if (imgs[0])      result.push({ type: "image", src: imgs[0] });
    if (displayVideo) result.push({ type: "video", src: displayVideo });
    for (let i = 1; i < imgs.length; i++) result.push({ type: "image", src: imgs[i] });
    return result;
  }, [displayImages, displayVideo]);

  // Reset carousel when variant changes
  useEffect(() => { setSlideIndex(0); }, [activeVariant]);

  // Native listeners handle ALL touch detection — must run in native handlers
  // so direction is known and preventDefault() fires on the very first touchmove
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

  const currentSlide = mediaList[slideIndex] ?? mediaList[0];

  // Auto-play / pause video based on active slide
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (currentSlide?.type === "video") {
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
      v.currentTime = 0;
    }
  }, [currentSlide]);

  // Pre-buffer video when user is on the slide just before it
  // so swiping to it plays instantly with no network delay
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !displayVideo) return;
    const videoIdx = mediaList.findIndex((m) => m.type === "video");
    if (videoIdx !== -1 && Math.abs(slideIndex - videoIdx) <= 1) {
      v.preload = "auto";
      if (v.readyState === 0) v.load();
    }
  }, [slideIndex, mediaList, displayVideo]);

  function goTo(i: number) {
    setSlideIndex(Math.max(0, Math.min(i, mediaList.length - 1)));
  }

  // ── Touch end — direction already detected by native handlers above ────────
  function onTouchEnd(e: React.TouchEvent) {
    lastTouch.current = Date.now();
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const dt = Date.now() - touchStart.current.time;

    if (swipeDir.current === "h" && Math.abs(dx) > 28) {
      // Horizontal swipe → change slide
      if (dx < 0) goTo(slideIndex + 1);
      else        goTo(slideIndex - 1);
    } else if (Math.abs(dx) < 12 && Math.abs(dy) < 12 && dt < 350) {
      // Quick tap → navigate to product
      e.preventDefault();
      router.push(`/shop/${product.id}`);
    }
    swipeDir.current = null;
  }

  // Desktop click (guarded against accidental fire after touch)
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
      {/* ── Media container ─────────────────────────────────────────────────── */}
      <div
        ref={mediaRef}
        className="relative overflow-hidden bg-[#FDF9F7] aspect-[3/4] select-none"
        onTouchEnd={onTouchEnd}
      >
        {/* Images (all rendered; only active is visible) */}
        {mediaList.map((item, i) =>
          item.type === "image" ? (
            <Image
              key={item.src + i}
              src={item.src}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority && i === 0}
              loading={priority && i === 0 ? "eager" : "lazy"}
              className={`object-cover transition-opacity duration-300 ${
                i === slideIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          ) : null
        )}

        {/* No-image placeholder */}
        {mediaList.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-px bg-[#A0622A]/30" />
            <p className="text-[0.5rem] tracking-[0.25em] uppercase text-[#A0622A]/40">Coming Soon</p>
            <div className="w-8 h-px bg-[#A0622A]/30" />
          </div>
        )}

        {/* Video */}
        {displayVideo && (
          <video
            ref={videoRef}
            src={displayVideo}
            muted
            loop
            playsInline
            preload="metadata"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              currentSlide?.type === "video" ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* Slide dots */}
        {mediaList.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10 pointer-events-none">
            {mediaList.map((item, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all duration-200 ${
                  i === slideIndex
                    ? "w-3 h-1 bg-white"
                    : "w-1 h-1 bg-white/45"
                }`}
              />
            ))}
          </div>
        )}

        {/* Desktop prev / next arrows */}
        {mediaList.length > 1 && (
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
              disabled={slideIndex === mediaList.length - 1}
              aria-label="Next"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:!opacity-0 z-10 text-[#2C2220] text-sm leading-none"
            >
              ›
            </button>
          </>
        )}

        {/* Variant swatches — desktop hover, above dots */}
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

      {/* ── Info ────────────────────────────────────────────────────────────── */}
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
