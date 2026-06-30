"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import SmartImage from "@/components/SmartImage";
import { products } from "@/lib/products";
import { getRecentlyViewed } from "@/lib/recentlyViewed";

export default function RecentlyViewed({ excludeId }: { excludeId: string }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(getRecentlyViewed());
  }, []);

  const items = ids
    .filter((id) => id !== excludeId)
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p && p.active !== false)
    .slice(0, 8);

  if (items.length === 0) return null;

  return (
    <section className="mt-20 md:mt-28 pb-8">
      <div className="flex items-center gap-5 mb-8">
        <div className="flex-1 h-px bg-[#E8B4A8]/30" />
        <h2 className="font-heading text-2xl md:text-3xl font-light text-[#2C2220] whitespace-nowrap tracking-wide">
          Recently Viewed
        </h2>
        <div className="flex-1 h-px bg-[#E8B4A8]/30" />
      </div>

      <div className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide -mx-6 md:mx-0 px-6 md:px-0 pb-2 snap-x snap-mandatory">
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
                {product.currency === "EUR" ? "€" : product.currency === "GBP" ? "£" : "$"}{product.price.toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
