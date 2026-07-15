import { Suspense } from "react";
import CategoryFilter from "@/components/CategoryFilter";
import ShopGridClient from "@/components/ShopGridClient";
import { products, CATEGORIES } from "@/lib/products";
import type { Category } from "@/lib/products";
import type { Metadata } from "next";

const CATEGORY_META: Record<string, { title: string; description: string }> = {
  "Belly Chains":       { title: "Belly Chains — Handmade Body Jewelry | Bodystrands", description: "Shop handmade belly chains and waist chains in waterproof stainless steel. Gold and silver, adjustable fit. Handcrafted in Portugal and Canada from €17.50." },
  "Back Chains":        { title: "Back Chains — Backless Dress Jewelry | Bodystrands", description: "Dainty back chains and backdrop necklaces for backless dresses and wedding gowns. Tarnish-resistant stainless steel, handmade in Portugal and Canada." },
  "Body Chains":        { title: "Body Chains — Festival & Beach Body Jewelry | Bodystrands", description: "Handmade body chains for festivals, beach days, and everyday wear. Waterproof stainless steel in gold and silver. Made in Portugal and Canada." },
  "Shoulder & Arm Chains":    { title: "Shoulder & Arm Chains — Body Jewelry | Bodystrands", description: "Dainty shoulder chains and layered arm chains for weddings, festivals, beach days, and everyday wear. Handcrafted stainless steel body jewelry made in Portugal and Canada." },
  "Anklets":            { title: "Anklets — Handmade Beach Ankle Bracelets | Bodystrands", description: "Dainty gold and silver anklets for summer, beach, and everyday wear. Waterproof stainless steel, handmade in Portugal and Canada from €17.50." },
  "Bracelets":          { title: "Bracelets — Dainty Handmade Bracelets | Bodystrands", description: "Handmade dainty bracelets in tarnish-resistant stainless steel. Pearl, charm, and chain styles. Crafted in Portugal and Canada." },
  "Necklaces":          { title: "Necklaces — Handmade Chain Necklaces | Bodystrands", description: "Dainty handmade necklaces in gold and silver stainless steel. Chokers, lariats, and pendant styles. Made in Portugal and Canada." },
  "Hand Chains":        { title: "Hand Chains — Boho Slave Bracelets | Bodystrands", description: "Handmade hand chains connecting wrist to finger. Boho and bridal styles in waterproof stainless steel, made in Portugal and Canada." },
  "Head Chains":        { title: "Head Chains — Bridal Hair Jewelry | Bodystrands", description: "Delicate head chains and hair jewelry for brides, weddings, and festivals. Handcrafted stainless steel, made in Portugal and Canada." },
  "Eyeglasses Chains":  { title: "Eyeglasses Chains — Stylish Glasses Holders | Bodystrands", description: "Dainty gold and silver eyeglasses chains in stainless steel. Beaded, pearl, and minimalist styles. Handmade in Portugal and Canada." },
  "Bikini Clip Chains": { title: "Bikini Clip Chains — Beach Body Jewelry | Bodystrands", description: "Handmade bikini clip chains and beach body jewelry in stainless steel. Perfect for summer holidays and festivals. Made in Portugal and Canada." },
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}): Promise<Metadata> {
  const { category } = await searchParams;
  if (category && CATEGORY_META[category]) {
    return {
      ...CATEGORY_META[category],
      alternates: { canonical: `/shop?category=${encodeURIComponent(category)}` },
    };
  }
  return {
    title: "Shop — Handmade Body Jewelry | Bodystrands",
    description: "Shop handmade body chains, belly chains, back chains, anklets and more. All pieces crafted in waterproof stainless steel, handmade in Portugal and Canada.",
    alternates: { canonical: "/shop" },
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

        {/* Layout: filter sidebar (desktop) / pills (mobile) + grid */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-16">
          <Suspense fallback={null}>
            <CategoryFilter />
          </Suspense>

          <div className="flex-1 min-w-0">
            <ShopGridClient filtered={filtered} grouped={grouped} />
          </div>
        </div>

      </div>
    </div>
  );
}
