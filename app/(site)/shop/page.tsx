import { Suspense } from "react";
import { CATEGORY_CONTENT } from "@/lib/category-content";
import BuyingGuide from "@/components/BuyingGuide";
import CategoryFilter from "@/components/CategoryFilter";
import ShopGridClient from "@/components/ShopGridClient";
import { products, CATEGORIES } from "@/lib/products";
import type { Category } from "@/lib/products";
import type { Metadata } from "next";

const CATEGORY_META: Record<string, { title: string; description: string }> = {
  "Rings": { title: "Birthstone Rings & Evil Eye Rings | Bodystrands", description: "Dainty birthstone stacking rings in all 12 birth month colours, an adjustable evil eye ring and a natural rhodochrosite ring, €19.20." },
  "Leg Chains": { title: "Thigh Chains & Leg Chains — Gold & Silver | Bodystrands", description: "Slip-on thigh chains, a birthstone thigh chain and a waist-to-thigh chain in gold and silver stainless steel. From €28." },
  "Belly Chains":       { title: "Belly Chains & Waist Chains — Waterproof Body Jewelry | Bodystrands", description: "Shop belly chains and waist chains in waterproof stainless steel. Gold and silver, adjustable and plus size fits. Handcrafted in Portugal and Canada from €17.50." },
  "Back Chains":        { title: "Back Necklaces & Back Chain Jewelry for Backless Dresses | Bodystrands", description: "Dainty back chain necklaces and backdrop jewelry for backless dresses and wedding gowns. Tarnish-resistant stainless steel, handmade in Portugal and Canada." },
  "Body Chains":        { title: "Body Chains — Festival & Beach Body Jewelry | Bodystrands", description: "Handmade body chains for festivals, beach days, and everyday wear. Waterproof stainless steel in gold and silver. Made in Portugal and Canada." },
  "Shoulder & Arm Chains":    { title: "Arm Chains & Shoulder Chains — Gold & Silver | Bodystrands", description: "Shop shoulder chains, arm chains, and off-shoulder necklaces for weddings, festivals, and everyday wear. Handcrafted stainless steel, made in Portugal and Canada." },
  "Anklets": { title: "Anklets & Barefoot Foot Chains — Gold & Silver | Bodystrands", description: "Dainty anklets, barefoot foot chains and toe chain anklets in gold and silver stainless steel — initial, birthstone, pearl and beach styles from €22." },
  "Bracelets": { title: "Charm Bracelets — Birth Flower, Zodiac & Initial | Bodystrands", description: "Personalised charm bracelets — birth flower, zodiac, birthstone and initial — plus pearl, cross and dainty chain bracelets, with plus size options. From €14." },
  "Necklaces": { title: "Initial Necklaces, Chokers & Layered Necklaces | Bodystrands", description: "Initial and monogram necklaces, cross and pearl chokers, dragonfly and evil eye pendants, and ready-layered necklace stacks in gold and silver. From €20." },
  "Hand Chains": { title: "Hand Chains — Boho, Pearl & Finger Chains | Bodystrands", description: "Hand chains that join a bracelet to a ring — boho, pearl and minimal styles in gold and silver stainless steel, with adjustable fit. From €24." },
  "Head Chains": { title: "Forehead Chains & Bridal Head Chains | Bodystrands", description: "Forehead chains, bridal head chains and hair vine chains for weddings and festivals — pearl and fine chain styles in gold and silver. From €24." },
  "Eyeglasses Chains": { title: "Eyeglasses Chains — Stainless Steel Glasses Chains | Bodystrands", description: "Stainless steel eyeglasses and sunglasses chains with rubber grips — minimal, pearl and beaded styles in gold and silver. From €16." },
  "Bikini Clip Chains": { title: "Bikini Chains — Clip-On Beach Body Jewelry | Bodystrands", description: "Clip-on bikini chains that attach to straps, waistbands or bras — beaded and birthstone styles in stainless steel, €24." },
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
  const content = isFiltered ? CATEGORY_CONTENT[category] : undefined;

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
          {content && (
            <p className="mt-5 max-w-2xl text-sm font-light leading-loose tracking-wide text-[#2C2220]/80">
              {content.intro}
            </p>
          )}
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

        {/* Buying guide + FAQ — gives Google (and shoppers) the words to match searches
            like "back necklace" or "arm chain" that the product grid alone can't. */}
        {content && <BuyingGuide label={`${activeLabel} Guide`} content={content} />}

      </div>
    </div>
  );
}
