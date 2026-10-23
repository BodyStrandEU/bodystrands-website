"use client";

// SKIMS-style "+ Filter" / "Sort" for the shop grid. Opens as a bottom sheet on phones and a
// centred panel on desktop. Pure client-side — the page and its Google metadata don't change.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Product } from "@/lib/products";
import { getSalePrice } from "@/lib/pricing";
import { canShowIn, type Tone } from "@/lib/productSets";

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc";
export type PriceKey = "u25" | "25-40" | "o40";
export type FilterState = { sort: SortKey; finish: Tone | null; price: PriceKey | null; saleOnly: boolean };

export const DEFAULT_FILTERS: FilterState = { sort: "featured", finish: null, price: null, saleOnly: false };

const SORTS: { key: SortKey; label: string }[] = [
  { key: "featured",   label: "Featured" },
  { key: "newest",     label: "Newest" },
  { key: "price-asc",  label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
];
const PRICES: { key: PriceKey; label: string }[] = [
  { key: "u25",   label: "Under €25" },
  { key: "25-40", label: "€25 – €40" },
  { key: "o40",   label: "Over €40" },
];

const effectivePrice = (p: Product) => getSalePrice(p) ?? p.price;

export const filtersActive = (f: FilterState) => f.sort !== "featured" || !!f.finish || !!f.price || f.saleOnly;
export const filterCount = (f: FilterState) => (f.finish ? 1 : 0) + (f.price ? 1 : 0) + (f.saleOnly ? 1 : 0);

export function applyFilters(list: Product[], f: FilterState): Product[] {
  const out = list.filter((p) => {
    if (f.finish && !canShowIn(p, f.finish)) return false;
    if (f.saleOnly && getSalePrice(p) === null) return false;
    const price = effectivePrice(p);
    if (f.price === "u25" && !(price < 25)) return false;
    if (f.price === "25-40" && !(price >= 25 && price <= 40)) return false;
    if (f.price === "o40" && !(price > 40)) return false;
    return true;
  });
  if (f.sort === "price-asc") out.sort((a, b) => effectivePrice(a) - effectivePrice(b));
  if (f.sort === "price-desc") out.sort((a, b) => effectivePrice(b) - effectivePrice(a));
  if (f.sort === "newest") out.sort((a, b) => (b.dateAdded ?? "").localeCompare(a.dateAdded ?? ""));
  return out;
}

function Option({ selected, onClick, children, check = false }: { selected: boolean; onClick: () => void; children: React.ReactNode; check?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected}
      className="w-full min-h-[48px] flex items-center justify-between gap-4 border-b border-[#E8B4A8]/30 text-left">
      <span className={`text-[0.92rem] tracking-[0.03em] pt-0.5 ${selected ? "font-semibold text-[#2C2220]" : "font-normal text-[#2C2220]/80"}`}>{children}</span>
      <span className={`w-4 h-4 flex-shrink-0 border flex items-center justify-center text-[0.6rem] ${check ? "" : "rounded-full"} ${selected ? "bg-[#2C2220] border-[#2C2220] text-white" : "border-[#8C7B6E]"}`}>
        {selected ? "✓" : ""}
      </span>
    </button>
  );
}

function Sheet({ title, onClose, children, footer }: { title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.dataset.menuOpen = "1"; // hides the floating WhatsApp button
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; delete document.body.dataset.menuOpen; window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-[#2C2220]/40" />
      <div className="relative w-full md:max-w-md max-h-[85vh] flex flex-col bg-[#FDF9F7] animate-slide-up md:animate-page-in shadow-2xl">
        <div className="flex items-center justify-between px-6 h-16 border-b border-[#E8B4A8]/30 flex-shrink-0">
          <p className="text-[0.75rem] font-semibold tracking-[0.18em] uppercase text-[#2C2220] pt-0.5">{title}</p>
          <button type="button" onClick={onClose} aria-label="Close" className="w-11 h-11 -mr-3 flex items-center justify-center text-[#2C2220]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-4">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-[#E8B4A8]/30 flex-shrink-0">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export default function ShopFilterSort({ value, onChange, resultCount }: { value: FilterState; onChange: (f: FilterState) => void; resultCount: number }) {
  const [open, setOpen] = useState<"filter" | "sort" | null>(null);
  const close = () => setOpen(null);
  const n = filterCount(value);
  const sortLabel = SORTS.find((s) => s.key === value.sort)?.label ?? "Featured";

  return (
    <>
      <div className="flex items-center gap-5">
        <button type="button" onClick={() => setOpen("filter")} className="min-h-[44px] flex items-center gap-2 whitespace-nowrap text-[0.8rem] font-semibold tracking-[0.06em] text-[#2C2220] pt-0.5">
          <span className="text-base leading-none">+</span> Filter{n > 0 ? ` (${n})` : ""}
        </button>
        <button type="button" onClick={() => setOpen("sort")} aria-label={`Sort: ${sortLabel}`} className="min-h-[44px] flex items-center gap-2 whitespace-nowrap text-[0.8rem] font-semibold tracking-[0.06em] text-[#2C2220] pt-0.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3" /></svg>
          Sort
          {value.sort !== "featured" && <span className="w-1.5 h-1.5 rounded-full bg-[#A0622A]" aria-hidden />}
        </button>
      </div>

      {open === "sort" && (
        <Sheet title="Sort by" onClose={close}>
          {SORTS.map((s) => (
            <Option key={s.key} selected={value.sort === s.key} onClick={() => { onChange({ ...value, sort: s.key }); close(); }}>{s.label}</Option>
          ))}
        </Sheet>
      )}

      {open === "filter" && (
        <Sheet
          title="Filter"
          onClose={close}
          footer={
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => onChange({ ...DEFAULT_FILTERS, sort: value.sort })}
                className="min-h-[48px] border border-[#2C2220]/25 text-[0.65rem] tracking-[0.2em] uppercase text-[#2C2220]">
                Clear all
              </button>
              <button type="button" onClick={close}
                className="min-h-[48px] bg-[#2C2220] text-[#FDF9F7] text-[0.65rem] tracking-[0.2em] uppercase">
                Show {resultCount} {resultCount === 1 ? "piece" : "pieces"}
              </button>
            </div>
          }
        >
          <p className="mt-5 mb-1 text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-[#A0622A]">Finish</p>
          {(["gold", "silver"] as Tone[]).map((t) => (
            <Option key={t} check selected={value.finish === t} onClick={() => onChange({ ...value, finish: value.finish === t ? null : t })}>
              {t === "gold" ? "Gold" : "Silver"}
            </Option>
          ))}
          <p className="mt-6 mb-1 text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-[#A0622A]">Price</p>
          {PRICES.map((p) => (
            <Option key={p.key} check selected={value.price === p.key} onClick={() => onChange({ ...value, price: value.price === p.key ? null : p.key })}>
              {p.label}
            </Option>
          ))}
          <p className="mt-6 mb-1 text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-[#A0622A]">Offers</p>
          <Option check selected={value.saleOnly} onClick={() => onChange({ ...value, saleOnly: !value.saleOnly })}>On sale</Option>
        </Sheet>
      )}
    </>
  );
}
