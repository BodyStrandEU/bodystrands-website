import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import BuyingGuide from "@/components/BuyingGuide";
import { products } from "@/lib/products";
import blogPosts from "@/data/blog-posts.json";
import { CHRISTMAS_CONTENT } from "@/lib/gift-content";

export const metadata: Metadata = {
  title: "Christmas Jewelry Gifts for Her — Under €30 | Bodystrands",
  description: "Christmas jewelry gifts for her: personalised initial and birthstone pieces, pearls, charm bracelets and festive necklaces, most under €30. Gift wrap at checkout.",
  alternates: { canonical: "/christmas" },
};

const UNDER_25_MAX = 25;

export default async function ChristmasPage() {
  const active = products.filter((p) => p.active !== false && p.images?.length);
  const festive = active.filter((p) => p.christmas);
  // Christmas gift searches lead with personalised pieces and small budgets (Oct 2026
  // research), so the page shows those alongside the two festive pieces.
  const personalised = active.filter((p) => p.giftTags?.includes("personalized")).slice(0, 12);
  const under25 = active.filter((p) => p.price <= UNDER_25_MAX && !p.christmas).sort((a, b) => a.price - b.price).slice(0, 12);

  // Newest Christmas/gift posts — refreshed automatically as research feeds the blog.
  const journalPosts = [...blogPosts]
    .filter((p) => /christmas|xmas|stocking|secret santa|gift/i.test(`${p.title} ${(p as { topic?: string }).topic ?? ""}`))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  const sections = [
    { title: "Festive Pieces", items: festive },
    { title: "Personalised Christmas Gifts", items: personalised },
    { title: "Stocking Stuffers Under €25", items: under25 },
  ].filter((s) => s.items.length > 0);

  return (
    <div className="pt-20 md:pt-32 pb-24">

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 md:px-10 mb-16 md:mb-24 text-center">
        <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-3">Bodystrands</p>
        <h1 className="font-heading text-4xl md:text-5xl font-light tracking-wide text-[#2C2220] mb-5 leading-tight">
          Christmas Jewelry Gifts
        </h1>
        <p className="text-sm font-light tracking-wide text-[#8C7B6E] leading-relaxed max-w-xl mx-auto">
          {CHRISTMAS_CONTENT.intro}
        </p>
      </div>

      {sections.map((section) => (
        <section key={section.title} className="max-w-7xl mx-auto px-6 md:px-10 mb-16 md:mb-24">
          <div className="flex items-center gap-3 mb-10 md:mb-12">
            <h2 className="font-heading text-2xl md:text-3xl font-light text-[#2C2220]">{section.title}</h2>
            <div className="flex-1 h-px bg-[#E8B4A8]/40" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-0.5 gap-y-4 md:gap-x-4 md:gap-y-8">
            {section.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ))}

      <BuyingGuide label="Christmas Gift Guide" content={CHRISTMAS_CONTENT} />

      {journalPosts.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 md:px-10 mt-24 md:mt-32 pt-16 border-t border-[#E8B4A8]/30">
          <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-10 text-center">Gift Ideas from the Journal</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {journalPosts.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group flex flex-col gap-3">
                <span className="text-[0.52rem] tracking-[0.28em] uppercase text-[#A0622A]">{p.category}</span>
                <div className="border-t border-[#E8B4A8]/30 pt-4">
                  <h3 className="font-heading text-xl font-light text-[#2C2220] leading-snug group-hover:text-[#A0622A] transition-colors">{p.title}</h3>
                </div>
                <span className="text-[0.58rem] tracking-[0.2em] uppercase text-[#A0622A] group-hover:underline underline-offset-4">Read →</span>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
