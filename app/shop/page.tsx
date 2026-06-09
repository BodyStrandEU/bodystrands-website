import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/lib/products";

export const metadata = {
  title: "Shop — Body Strands",
  description: "Shop handmade body chains, waist chains, and anklets. All pieces crafted in tarnish-resistant stainless steel.",
};

export default function ShopPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">

        {/* Header */}
        <div className="mb-16 text-center">
          <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-4">Our Collection</p>
          <h1 className="font-heading text-5xl md:text-6xl font-light text-[#2C2220]">Shop</h1>
          <div className="mt-6 w-px h-12 bg-[#A0622A]/30 mx-auto" />
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <span className="text-[0.6rem] tracking-[0.22em] uppercase px-5 py-2 border border-[#A0622A] text-[#A0622A] cursor-pointer hover:bg-[#A0622A] hover:text-[#FDF9F7] transition-colors">
            All
          </span>
          {categories.map((cat) => (
            <span
              key={cat}
              className="text-[0.6rem] tracking-[0.22em] uppercase px-5 py-2 border border-[#A0622A]/30 text-[#8C7B6E] cursor-pointer hover:border-[#A0622A] hover:text-[#A0622A] transition-colors"
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Empty state if no products */}
        {products.length === 0 && (
          <div className="text-center py-24">
            <p className="text-sm font-light tracking-wide text-[#8C7B6E]">New collection coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
