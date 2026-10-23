"use client";
import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/products";
import ShopFilterSort, { DEFAULT_FILTERS, applyFilters, filtersActive, type FilterState } from "@/components/ShopFilterSort";
import { defaultTone, imageIn } from "@/lib/productSets";

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
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const active = filtersActive(filters);
  const results = useMemo(() => (active ? applyFilters(filtered, filters) : filtered), [active, filtered, filters]);
  // With a Silver filter, cards open on their silver photo (and gold likewise)
  const heroFor = (p: Product) => (filters.finish && defaultTone(p) !== filters.finish ? imageIn(p, filters.finish) : undefined);

  const gridCls =
    cols === 1
      ? "grid grid-cols-1 gap-y-8"
      : "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-px gap-y-16 md:gap-x-1 md:gap-y-14";

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
      {/* Filter / Sort (left) + column toggle on phones (right) */}
      <div className="flex items-center justify-between mb-5 px-4 md:px-10">
        <div className="flex items-center gap-4">
          <ShopFilterSort value={filters} onChange={setFilters} resultCount={applyFilters(filtered, filters).length} />
          {active && (
            <span className="whitespace-nowrap text-[0.6rem] tracking-[0.15em] uppercase text-[#8C7B6E] pt-0.5">
              {results.length} {results.length === 1 ? "piece" : "pieces"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5 border border-[#E8B4A8]/40 p-1 lg:hidden">
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

      {active ? (
        /* Filtered / sorted — one flat grid */
        results.length === 0 ? (
          <div className="py-20 text-center px-6">
            <p className="text-sm font-light tracking-wide text-[#8C7B6E] mb-6">No pieces match these filters.</p>
            <button type="button" onClick={() => setFilters(DEFAULT_FILTERS)}
              className="min-h-[44px] px-6 border border-[#2C2220]/25 text-[0.62rem] tracking-[0.2em] uppercase text-[#2C2220]">
              Clear filters
            </button>
          </div>
        ) : (
          <div className={gridCls}>
            {results.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 4} heroImageOverride={heroFor(product)} />
            ))}
          </div>
        )
      ) : grouped ? (
        /* All Pieces — grouped by category */
        <div className="flex flex-col gap-12 md:gap-16">
          {grouped.map((group, gi) => (
            <div key={group.category}>
              <div className="flex items-center gap-4 mb-5 px-4 md:px-10">
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
