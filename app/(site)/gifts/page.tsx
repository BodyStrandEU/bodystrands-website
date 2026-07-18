import Image from "next/image";
import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Gifts — Handmade Jewelry Gifts Under €25 & €40 | Bodystrands",
  description: "Shop Bodystrands jewelry by price — thoughtful, handmade gifts under €25 and under €40. Waterproof stainless steel, handmade in Portugal and Canada.",
  alternates: { canonical: "/gifts" },
};

const UNDER_25_MAX = 25;
const UNDER_40_MAX = 40;

export default function GiftsPage() {
  const active = products.filter((p) => p.active !== false);

  const under25 = active
    .filter((p) => p.price <= UNDER_25_MAX)
    .sort((a, b) => a.price - b.price);

  const under40 = active
    .filter((p) => p.price > UNDER_25_MAX && p.price <= UNDER_40_MAX)
    .sort((a, b) => a.price - b.price);

  return (
    <div className="pt-20 md:pt-32 pb-24">

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mb-16 md:mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div>
            <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-3">Bodystrands</p>
            <h1 className="font-heading text-4xl md:text-5xl font-light tracking-wide text-[#2C2220] mb-5 leading-tight">
              Gifts They'll Actually Wear
            </h1>
            <p className="text-sm font-light tracking-wide text-[#8C7B6E] leading-relaxed max-w-md">
              Handmade, waterproof, and made to last — every piece here is a keepsake first,
              a gift second. Shop by price below.
            </p>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden -mx-6 md:mx-0">
            <Image
              src="/images/gifts/packaging-flatlay.jpg"
              alt="Bodystrands jewelry in gift packaging"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>

      {/* Under €25 */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 mb-20 md:mb-28">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="font-heading text-2xl md:text-3xl font-light text-[#2C2220]">Under €25</h2>
          <div className="flex-1 h-px bg-[#E8B4A8]/40" />
        </div>
        {under25.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-0.5 gap-y-4 md:gap-x-4 md:gap-y-8">
            {under25.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-sm font-light text-[#8C7B6E]">New pieces coming soon.</p>
        )}
      </section>

      {/* Under €40 */}
      <section className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="font-heading text-2xl md:text-3xl font-light text-[#2C2220]">Under €40</h2>
          <div className="flex-1 h-px bg-[#E8B4A8]/40" />
        </div>
        {under40.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-0.5 gap-y-4 md:gap-x-4 md:gap-y-8">
            {under40.map((p) => (
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
