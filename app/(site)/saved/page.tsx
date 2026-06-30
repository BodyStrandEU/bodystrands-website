"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";
import { useWishlist } from "@/lib/wishlist";

export default function SavedPage() {
  const { ids } = useWishlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const saved = products.filter((p) => ids.includes(p.id) && p.active !== false);

  return (
    <div className="min-h-screen pb-24">
      <div className="pt-28 md:pt-32" />
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="mb-8 md:mb-12 px-2 md:px-0">
          <p className="text-[0.52rem] tracking-[0.35em] uppercase text-[#A0622A] mb-3">Bodystrands</p>
          <h1 className="font-heading text-5xl md:text-6xl font-light text-[#2C2220] leading-none">
            Saved Pieces
          </h1>
          {mounted && (
            <p className="mt-3 text-[0.6rem] tracking-[0.15em] uppercase text-[#8C7B6E]">
              {saved.length} {saved.length === 1 ? "piece" : "pieces"}
            </p>
          )}
        </div>

        {!mounted && <div className="py-24" />}

        {mounted && saved.length === 0 && (
          <div className="py-24 text-center px-2">
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="flex-1 h-px bg-[#E8B4A8]/30 max-w-24" />
              <span className="text-[#E8B4A8]/50 text-[0.6rem]">◆</span>
              <div className="flex-1 h-px bg-[#E8B4A8]/30 max-w-24" />
            </div>
            <p className="text-sm font-light tracking-wide text-[#8C7B6E] mb-6">
              Nothing saved yet. Tap the heart on any piece to keep it here.
            </p>
            <Link href="/shop" className="btn-primary">Browse the Shop</Link>
          </div>
        )}

        {mounted && saved.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-0.5 gap-y-4 md:gap-x-4 md:gap-y-8">
            {saved.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 4} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
