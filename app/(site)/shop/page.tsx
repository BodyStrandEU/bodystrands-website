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

  const filtered =
    category && isValidCategory(category)
      ? activeProducts.filter((p) => p.category === category)
      : activeProducts;

  const activeLabel = category && isValidCategory(category) ? category : "All Pieces";

  return (
    <div className="min-h-screen pt-28 md:pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-3 md:px-10">

        {/* Page header */}
        <div className="mb-12 md:mb-16">
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
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-2 gap-y-6 md:gap-x-6 md:gap-y-12">
                {filtered.map((product, i) => (
                  <ProductCard key={product.id} product={product} priority={i < 4} />
                ))}
              </div>
            ) : (
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
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
