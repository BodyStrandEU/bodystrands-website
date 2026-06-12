"use client";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Product } from "@/lib/products";

const SWATCH_COLORS: Record<string, string> = {
  "Gold Tone":   "#C8A84B",
  "Silver Tone": "#A8A8A8",
};

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeVariant, setActiveVariant] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);
  const [popped, setPopped] = useState(false);
  const touchStartTime = useRef(0);
  const touchMoved = useRef(false);
  // Always-fresh deactivate callable from global event listener
  const deactivateRef = useRef<() => void>(() => {});

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

  deactivateRef.current = () => {
    setHovering(false);
    setPopped(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // Stop when another card starts
  useEffect(() => {
    function onOtherPlay(e: Event) {
      if ((e as CustomEvent<{ id: string }>).detail.id !== product.id) {
        deactivateRef.current();
      }
    }
    window.addEventListener("card-play", onOtherPlay);
    return () => window.removeEventListener("card-play", onOtherPlay);
  }, [product.id]);

  // Reload video when source changes while playing
  useEffect(() => {
    if (!videoRef.current || !hovering || !displayVideo) return;
    videoRef.current.load();
    videoRef.current.play().catch(() => {});
  }, [displayVideo, hovering]);

  function startPlay() {
    window.dispatchEvent(new CustomEvent("card-play", { detail: { id: product.id } }));
    setHovering(true);
    if (videoRef.current && displayVideo) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }

  // ── Desktop ──────────────────────────────────────────────────────────────
  function handleMouseEnter() { startPlay(); }
  function handleMouseLeave() { deactivateRef.current(); setActiveVariant(null); }

  // ── Mobile ───────────────────────────────────────────────────────────────
  function handleTouchStart() {
    touchStartTime.current = Date.now();
    touchMoved.current = false;
    setPopped(true);
    startPlay();
  }

  function handleTouchMove() {
    touchMoved.current = true;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const duration = Date.now() - touchStartTime.current;
    deactivateRef.current();
    // Short tap (< 350 ms, no scroll) → navigate
    if (!touchMoved.current && duration < 350) {
      e.preventDefault();
      router.push(`/shop/${product.id}`);
    }
  }

  return (
    <div
      className="group block cursor-pointer relative"
      style={{
        transform: popped ? "scale(1.07)" : "scale(1)",
        boxShadow: popped ? "0 20px 48px rgba(0,0,0,0.22)" : "none",
        transition: popped
          ? "transform 0.14s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.14s ease-out"
          : "transform 0.28s ease-in-out, box-shadow 0.28s ease-in-out",
        zIndex: popped ? 10 : 0,
        borderRadius: "4px",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => router.push(`/shop/${product.id}`)}
    >
      {/* Media */}
      <div className="relative overflow-hidden bg-[#FDF9F7] aspect-square">
        {currentImage ? (
          <Image
            src={currentImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-contain transition-all duration-500 ${
              displayVideo
                ? hovering ? "opacity-0" : "opacity-100"
                : "group-hover:scale-[1.03]"
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
            preload="metadata"
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
              hovering ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* Variant swatches */}
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
      <div className="pt-3">
        <p className="text-[0.52rem] tracking-[0.2em] uppercase text-[#8C7B6E] mb-1">
          {product.category}
        </p>
        <h3 className="text-[0.75rem] font-light tracking-[0.06em] text-[#2C2220] leading-snug group-hover:text-[#A0622A] transition-colors duration-300">
          {product.name}
        </h3>
        <p className="mt-1.5 text-[0.7rem] font-light tracking-wide text-[#2C2220]">
          {symbol}{product.price.toFixed(2)}
        </p>
        {product.variants && product.variants.length > 1 && (
          <p className="mt-1 text-[0.5rem] tracking-[0.15em] uppercase text-[#8C7B6E]">
            {activeVariant ?? product.variants.join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}
