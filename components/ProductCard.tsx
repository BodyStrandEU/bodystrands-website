"use client";
import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import type { Product } from "@/lib/products";

const SWATCH_COLORS: Record<string, string> = {
  "Gold Tone":   "#C8A84B",
  "Silver Tone": "#A8A8A8",
};

export default function ProductCard({ product }: { product: Product }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeVariant, setActiveVariant] = useState<string | null>(null);
  const symbol = product.currency === "EUR" ? "€" : product.currency === "GBP" ? "£" : "$";

  // Resolve which images/video to show based on active variant
  const displayImages =
    activeVariant && product.variantImages?.[activeVariant]
      ? product.variantImages[activeVariant]
      : product.images;
  const displayVideo =
    activeVariant && product.variantVideos?.[activeVariant]
      ? product.variantVideos[activeVariant]
      : product.video;

  const currentImage = displayImages?.[0];
  const hasVideo = !!displayVideo;

  const handleCardEnter = () => {
    if (videoRef.current && hasVideo) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleCardLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setActiveVariant(null);
  };

  const handleSwatchEnter = (variant: string) => {
    setActiveVariant(variant);
    // Restart video for new variant if it has one
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      const vSrc = product.variantVideos?.[variant] || product.video;
      if (vSrc) videoRef.current.play().catch(() => {});
    }
  };

  return (
    <Link
      href={`/shop/${product.id}`}
      className="group block"
      onMouseEnter={handleCardEnter}
      onMouseLeave={handleCardLeave}
    >
      {/* Media container */}
      <div className="relative overflow-hidden bg-[#F2DDD7] aspect-[3/4]">

        {/* Static image */}
        {currentImage ? (
          <Image
            src={currentImage}
            alt={product.name}
            fill
            className={`object-cover object-center transition-all duration-500 ${
              hasVideo ? "group-hover:opacity-0" : "group-hover:scale-[1.04]"
            }`}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-px bg-[#A0622A]/30" />
            <p className="text-[0.5rem] tracking-[0.25em] uppercase text-[#A0622A]/40">Coming Soon</p>
            <div className="w-8 h-px bg-[#A0622A]/30" />
          </div>
        )}

        {/* Video — Etsy-style hover play */}
        {displayVideo && (
          <video
            ref={videoRef}
            src={displayVideo}
            muted
            loop
            playsInline
            preload="none"
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
        )}

        {/* Variant swatches — appear on card hover */}
        {product.variants && product.variants.length > 1 && (
          <div className="absolute bottom-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            {product.variants.map((v) => (
              <button
                key={v}
                aria-label={v}
                onMouseEnter={(e) => { e.preventDefault(); handleSwatchEnter(v); }}
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
        {/* Variant label under price */}
        {product.variants && product.variants.length > 1 && (
          <p className="mt-1 text-[0.5rem] tracking-[0.15em] uppercase text-[#8C7B6E]">
            {activeVariant ?? product.variants.join(" · ")}
          </p>
        )}
      </div>
    </Link>
  );
}
