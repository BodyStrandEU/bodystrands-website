import { Suspense } from "react";
import { CATEGORY_CONTENT } from "@/lib/category-content";
import BuyingGuide from "@/components/BuyingGuide";
import CategoryFilter from "@/components/CategoryFilter";
import ShopGridClient from "@/components/ShopGridClient";
import { products, CATEGORIES, CATEGORY_ORDER } from "@/lib/products";
import type { Category } from "@/lib/products";

// The shop grid for "All Pieces" or one category. Rendered by two pre-built routes:
// /shop and /shop/c/[category]. next.config.ts rewrites /shop?category=X to the second one, so the
// public address (which Google ranks) stays /shop?category=X while the page is served from cache.
export default function ShopView({ category }: { category?: string }) {
  const isValidCategory = (c: string): c is Category =>
    (CATEGORIES as readonly string[]).includes(c);

  // Plus size pieces live on /plus-size only, men's pieces on /men only — both
  // excluded here so they don't also appear mixed into general category browsing.
  const activeProducts = products.filter((p) => p.active !== false && !p.plusSize && p.audience !== "men");

  const isFiltered = !!(category && isValidCategory(category));
  const filtered   = isFiltered
    ? activeProducts.filter((p) => p.category === category)
    : activeProducts;

  const activeLabel = isFiltered ? category : "All Pieces";
  const content = isFiltered ? CATEGORY_CONTENT[category] : undefined;

  // Group by category in the admin-editable display order when showing all
  const grouped = isFiltered
    ? null
    : CATEGORY_ORDER
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
          {content && (
            <p className="mt-5 max-w-2xl text-sm font-light leading-loose tracking-wide text-[#2C2220]/80">
              {content.intro}
            </p>
          )}
        </div>

        {/* Category filter — horizontal row above the grid, same on every breakpoint */}
        <Suspense fallback={null}>
          <CategoryFilter />
        </Suspense>
      </div>

      {/* Full-bleed grid — breaks out of the max-w-7xl container so product photos
          run edge-to-edge like SKIMS', instead of being boxed in by page margins. */}
      <ShopGridClient filtered={filtered} grouped={grouped} />

      {/* Buying guide + FAQ — gives Google (and shoppers) the words to match searches
          like "back necklace" or "arm chain" that the product grid alone can't. */}
      {content && (
        <div className="max-w-7xl mx-auto px-1 md:px-10">
          <BuyingGuide label={`${activeLabel} Guide`} content={content} />
        </div>
      )}
    </div>
  );
}
