import { products } from "@/lib/products";
import type { Product } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default function YouMayAlsoLike({ product }: { product: Product }) {
  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category && p.active !== false)
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="mt-20 md:mt-28 pb-8">
      <div className="flex items-center gap-5 mb-8">
        <div className="flex-1 h-px bg-[#E8B4A8]/30" />
        <h2 className="font-heading text-2xl md:text-3xl font-light text-[#2C2220] whitespace-nowrap tracking-wide">
          You May Also Like
        </h2>
        <div className="flex-1 h-px bg-[#E8B4A8]/30" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-6 md:gap-x-6 md:gap-y-10">
        {related.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
