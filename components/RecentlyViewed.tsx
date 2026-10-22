"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import SmartImage from "@/components/SmartImage";
import { products } from "@/lib/products";
import { getRecentlyViewed } from "@/lib/recentlyViewed";
import { useCurrency } from "@/lib/currency-context";
import { getSalePrice } from "@/lib/pricing";

export default function RecentlyViewed({ excludeId }: { excludeId: string }) {
  const [ids, setIds] = useState<string[]>([]);
  const { format } = useCurrency();
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIds(getRecentlyViewed());
  }, []);

  const items = ids
    .filter((id) => id !== excludeId)
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p && p.active !== false)
    .slice(0, 8);

  if (items.length === 0) return null;

  function scrollByCards(direction: 1 | -1) {
    const el = railRef.current;
    if (!el) return;
    // Scroll by roughly one card's width (plus its gap) at a time
    const card = el.querySelector<HTMLElement>(":scope > a");
    const amount = (card?.offsetWidth ?? el.clientWidth * 0.4) + 20;
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  return (
    <section className="mt-20 md:mt-28 pb-8">
      <div className="flex items-center gap-5 mb-8">
        <div className="flex-1 h-px bg-[#E8B4A8]/30" />
        <h2 className="font-heading text-2xl md:text-3xl font-light text-[#2C2220] whitespace-nowrap tracking-wide">
          Recently Viewed
        </h2>
        <div className="flex-1 h-px bg-[#E8B4A8]/30" />
      </div>

      <div className="relative group/rail">
        <div
          ref={railRef}
          className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide -mx-6 md:mx-0 px-6 md:px-0 pb-2 snap-x snap-mandatory"
        >
          {items.map((product) => (
            <Link
              key={product.id}
              href={`/shop/${product.id}`}
              className="group flex-shrink-0 w-[40vw] md:w-[16vw] snap-start"
            >
              <div className="relative overflow-hidden aspect-square bg-[#F5F1EF]">
                {product.images[0] && (
                  <SmartImage
                    src={product.images[0]}
                    alt={product.altText || product.name}
                    fill
                    sizes="(max-width: 768px) 40vw, 16vw"
                    className="object-cover object-center group-hover:scale-[1.04] transition-transform duration-700"
                  />
                )}
              </div>
              <div className="pt-2.5 px-0.5">
                <p className="text-[0.7rem] font-light text-[#2C2220] group-hover:text-[#A0622A] transition-colors duration-300 truncate">
                  {product.name}
                </p>
                <p className="text-[0.62rem] font-light text-[#A0622A] mt-0.5">
                  {getSalePrice(product) !== null ? (
                    <>
                      {format(getSalePrice(product)!)}
                      <span className="ml-1.5 text-[#8C7B6E]/60 line-through">{format(product.price)}</span>
                    </>
                  ) : (
                    format(product.price)
                  )}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Desktop prev/next arrows — the rail scrolls but had no visible way to click through it */}
        {items.length > 3 && (
          <>
            <button
              type="button"
              onClick={() => scrollByCards(-1)}
              aria-label="Scroll left"
              className="hidden md:flex absolute left-0 top-[38%] -translate-y-1/2 -translate-x-1/2 w-9 h-9 items-center justify-center rounded-full bg-white/90 shadow-sm text-[#2C2220] text-lg opacity-0 group-hover/rail:opacity-100 transition-opacity duration-200 hover:bg-white z-10"
            >‹</button>
            <button
              type="button"
              onClick={() => scrollByCards(1)}
              aria-label="Scroll right"
              className="hidden md:flex absolute right-0 top-[38%] -translate-y-1/2 translate-x-1/2 w-9 h-9 items-center justify-center rounded-full bg-white/90 shadow-sm text-[#2C2220] text-lg opacity-0 group-hover/rail:opacity-100 transition-opacity duration-200 hover:bg-white z-10"
            >›</button>
          </>
        )}
      </div>
    </section>
  );
}
