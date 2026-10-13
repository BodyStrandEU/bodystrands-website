import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import BuyingGuide from "@/components/BuyingGuide";
import { products, CATEGORIES } from "@/lib/products";
import { BRIDAL_CONTENT } from "@/lib/gift-content";

export const metadata: Metadata = {
  title: "Bridal Jewelry — Back Necklaces, Hair Vines & More | Bodystrands",
  description: "Bridal jewelry for your wedding day: pearl back necklaces, hair vines, head chains and shoulder chains in gold and silver-tone stainless steel, from €24.",
  alternates: { canonical: "/bridal" },
};

export default async function BridalPage() {
  const items = products.filter((p) => p.active !== false && p.giftTags?.includes("bridal"));
  const byCategory = CATEGORIES
    .map((category) => ({ category, items: items.filter((p) => p.category === category) }))
    .filter((section) => section.items.length > 0);

  return (
    <div className="pt-20 md:pt-32 pb-24">

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 md:px-10 mb-16 md:mb-24 text-center">
        <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-3">Bodystrands</p>
        <h1 className="font-heading text-4xl md:text-5xl font-light tracking-wide text-[#2C2220] mb-5 leading-tight">
          Bridal Jewelry
        </h1>
        <p className="text-sm font-light tracking-wide text-[#8C7B6E] leading-relaxed max-w-xl mx-auto">
          {BRIDAL_CONTENT.intro}
        </p>
      </div>

      {/* Collection grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex items-center gap-3 mb-10 md:mb-12">
          <h2 className="font-heading text-2xl md:text-3xl font-light text-[#2C2220]">The Collection</h2>
          <div className="flex-1 h-px bg-[#E8B4A8]/40" />
        </div>
        {byCategory.length > 0 ? (
          <div className="flex flex-col gap-14 md:gap-20">
            {byCategory.map(({ category, items: categoryItems }) => (
              <div key={category}>
                <div className="flex items-center gap-3 mb-6">
                  <p className="text-[0.6rem] tracking-[0.3em] uppercase text-[#A0622A]">{category}</p>
                  <div className="flex-1 h-px bg-[#E8B4A8]/25" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-0.5 gap-y-4 md:gap-x-4 md:gap-y-8">
                  {categoryItems.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm font-light text-[#8C7B6E]">New pieces coming soon.</p>
        )}
      </section>

      <BuyingGuide label="Bridal Jewelry Guide" content={BRIDAL_CONTENT} />

    </div>
  );
}
