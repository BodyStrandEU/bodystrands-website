import Link from "next/link";
import type { Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/shop/${product.id}`} className="group block">
      <div className="relative overflow-hidden bg-[#F2DDD7] aspect-[3/4]">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[#A0622A]/50">
            Image coming soon
          </p>
        </div>
        <div className="absolute inset-0 bg-[#2C2220]/0 group-hover:bg-[#2C2220]/5 transition-colors duration-500" />
      </div>
      <div className="pt-4 pb-2">
        <p className="text-[0.55rem] tracking-[0.22em] uppercase text-[#A0622A] mb-1">
          {product.category}
        </p>
        <h3 className="font-heading text-lg font-light text-[#2C2220] leading-snug">
          {product.name}
        </h3>
        <p className="mt-1 text-[0.7rem] font-light tracking-wide text-[#8C7B6E]">
          {product.currency === "EUR" ? "€" : product.currency === "GBP" ? "£" : "$"}
          {product.price.toFixed(2)}
        </p>
        {product.variants && (
          <p className="mt-1 text-[0.55rem] tracking-[0.15em] uppercase text-[#8C7B6E]">
            {product.variants.join(" · ")}
          </p>
        )}
      </div>
    </Link>
  );
}
