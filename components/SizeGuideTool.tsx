"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CATEGORIES, type Category, type Product } from "@/lib/products";
import { CATEGORY_SIZE_CONFIG, ONE_SIZE_CATEGORIES, matchingProductIds } from "@/lib/size-guide";
import { getOriginalPrice } from "@/lib/pricing";
import { useCurrency } from "@/lib/currency-context";

function ResultCard({ product }: { product: Product }) {
  const { format } = useCurrency();
  const image = product.images?.[0];

  return (
    <Link href={`/shop/${product.id}`} className="group block">
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
      </div>
      <div className="pt-3">
        <h3 className="text-[0.8rem] font-light tracking-wide text-[#2C2220] leading-tight group-hover:text-[#A0622A] transition-colors duration-300 mb-1.5">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium tracking-wide text-[#A0622A]">{format(product.price)}</span>
          <span className="text-[0.65rem] font-light tracking-wide text-[#8C7B6E]/50 line-through">
            {format(getOriginalPrice(product.price))}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function SizeGuideTool({ products }: { products: Product[] }) {
  const [category, setCategory] = useState<Category | null>(null);
  const [value, setValue] = useState<string>("");

  const productsByCategory = useMemo(() => {
    const map = new Map<Category, Product[]>();
    for (const p of products) {
      if (p.active === false) continue;
      const list = map.get(p.category) ?? [];
      list.push(p);
      map.set(p.category, list);
    }
    return map;
  }, [products]);

  const config = category ? CATEGORY_SIZE_CONFIG[category] : undefined;
  const isOneSize = category ? ONE_SIZE_CATEGORIES.includes(category) : false;

  const numericValue = parseFloat(value);
  const hasValue = value.trim() !== "" && !Number.isNaN(numericValue);

  const matches = useMemo(() => {
    if (!category || !config || !hasValue) return [];
    const ids = new Set(matchingProductIds(category, numericValue));
    return (productsByCategory.get(category) ?? []).filter((p) => ids.has(p.id));
  }, [category, config, hasValue, numericValue, productsByCategory]);

  function selectCategory(cat: Category) {
    setCategory(cat);
    setValue("");
  }

  return (
    <div>
      {/* Step 1 — category picker */}
      <div className="mb-10">
        <p className="text-[0.55rem] tracking-[0.25em] uppercase text-[#8C7B6E] mb-4">Step 1 — Choose a category</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => selectCategory(cat)}
              className={`whitespace-nowrap text-[0.55rem] tracking-[0.18em] uppercase px-4 py-2.5 border transition-colors duration-200 ${
                category === cat
                  ? "border-[#2C2220] text-[#2C2220] bg-transparent"
                  : "border-[#E8B4A8]/50 text-[#8C7B6E] hover:border-[#2C2220] hover:text-[#2C2220]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2 — one-size note */}
      {category && isOneSize && (
        <div className="border border-[#E8B4A8]/40 p-6 md:p-8">
          <p className="font-heading text-xl font-light text-[#2C2220] mb-2">One size fits most</p>
          <p className="text-sm font-light leading-relaxed tracking-wide text-[#8C7B6E] mb-5">
            {category} are fully adjustable by design — there&apos;s no sizing decision to make here. Any piece
            in this category will fit comfortably.
          </p>
          <Link
            href={`/shop?category=${encodeURIComponent(category)}`}
            className="text-[0.62rem] tracking-[0.18em] uppercase text-[#2C2220] underline underline-offset-4 hover:text-[#A0622A] transition-colors"
          >
            Browse {category} →
          </Link>
        </div>
      )}

      {/* Step 2 — measurement input */}
      {category && !isOneSize && config && (
        <div>
          <p className="text-[0.55rem] tracking-[0.25em] uppercase text-[#8C7B6E] mb-3">Step 2 — {config.measureLabel}</p>
          <p className="text-[0.75rem] font-light leading-relaxed tracking-wide text-[#8C7B6E] mb-5 max-w-md">
            {config.measureHint}
          </p>

          {config.quickPicks && (
            <div className="flex flex-wrap gap-2 mb-5">
              {config.quickPicks.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => setValue(String(qp.valueCm))}
                  className={`text-[0.6rem] tracking-[0.15em] uppercase px-4 py-2 border transition-colors duration-200 ${
                    value === String(qp.valueCm)
                      ? "border-[#A0622A] text-[#A0622A]"
                      : "border-[#E8B4A8]/50 text-[#8C7B6E] hover:border-[#2C2220] hover:text-[#2C2220]"
                  }`}
                >
                  {qp.label} <span className="opacity-60">~{qp.valueCm}cm</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mb-8">
            <input
              type="number"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. 40"
              className="w-32 border border-[#A0622A]/20 bg-transparent px-4 py-3 text-sm text-[#2C2220] focus:border-[#A0622A] focus:outline-none"
            />
            <span className="text-[0.7rem] tracking-wide text-[#8C7B6E]">cm</span>
          </div>

          {hasValue && (
            <div>
              {matches.length > 0 ? (
                <>
                  <p className="text-[0.55rem] tracking-[0.25em] uppercase text-[#8C7B6E] mb-5">
                    {matches.length} {matches.length === 1 ? "piece fits" : "pieces fit"} that measurement
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {matches.map((p) => (
                      <ResultCard key={p.id} product={p} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="border border-[#E8B4A8]/40 p-6 md:p-8">
                  <p className="font-heading text-xl font-light text-[#2C2220] mb-2">No exact match on file yet</p>
                  <p className="text-sm font-light leading-relaxed tracking-wide text-[#8C7B6E] mb-5">
                    We don&apos;t have a confirmed size match for that measurement in {category} right now — but
                    every piece can be custom-resized. Message us your measurement after ordering and we&apos;ll
                    adjust it at no extra cost.
                  </p>
                  <Link
                    href={`/shop?category=${encodeURIComponent(category)}`}
                    className="text-[0.62rem] tracking-[0.18em] uppercase text-[#2C2220] underline underline-offset-4 hover:text-[#A0622A] transition-colors"
                  >
                    Browse {category} →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
