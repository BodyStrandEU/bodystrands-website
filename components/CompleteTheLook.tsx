import { products } from "@/lib/products";
import type { Product } from "@/lib/products";
import { CATEGORY_PAIRINGS } from "@/lib/crossSell";
import ProductCard from "@/components/ProductCard";

export default function CompleteTheLook({ product }: { product: Product }) {
  const pairedCategories = CATEGORY_PAIRINGS[product.category] ?? [];
  if (pairedCategories.length === 0) return null;

  const finish = product.variants?.[0];

  // One pick per paired category so the row feels curated, not repetitive.
  // Prefer a product available in the same finish (Gold/Silver Tone) as the one being viewed.
  const picks: Product[] = pairedCategories
    .map((category) => {
      const candidates = products.filter((p) => p.category === category && p.active !== false);
      if (candidates.length === 0) return null;
      const matchingFinish = finish ? candidates.find((p) => p.variants?.includes(finish)) : undefined;
      return matchingFinish ?? candidates[0];
    })
    .filter((p): p is Product => p !== null);

  if (picks.length === 0) return null;

  return (
    <section className="mt-20 md:mt-28 pb-8">
      <div className="flex items-center gap-5 mb-8">
        <div className="flex-1 h-px bg-[#E8B4A8]/30" />
        <h2 className="font-heading text-2xl md:text-3xl font-light text-[#2C2220] whitespace-nowrap tracking-wide">
          Complete the Look
        </h2>
        <div className="flex-1 h-px bg-[#E8B4A8]/30" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-6 md:gap-x-6 md:gap-y-10">
        {picks.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
