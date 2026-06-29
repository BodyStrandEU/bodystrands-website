"use client";
import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/products";

type Section = { category: string; items: Product[] };

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill={active ? "#2C2220" : "#8C7B6E"} aria-hidden>
      <rect x="0.5" y="0.5" width="6.5" height="6.5" rx="0.5" />
      <rect x="9"   y="0.5" width="6.5" height="6.5" rx="0.5" />
      <rect x="0.5" y="9"   width="6.5" height="6.5" rx="0.5" />
      <rect x="9"   y="9"   width="6.5" height="6.5" rx="0.5" />
    </svg>
  );
}

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill={active ? "#2C2220" : "#8C7B6E"} aria-hidden>
      <rect x="0.5" y="1"   width="15" height="6" rx="0.5" />
      <rect x="0.5" y="9"   width="15" height="6" rx="0.5" />
    </svg>
  );
}

export default function ShopGridClient({
  filtered,
  grouped,
}: {
  filtered: Product[];
  grouped: Section[] | null;
}) {
  const [cols, setCols] = useState<1 | 2>(2);

  const gridCls =
    cols === 1
      ? "grid grid-cols-1 gap-y-8"
      : "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-0.5 gap-y-4 md:gap-x-4 md:gap-y-8";

  if (filtered.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="flex-1 h-px bg-[#E8B4A8]/30 max-w-24" />
          <span className="text-[#E8B4A8]/50 text-[0.6rem]">◆</span>
          <div className="flex-1 h-px bg-[#E8B4A8]/30 max-w-24" />
        </div>
        <p className="text-sm font-light tracking-wide text-[#8C7B6E]">New pieces coming soon.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Column toggle — mobile only */}
      <div className="flex justify-end mb-5 lg:hidden">
        <div className="flex items-center gap-0.5 border border-[#E8B4A8]/40 p-1">
          <button
            onClick={() => setCols(2)}
            aria-label="2-column grid"
            className="p-1.5 transition-colors"
          >
            <GridIcon active={cols === 2} />
          </button>
          <div className="w-px h-4 bg-[#E8B4A8]/40" />
          <button
            onClick={() => setCols(1)}
            aria-label="Single column"
            className="p-1.5 transition-colors"
          >
            <ListIcon active={cols === 1} />
          </button>
        </div>
      </div>

      {grouped ? (
        /* All Pieces — grouped by category */
        <div className="flex flex-col gap-12 md:gap-16">
          {grouped.map((group, gi) => (
            <div key={group.category}>
              <div className="flex items-center gap-4 mb-5 px-0.5">
                <span className="text-[0.55rem] tracking-[0.28em] uppercase text-[#A0622A] whitespace-nowrap">
                  {group.category}
                </span>
                <div className="flex-1 h-px bg-[#E8B4A8]/40" />
                <span className="text-[0.5rem] tracking-[0.15em] uppercase text-[#8C7B6E]/60 whitespace-nowrap">
                  {group.items.length} {group.items.length === 1 ? "piece" : "pieces"}
                </span>
              </div>
              <div className={gridCls}>
                {group.items.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priority={gi === 0 && i < 4}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Filtered — flat grid */
        <div className={gridCls}>
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
