"use client";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import type { Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const symbol = product.currency === "EUR" ? "€" : product.currency === "GBP" ? "£" : "$";

  const handleMouseEnter = () => {
    if (videoRef.current && product.video) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <Link
      href={`/shop/${product.id}`}
      className="group block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Media container */}
      <div className="relative overflow-hidden bg-[#F2DDD7] aspect-[3/4]">

        {/* Static image — always present, hides when video plays */}
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className={`object-cover object-center transition-all duration-500 ${
              product.video ? "group-hover:opacity-0" : "group-hover:scale-[1.04]"
            }`}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-px bg-[#A0622A]/30" />
            <p className="text-[0.5rem] tracking-[0.25em] uppercase text-[#A0622A]/40">Coming Soon</p>
            <div className="w-8 h-px bg-[#A0622A]/30" />
          </div>
        )}

        {/* Video — overlays image on hover, Etsy-style */}
        {product.video && (
          <video
            ref={videoRef}
            src={product.video}
            muted
            loop
            playsInline
            preload="none"
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
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
        {product.variants && (
          <div className="mt-2 flex gap-1.5 flex-wrap">
            {product.variants.map((v) => (
              <span key={v} className="text-[0.45rem] tracking-[0.15em] uppercase text-[#8C7B6E] border border-[#E8B4A8]/60 px-1.5 py-0.5">
                {v}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
