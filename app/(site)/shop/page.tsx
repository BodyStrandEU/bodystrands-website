import { Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "@/components/CategoryFilter";
import { products, CATEGORIES } from "@/lib/products";
import type { Category } from "@/lib/products";
import type { Metadata } from "next";

const CATEGORY_META: Record<string, { title: string; description: string }> = {
  "Belly Chains":       { title: "Belly Chains — Handmade Body Jewelry | Bodystrands", description: "Shop handmade belly chains and waist chains in waterproof stainless steel. Gold and silver, adjustable fit. Handcrafted in Portugal from €17.50." },
  "Back Chains":        { title: "Back Chains — Backless Dress Jewelry | Bodystrands", description: "Dainty back chains and backdrop necklaces for backless dresses and wedding gowns. Tarnish-resistant stainless steel, handmade in Portugal." },
  "Body Chains":        { title: "Body Chains — Festival & Beach Body Jewelry | Bodystrands", description: "Handmade body chains for festivals, beach days, and everyday wear. Waterproof stainless steel in gold and silver. Made in Portugal." },
  "Shoulder Chains":    { title: "Shoulder Chains — Bridal & Wedding Jewelry | Bodystrands", description: "Delicate shoulder chains for weddings, brides, and special occasions. Handcrafted stainless steel body jewelry made in Portugal." },
  "Anklets":            { title: "Anklets — Handmade Beach Ankle Bracelets | Bodystrands", description: "Dainty gold and silver anklets for summer, beach, and everyday wear. Waterproof stainless steel, handmade in Portugal from €17.50." },
  "Bracelets":          { title: "Bracelets — Dainty Handmade Bracelets | Bodystrands", description: "Handmade dainty bracelets in tarnish-resistant stainless steel. Pearl, charm, and chain styles. Crafted in Portugal." },
  "Necklaces":          { title: "Necklaces — Handmade Chain Necklaces | Bodystrands", description: "Dainty handmade necklaces in gold and silver stainless steel. Chokers, lariats, and pendant styles. Made in Portugal." },
  "Hand Chains":        { title: "Hand Chains — Boho Slave Bracelets | Bodystrands", description: "Handmade hand chains connecting wrist to finger. Boho and bridal styles in waterproof stainless steel, made in Portugal." },
  "Head Chains":        { title: "Head Chains — Bridal Hair Jewelry | Bodystrands", description: "Delicate head chains and hair jewelry for brides, weddings, and festivals. Handcrafted stainless steel, made in Portugal." },
  "Eyeglasses Chains":  { title: "Eyeglasses Chains — Stylish Glasses Holders | Bodystrands", description: "Dainty gold and silver eyeglasses chains in stainless steel. Beaded, pearl, and minimalist styles. Handmade in Portugal." },
  "Bikini Clip Chains": { title: "Bikini Clip Chains — Beach Body Jewelry | Bodystrands", description: "Handmade bikini clip chains and beach body jewelry in stainless steel. Perfect for summer holidays and festivals. Made in Portugal." },
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}): Promise<Metadata> {
  const { category } = await searchParams;
  if (category && CATEGORY_META[category]) {
    return CATEGORY_META[category];
  }
  return {
    title: "Shop — Handmade Body Jewelry | Bodystrands",
    description: "Shop handmade body chains, belly chains, back chains, anklets and more. All pieces crafted in waterproof stainless steel, handmade in Portugal.",
  };
}

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
