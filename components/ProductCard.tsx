import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  const symbol = product.currency === "EUR" ? "€" : product.currency === "GBP" ? "£" : "$";

  return (
    <Link href={`/shop/${product.id}`} className="group block">
      {/* Image container — no border-radius, Zara-pure */}
      <div className="relative overflow-hidden bg-[#F2DDD7] aspect-[3/4]">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-px bg-[#A0622A]/30" />
            <p className="text-[0.5rem] tracking-[0.25em] uppercase text-[#A0622A]/40">Coming Soon</p>
            <div className="w-8 h-px bg-[#A0622A]/30" />
          </div>
        )}
      </div>

      {/* Info below image */}
      <div className="pt-3">
        <p className="text-[0.52rem] tracking-[0.2em] uppercase text-[#8C7B6E] mb-1">
          {product.category}
        </p>
        <h3 className="text-[0.75rem] font-light tracking-[0.08em] text-[#2C2220] leading-snug group-hover:text-[#A0622A] transition-colors duration-300">
          {product.name}
        </h3>
        <p className="mt-1.5 text-[0.7rem] font-light tracking-wide text-[#2C2220]">
          {symbol}{product.price.toFixed(2)}
        </p>
        {product.variants && (
          <div className="mt-2 flex gap-1.5">
            {product.variants.map((v) => (
              <span key={v} className="text-[0.45rem] tracking-[0.15em] uppercase text-[#8C7B6E] border border-[#E8B4A8]/60 px-1.5 py-0.5">
                {v}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
