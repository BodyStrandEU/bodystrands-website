"use client";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Product } from "@/lib/products";

const SWATCH_COLORS: Record<string, string> = {
  "Gold Tone":   "#C8A84B",
  "Silver Tone": "#A8A8A8",
};

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const router    = useRouter();
  const cardRef   = useRef<HTMLDivElement>(null);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const [activeVariant, setActiveVariant] = useState<string | null>(null);
  const [videoOn, setVideoOn] = useState(false);

  // Touch tracking (refs = no re-render overhead)
  const t0        = useRef(0);
  const origin    = useRef({ x: 0, y: 0 });
  const moved     = useRef(false);
  const lastTouch = useRef(0); // debounce click after touch

  const symbol = product.currency === "EUR" ? "€" : product.currency === "GBP" ? "£" : "$";

  const displayImages =
    activeVariant && product.variantImages?.[activeVariant]?.length
      ? product.variantImages[activeVariant]
      : product.images;

  const defaultVideo =
    product.video ??
    (product.variantVideos ? Object.values(product.variantVideos)[0] : undefined);

  const displayVideo =
    activeVariant && product.variantVideos?.[activeVariant]
      ? product.variantVideos[activeVariant]
      : defaultVideo;

  const currentImage = displayImages?.[0];

  function popOut() {}
  function popIn() {}

  // ── Stop / start helpers ───────────────────────────────────────────────────
  const stopRef = useRef<() => void>(() => {});
  stopRef.current = () => {
    setVideoOn(false);
    popIn();
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  function startVideo() {
    window.dispatchEvent(new CustomEvent("card-play", { detail: { id: product.id } }));
    setVideoOn(true);
    const v = videoRef.current;
    if (v && displayVideo) {
      v.currentTime = 0;
      // play() must be called synchronously inside a user-gesture handler
      v.play().catch(() => {});
    }
  }

  // Stop when another card broadcasts
  useEffect(() => {
    const fn = (e: Event) => {
      if ((e as CustomEvent<{ id: string }>).detail.id !== product.id) stopRef.current();
    };
    window.addEventListener("card-play", fn);
    return () => window.removeEventListener("card-play", fn);
  }, [product.id]);

  // ── Mobile touch ───────────────────────────────────────────────────────────
  function onTouchStart(e: React.TouchEvent) {
    t0.current     = Date.now();
    origin.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    moved.current  = false;
    popOut(); // immediate — no React state, no re-render
    startVideo();
  }

  function onTouchMove(e: React.TouchEvent) {
    const dx = Math.abs(e.touches[0].clientX - origin.current.x);
    const dy = Math.abs(e.touches[0].clientY - origin.current.y);
    if (dx > 8 || dy > 8) {
      moved.current = true;
      popIn(); // snap back as soon as user starts scrolling
    }
  }

  function onTouchEnd(e: React.TouchEvent) {
    lastTouch.current = Date.now();
    stopRef.current();
    if (!moved.current && Date.now() - t0.current < 400) {
      e.preventDefault(); // block the 300 ms synthetic click
      router.push(`/shop/${product.id}`);
    }
  }

  // ── Desktop mouse ──────────────────────────────────────────────────────────
  function onMouseEnter() { startVideo(); }
  function onMouseLeave() { stopRef.current(); setActiveVariant(null); }

  // onClick fires on desktop; on mobile the synthetic click is blocked by
  // e.preventDefault() above but we double-guard with the 500 ms window.
  function onCardClick() {
    if (Date.now() - lastTouch.current < 500) return;
    router.push(`/shop/${product.id}`);
  }

  return (
    <div
      ref={cardRef}
      className="group block cursor-pointer relative"
      style={{ borderRadius: "4px" }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onCardClick}
    >
      {/* Media */}
      <div className="relative overflow-hidden bg-[#FDF9F7] aspect-[3/4]">
        {currentImage ? (
          <Image
            src={currentImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            className={`object-cover transition-opacity duration-300 ${
              displayVideo && videoOn ? "opacity-0" : "opacity-100"
            }`}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-px bg-[#A0622A]/30" />
            <p className="text-[0.5rem] tracking-[0.25em] uppercase text-[#A0622A]/40">Coming Soon</p>
            <div className="w-8 h-px bg-[#A0622A]/30" />
          </div>
        )}

        {displayVideo && (
          <video
            ref={videoRef}
            src={displayVideo}
            muted
            loop
            playsInline
            preload="none"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              videoOn ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* Variant swatches — desktop hover only */}
        {product.variants && product.variants.length > 1 && (
          <div className="absolute bottom-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            {product.variants.map((v) => (
              <button
                key={v}
                aria-label={v}
                onMouseEnter={() => setActiveVariant(v)}
                onClick={(e) => e.stopPropagation()}
                className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
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
