"use client";

import Image from "next/image";
import Link from "next/link";
import { products } from "@/lib/products";
import { getOriginalPrice } from "@/lib/pricing";
import { useCurrency } from "@/lib/currency-context";

// Hand-picked by Giordano — real top sellers across a spread of categories,
// not auto-derived from sales data.
const BEST_SELLER_IDS = [
  "initial-letter-anklet",
  "barefoot-toe-chain-anklet",
  "stainless-steel-belly-chain",
  "snake-belly-chain",
  "gold-body-necklace",
  "pink-cross-choker",
  "goddess-shoulder-chain",
  "pearl-backdrop-necklace",
  "bridal-forehead-chain",
];

function BestSellerCard({ product }: { product: (typeof products)[number] }) {
  const { format } = useCurrency();
  const image = product.images?.[0];

  return (
    <Link
      href={`/shop/${product.id}`}
      className="group block w-[220px] md:w-[260px] flex-shrink-0"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F5EDE8]">
        {image && (
          <Image
            src={image}
            alt={product.altText || product.name}
            fill
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            sizes="260px"
          />
        )}
        <span className="absolute top-3 left-3 bg-[#2C2220] text-[#FDF9F7] text-[0.5rem] tracking-[0.2em] uppercase px-2.5 py-1">
          Best Seller
        </span>
      </div>
      <div className="pt-3">
        <p className="text-[0.5rem] tracking-[0.2em] uppercase text-[#8C7B6E]/70 mb-1">
          {product.category}
        </p>
        <h3 className="text-[0.8rem] font-light tracking-wide text-[#2C2220] leading-tight group-hover:text-[#A0622A] transition-colors duration-300 mb-1.5">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-medium tracking-wide text-[#A0622A]">
            {format(product.price)}
          </span>
          <span className="text-[0.7rem] font-light tracking-wide text-[#8C7B6E]/50 line-through">
            {format(getOriginalPrice(product.price))}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function BestSellersCarousel() {
  const bestSellers = BEST_SELLER_IDS
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is (typeof products)[number] => !!p);

  if (bestSellers.length === 0) return null;

  // Duplicated once so the marquee loop is seamless (translateX 0 -> -50%).
  const track = [...bestSellers, ...bestSellers];

  return (
    <section className="py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10 mb-8 md:mb-10">
        <p className="text-[0.6rem] tracking-[0.3em] uppercase text-[#A0622A] mb-3">Fan Favorites</p>
        <h2 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220]">Best Sellers</h2>
      </div>

      <div className="best-sellers-track flex gap-4 md:gap-6 w-max px-6 md:px-10">
        {track.map((product, i) => (
          <BestSellerCard key={`${product.id}-${i}`} product={product} />
        ))}
      </div>
    </section>
  );
}
