"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/lib/products";
import { getOriginalPrice } from "@/lib/pricing";
import { useCurrency } from "@/lib/currency-context";

// Hand-picked by Giordano — real top sellers across a spread of categories,
// not auto-derived from sales data.
const BEST_SELLER_IDS = [
  "initial-letter-anklet",
  "barefoot-toe-chain-anklet",
  "stainless-steel-belly-chain",
  "snake-belly-chain",
  "gold-body-necklace",
  "pink-cross-choker",
  "goddess-shoulder-chain",
  "pearl-backdrop-necklace",
  "bridal-forehead-chain",
];

function BestSellerCard({ product }: { product: (typeof products)[number] }) {
  const { format } = useCurrency();
  const image = product.images?.[0];

  return (
    <Link
      href={`/shop/${product.id}`}
      className="group block w-[220px] md:w-[260px] flex-shrink-0"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F5EDE8]">
        {image && (
          <Image
            src={image}
            alt={product.altText || product.name}
            fill
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            sizes="260px"
          />
        )}
        <span className="absolute top-3 left-3 bg-[#2C2220] text-[#FDF9F7] text-[0.5rem] tracking-[0.2em] uppercase px-2.5 py-1">
          Best Seller
        </span>
      </div>
      <div className="pt-3">
        <p className="text-[0.5rem] tracking-[0.2em] uppercase text-[#8C7B6E]/70 mb-1">
          {product.category}
        </p>
        <h3 className="text-[0.8rem] font-light tracking-wide text-[#2C2220] leading-tight group-hover:text-[#A0622A] transition-colors duration-300 mb-1.5">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-medium tracking-wide text-[#A0622A]">
            {format(product.price)}
          </span>
          <span className="text-[0.7rem] font-light tracking-wide text-[#8C7B6E]/50 line-through">
            {format(getOriginalPrice(product.price))}
          </span>
        </div>
      </div>
    </Link>
  );
}

// Auto-scroll speed in pixels per frame (~60fps).
const AUTO_SCROLL_SPEED = 0.6;
// How long to wait after the user lets go (touch/click) before auto-scroll resumes.
const RESUME_DELAY_MS = 2200;

export default function BestSellersCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bestSellers = BEST_SELLER_IDS
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is (typeof products)[number] => !!p);

  // Auto-scroll loop, driven by scrollLeft directly (not a CSS transform) so the
  // same element can also be freely, natively scrolled/dragged by the user at any time.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let rafId: number;
    function step() {
      if (track && !pausedRef.current) {
        track.scrollLeft += AUTO_SCROLL_SPEED;
        // Content is duplicated once — once we've scrolled past the first copy,
        // silently rewind by exactly one copy's width so the loop reads as infinite.
        const half = track.scrollWidth / 2;
        if (track.scrollLeft >= half) {
          track.scrollLeft -= half;
        }
      }
      rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, []);

  function pause() {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    pausedRef.current = true;
  }

  function scheduleResume() {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_DELAY_MS);
  }

  if (bestSellers.length === 0) return null;

  // Duplicated once so the auto-scroll rewind above has a seamless loop point.
  const track = [...bestSellers, ...bestSellers];

  return (
    <section className="py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10 mb-8 md:mb-10">
        <p className="text-[0.6rem] tracking-[0.3em] uppercase text-[#A0622A] mb-3">Fan Favorites</p>
        <h2 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220]">Best Sellers</h2>
      </div>

      <div
        ref={trackRef}
        className="no-scrollbar flex gap-4 md:gap-6 overflow-x-auto px-6 md:px-10"
        style={{ scrollBehavior: "auto" }}
        onMouseEnter={pause}
        onMouseLeave={scheduleResume}
        onTouchStart={pause}
        onTouchEnd={scheduleResume}
        onPointerDown={pause}
        onPointerUp={scheduleResume}
      >
        {track.map((product, i) => (
          <BestSellerCard key={`${product.id}-${i}`} product={product} />
        ))}
      </div>
    </section>
  );
}
