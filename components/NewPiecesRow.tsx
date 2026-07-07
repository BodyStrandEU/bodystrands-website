"use client";
import { useRef } from "react";
import Link from "next/link";
import SmartImage from "@/components/SmartImage";
import type { Product } from "@/lib/products";
import { useCurrency } from "@/lib/currency-context";

export default function NewPiecesRow({ featured }: { featured: Product[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const { format } = useCurrency();

  function scrollByAmount(dir: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>(":scope > a")?.offsetWidth ?? el.clientWidth * 0.3;
    el.scrollBy({ left: dir * (cardWidth + 20), behavior: "smooth" });
  }

  return (
    <div className="relative group/row">
      <div
        ref={scrollerRef}
        className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide px-6 md:px-10 pb-2 snap-x snap-mandatory"
      >
        {featured.map((product) => (
          <Link
            key={product.id}
            href={`/shop/${product.id}`}
            className="group flex-shrink-0 w-[55vw] md:w-[22vw] snap-start"
          >
            <div className="relative overflow-hidden aspect-square bg-[#F5F1EF]">
              {product.images[0] && (
                <SmartImage
                  src={product.images[0]}
                  alt={product.altText || product.name}
                  fill
                  sizes="(max-width: 768px) 55vw, 22vw"
                  className="object-cover object-center group-hover:scale-[1.04] transition-transform duration-700"
                />
              )}
            </div>
            <div className="pt-3 px-0.5">
              <p className="text-[0.48rem] tracking-[0.2em] uppercase text-[#8C7B6E]/70 mb-0.5">{product.category}</p>
              <p className="text-[0.72rem] font-light text-[#2C2220] group-hover:text-[#A0622A] transition-colors duration-300 truncate">{product.name}</p>
              <p className="text-[0.65rem] font-light text-[#A0622A] mt-0.5">{format(product.price)}</p>
            </div>
          </Link>
        ))}
        {/* trailing touch spacer */}
        <div className="flex-shrink-0 w-4 md:hidden" aria-hidden />
      </div>

      {/* Desktop-only click arrows — the row already supports touch swipe on mobile */}
      <button
        onClick={() => scrollByAmount(-1)}
        aria-label="Previous pieces"
        className="hidden md:flex absolute left-2 top-[35%] -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-200 z-10 text-[#2C2220] hover:text-[#A0622A] text-lg leading-none"
      >
        ‹
      </button>
      <button
        onClick={() => scrollByAmount(1)}
        aria-label="Next pieces"
        className="hidden md:flex absolute right-2 top-[35%] -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-200 z-10 text-[#2C2220] hover:text-[#A0622A] text-lg leading-none"
      >
        ›
      </button>
    </div>
  );
}
