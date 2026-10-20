import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { products, CATEGORY_ORDER } from "@/lib/products";

export const metadata: Metadata = {
  title: "Sale — Handmade Body Jewelry | Bodystrands",
  description: "Shop real discounts on handmade body jewelry — selected gold and silver-tone stainless steel pieces, now reduced.",
  alternates: { canonical: "/sales" },
};

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const items = products.filter((p) => p.active !== false && (p.salePercent ?? 0) > 0);

  // Group by category in the admin-editable display order, same pattern as /shop's "All Pieces" view.
  const allGroups = CATEGORY_ORDER
    .map((cat) => ({ category: cat, items: items.filter((p) => p.category === cat) }))
    .filter((g) => g.items.length > 0);

  // Category filter stays inside the sale — only sale pieces, only categories that have some.
  const activeCategory = allGroups.some((g) => g.category === category) ? category : undefined;
  const grouped = activeCategory ? allGroups.filter((g) => g.category === activeCategory) : allGroups;
  const chips = [
    { label: "All Sale", href: "/sales", active: !activeCategory },
    ...allGroups.map((g) => ({
      label: g.category,
      href: `/sales?category=${encodeURIComponent(g.category)}`,
      active: g.category === activeCategory,
    })),
  ];

  return (
    <div className="pt-20 md:pt-32 pb-24">

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 md:px-10 mb-10 md:mb-14 text-center">
        <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-3">Bodystrands</p>
        <h1 className="font-heading text-4xl md:text-5xl font-light tracking-wide text-[#2C2220] mb-5 leading-tight">
          Sale
        </h1>
        <p className="text-sm font-light tracking-wide text-[#8C7B6E] leading-relaxed max-w-xl mx-auto">
          Real discounts on a hand-picked selection of pieces — same handmade quality, lower price, while it lasts.
        </p>
      </div>

      {/* Sale-only category filter */}
      <nav aria-label="Sale categories" className="max-w-7xl mx-auto mb-10 md:mb-14">
        <div className="flex flex-wrap justify-center gap-2 px-6 md:px-10">
          {chips.map((chip) => (
            <Link
              key={chip.href}
              href={chip.href}
              scroll={false}
              className={`inline-flex items-center min-h-[44px] px-4 border text-[0.6rem] tracking-[0.2em] uppercase whitespace-nowrap transition-colors ${
                chip.active
                  ? "bg-[#A0622A] border-[#A0622A] text-[#FDF9F7]"
                  : "border-[#E8B4A8]/60 text-[#2C2220] hover:border-[#A0622A] hover:text-[#A0622A]"
              }`}
            >
              {chip.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Collection grid — grouped by category */}
      <section className="max-w-7xl mx-auto px-6 md:px-10">
        {grouped.length > 0 ? (
          <div className="flex flex-col gap-12 md:gap-16">
            {grouped.map((group) => (
              <div key={group.category}>
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-[0.55rem] tracking-[0.28em] uppercase text-[#A0622A] whitespace-nowrap">
                    {group.category}
                  </span>
                  <div className="flex-1 h-px bg-[#E8B4A8]/40" />
                  <span className="text-[0.5rem] tracking-[0.15em] uppercase text-[#8C7B6E]/60 whitespace-nowrap">
                    {group.items.length} {group.items.length === 1 ? "piece" : "pieces"}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-0.5 gap-y-4 md:gap-x-4 md:gap-y-8">
                  {group.items.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm font-light text-[#8C7B6E]">No pieces on sale right now — check back soon.</p>
        )}
      </section>

    </div>
  );
}
