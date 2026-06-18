"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "@/components/SmartImage";
import { products } from "@/lib/products";
import type { Product } from "@/lib/products";

function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return products
    .filter((p) => p.active !== false)
    .filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    )
    .slice(0, 8);
}

export default function SearchModal({ onClose }: { onClose: () => void }) {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [active,  setActive]  = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const router   = useRouter();

  const symbol = (p: Product) =>
    p.currency === "EUR" ? "€" : p.currency === "GBP" ? "£" : "$";

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setResults(searchProducts(query));
    setActive(-1);
  }, [query]);

  const go = useCallback((p: Product) => {
    router.push(`/shop/${p.id}`);
    onClose();
  }, [router, onClose]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setActive((a) => Math.max(a - 1, -1)); }
      if (e.key === "Enter" && active >= 0 && results[active]) go(results[active]);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, results, go, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#2C2220]/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 bg-[#FDF9F7] w-full shadow-2xl">
        {/* Input row */}
        <div className="max-w-2xl mx-auto px-6 flex items-center gap-4 h-16 border-b border-[#E8B4A8]/30">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8C7B6E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jewellery…"
            className="flex-1 bg-transparent text-[0.8rem] font-light tracking-wide text-[#2C2220] placeholder-[#8C7B6E]/50 outline-none"
          />
          <button onClick={onClose} className="text-[0.55rem] tracking-[0.2em] uppercase text-[#8C7B6E] hover:text-[#2C2220] transition-colors">
            Close
          </button>
        </div>

        {/* Results */}
        <div className="max-w-2xl mx-auto px-6 py-4 max-h-[70vh] overflow-y-auto">
          {query.trim() === "" && (
            <p className="text-[0.65rem] tracking-wide text-[#8C7B6E]/60 py-4 text-center">
              Start typing to search all {products.filter(p => p.active !== false).length} pieces
            </p>
          )}

          {query.trim() !== "" && results.length === 0 && (
            <p className="text-[0.65rem] tracking-wide text-[#8C7B6E]/60 py-4 text-center">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}

          {results.map((p, i) => {
            const img = (p.variants?.[0] && p.variantImages?.[p.variants[0]]?.[0]) || p.images?.[0];
            return (
              <button
                key={p.id}
                onClick={() => go(p)}
                className={`w-full flex items-center gap-4 py-3 px-3 text-left transition-colors rounded-sm ${
                  active === i ? "bg-[#E8B4A8]/20" : "hover:bg-[#E8B4A8]/10"
                }`}
              >
                {img && (
                  <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden bg-[#F5EEEB]">
                    <Image src={img} alt={p.name} fill className="object-cover" sizes="48px" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[0.7rem] font-light tracking-wide text-[#2C2220] truncate">{p.name}</p>
                  <p className="text-[0.55rem] tracking-[0.15em] uppercase text-[#8C7B6E] mt-0.5">{p.category}</p>
                </div>
                <p className="text-[0.7rem] font-light text-[#A0622A] flex-shrink-0">
                  {symbol(p)}{p.price.toFixed(2)}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
