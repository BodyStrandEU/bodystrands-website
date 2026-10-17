import Image from "next/image";
import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Men's Jewelry — Chains & Bracelets | Bodystrands",
  description: "Men's jewelry: Cuban curb chain bracelets and necklaces in gold and silver-tone stainless steel. Waterproof, tarnish-resistant, handmade.",
  alternates: { canonical: "/men" },
};

export default async function MenPage() {
  const items = products.filter((p) => p.active !== false && p.audience === "men");

  return (
    <div className="pt-20 md:pt-32 pb-24">

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mb-16 md:mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div>
            <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-3">Bodystrands</p>
            <h1 className="font-heading text-4xl md:text-5xl font-light tracking-wide text-[#2C2220] mb-5 leading-tight">
              Men's Jewelry
            </h1>
            <p className="text-sm font-light tracking-wide text-[#8C7B6E] leading-relaxed max-w-md">
              Men wear jewelry too. These pieces are made for them. We make ours the same way
              for everyone: real stainless steel, properly finished, built to survive the
              shower, the gym, and everyday wear without losing its shine.
            </p>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden -mx-6 md:mx-0">
            <Image
              src="/images/products/40b43833-6642-470c-a59a-6a5cec97b092.png"
              alt="Men's gold-tone curb chain necklace with cross pendant"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>

      {/* Collection grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex items-center gap-3 mb-10 md:mb-12">
          <h2 className="font-heading text-2xl md:text-3xl font-light text-[#2C2220]">The Collection</h2>
          <div className="flex-1 h-px bg-[#E8B4A8]/40" />
        </div>
        {items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-0.5 gap-y-4 md:gap-x-4 md:gap-y-8">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-sm font-light text-[#8C7B6E]">New pieces coming soon.</p>
        )}
      </section>

    </div>
  );
}
