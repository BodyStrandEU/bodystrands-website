import { Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "@/components/CategoryFilter";
import { products, CATEGORIES } from "@/lib/products";
import type { Category } from "@/lib/products";

export const metadata = {
  title: "Shop — Bodystrands",
  description: "Shop handmade body chains, belly chains, anklets, and more. All pieces crafted in tarnish-resistant stainless steel.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const isValidCategory = (c: string): c is Category =>
    (CATEGORIES as readonly string[]).includes(c);

  const activeProducts = products.filter((p) => p.active !== false);

  const isFiltered = !!(category && isValidCategory(category));
  const filtered   = isFiltered
    ? activeProducts.filter((p) => p.category === category)
    : activeProducts;

  const activeLabel = isFiltered ? category : "All Pieces";

  // Group by category in CATEGORIES order when showing all
  const grouped = isFiltered
    ? null
    : CATEGORIES
        .map((cat) => ({
          category: cat,
          items: activeProducts.filter((p) => p.category === cat),
        }))
        .filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen pt-28 md:pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-1 md:px-10">

        {/* Page header */}
        <div className="mb-8 md:mb-12 px-2 md:px-0">
          <p className="text-[0.52rem] tracking-[0.35em] uppercase text-[#A0622A] mb-3">Bodystrands</p>
          <h1 className="font-heading text-5xl md:text-6xl font-light text-[#2C2220] leading-none">
            {activeLabel}
          </h1>
          <p className="mt-3 text-[0.6rem] tracking-[0.15em] uppercase text-[#8C7B6E]">
            {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
          </p>
        </div>

        {/* Layout: filter on top (mobile) / sidebar (desktop) */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-16">
          <Suspense fallback={null}>
            <CategoryFilter />
          </Suspense>

          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="py-24 text-center">
                <div className="flex items-center justify-center gap-6 mb-8">
                  <div className="flex-1 h-px bg-[#E8B4A8]/30 max-w-24" />
                  <span className="text-[#E8B4A8]/50 text-[0.6rem]">◆</span>
                  <div className="flex-1 h-px bg-[#E8B4A8]/30 max-w-24" />
                </div>
                <p className="text-sm font-light tracking-wide text-[#8C7B6E]">
                  New pieces coming soon.
                </p>
              </div>
            ) : grouped ? (
              /* All Pieces — grouped by category */
              <div className="flex flex-col gap-12 md:gap-16">
                {grouped.map((group, gi) => (
                  <div key={group.category}>
                    {/* Category divider */}
                    <div className="flex items-center gap-4 mb-5 px-0.5">
                      <span className="text-[0.55rem] tracking-[0.28em] uppercase text-[#A0622A] whitespace-nowrap">
                        {group.category}
                      </span>
                      <div className="flex-1 h-px bg-[#E8B4A8]/40" />
                      <span className="text-[0.5rem] tracking-[0.15em] uppercase text-[#8C7B6E]/60 whitespace-nowrap">
                        {group.items.length} {group.items.length === 1 ? "piece" : "pieces"}
                      </span>
                    </div>

                    {/* Grid for this category */}
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-0.5 gap-y-4 md:gap-x-4 md:gap-y-8">
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
              /* Single category — flat grid */
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-0.5 gap-y-4 md:gap-x-4 md:gap-y-8">
                {filtered.map((product, i) => (
                  <ProductCard key={product.id} product={product} priority={i < 4} />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
