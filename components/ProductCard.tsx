"use client";
import { useRef, useState, useEffect, useCallback } from "react";
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
  // Mobile: first tap plays video, second tap navigates
  const [mobileTapped, setMobileTapped] = useState(false);

  const symbol = product.currency === "EUR" ? "€" : product.currency === "GBP" ? "£" : "$";

  const displayImages =
    activeVariant && product.variantImages?.[activeVariant]
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

  // When video source changes while playing, reload
  useEffect(() => {
    if (!videoRef.current || !hovering || !displayVideo) return;
    videoRef.current.load();
    videoRef.current.play().catch(() => {});
  }, [displayVideo, hovering]);

  const playVideo = useCallback(() => {
    setHovering(true);
    if (videoRef.current && displayVideo) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [displayVideo]);

  const stopVideo = useCallback(() => {
    setHovering(false);
    setActiveVariant(null);
    setMobileTapped(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

  // Desktop hover handlers
  const handleMouseEnter = () => {
    setMobileTapped(false);
    playVideo();
  };
  const handleMouseLeave = stopVideo;

  // Mobile: first tap plays video, second tap navigates
  const handleMediaTouch = (e: React.TouchEvent) => {
    if (!displayVideo) return; // no video — let the link navigate normally
    if (!mobileTapped) {
      e.preventDefault(); // block navigation on first tap
      setMobileTapped(true);
      playVideo();
    }
    // second tap: don't preventDefault → Link navigates
  };

  // Tap on the card text area always navigates (user taps name/price)
  const handleInfoTouch = () => {
    if (mobileTapped) {
      router.push(`/shop/${product.id}`);
    }
  };

  return (
    <div className="group block cursor-pointer" onClick={() => { if (!mobileTapped) router.push(`/shop/${product.id}`); }}>
      {/* Media container */}
      <div
        className="relative overflow-hidden bg-[#FDF9F7] aspect-square"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMediaTouch}
        onClick={(e) => {
          if (mobileTapped) {
            e.stopPropagation();
            router.push(`/shop/${product.id}`);
          }
        }}
      >
        {/* Static image */}
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

        {/* Video */}
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

        {/* Mobile: "Tap again to view" hint when video is playing */}
        {mobileTapped && hovering && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center z-10">
            <span className="text-[0.5rem] tracking-[0.15em] uppercase text-white bg-black/40 px-3 py-1">
              Tap again to view
            </span>
          </div>
        )}

        {/* Variant swatches — appear on hover */}
        {product.variants && product.variants.length > 1 && (
          <div className="absolute bottom-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            {product.variants.map((v) => (
              <button
                key={v}
                aria-label={v}
                onMouseEnter={() => setActiveVariant(v)}
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
      <div className="pt-3" onTouchStart={handleInfoTouch}>
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
