"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import BuyButton from "@/components/BuyButton";
import type { Product } from "@/lib/products";

const SWATCH_COLORS: Record<string, string> = {
  "Gold Tone": "#C8A84B",
  "Silver Tone": "#A8A8A8",
};

type MediaItem =
  | { type: "image"; src: string }
  | { type: "video"; src: string };

function buildMedia(images: string[], videoSrc?: string): MediaItem[] {
  const items: MediaItem[] = images.map((src) => ({ type: "image" as const, src }));
  if (videoSrc) {
    items.splice(1, 0, { type: "video" as const, src: videoSrc });
  }
  return items;
}

export default function ProductGallery({ product }: { product: Product }) {
  const [activeVariant, setActiveVariant] = useState<string>(
    product.variants?.[0] ?? ""
  );
  const [activeIndex, setActiveIndex] = useState(0);
  // Track each variantGroup selection separately
  const [groupSelections, setGroupSelections] = useState<Record<string, string>>({});
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const images = product.variantImages?.[activeVariant] ?? product.images ?? [];
  const videoSrc =
    product.variantVideos?.[activeVariant] ??
    product.video ??
    (product.variantVideos ? Object.values(product.variantVideos)[0] : undefined);

  const media = buildMedia(images, videoSrc);
  const currentItem = media[activeIndex] ?? media[0];

  // Build the combined variant string for checkout
  // e.g. "Gold Tone — Lobster Clasp"
  const allGroupsSelected =
    !product.variantGroups ||
    product.variantGroups.every((g) => groupSelections[g.label]);

  const combinedVariant = [
    activeVariant,
    ...(product.variantGroups?.map((g) => groupSelections[g.label]).filter(Boolean) ?? []),
  ]
    .filter(Boolean)
    .join(" — ") || undefined;

  const handleVariant = (v: string) => {
    setActiveVariant(v);
    setActiveIndex(0);
  };

  const goTo = (i: number) =>
    setActiveIndex(Math.max(0, Math.min(i, media.length - 1)));

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
    if (Math.abs(dx) > 40 && Math.abs(dx) > dy) {
      dx > 0 ? goTo(activeIndex + 1) : goTo(activeIndex - 1);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Main media viewer */}
      <div
        className="relative aspect-square overflow-hidden bg-[#FDF9F7] select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {currentItem?.type === "image" && (
          <Image
            src={currentItem.src}
            alt={`${product.name}${activeVariant ? ` — ${activeVariant}` : ""}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
            priority={activeIndex === 0}
          />
        )}
        {currentItem?.type === "video" && (
          <video
            key={currentItem.src}
            src={currentItem.src}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}
        {!currentItem && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[#A0622A]/40">Image coming soon</p>
          </div>
        )}

        {/* Prev / Next — desktop */}
        {media.length > 1 && (
          <>
            <button onClick={() => goTo(activeIndex - 1)} disabled={activeIndex === 0} aria-label="Previous"
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center bg-white/80 text-[#2C2220] text-xl disabled:opacity-0 transition-opacity hover:bg-white z-10">‹</button>
            <button onClick={() => goTo(activeIndex + 1)} disabled={activeIndex === media.length - 1} aria-label="Next"
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center bg-white/80 text-[#2C2220] text-xl disabled:opacity-0 transition-opacity hover:bg-white z-10">›</button>
          </>
        )}

        {/* Dots — mobile */}
        {media.length > 1 && (
          <div className="md:hidden absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {media.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} aria-label={`Go to item ${i + 1}`}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${i === activeIndex ? "bg-white scale-125" : "bg-white/50"}`} />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {media.map((item, i) => (
            <button key={i} onClick={() => goTo(i)} aria-label={item.type === "video" ? "Play video" : `View ${i + 1}`}
              className={`flex-shrink-0 relative w-16 h-16 overflow-hidden transition-all duration-200 ${activeIndex === i ? "ring-1 ring-[#A0622A]" : "opacity-50 hover:opacity-80"}`}>
              {item.type === "image"
                ? <Image src={item.src} alt={`View ${i + 1}`} fill className="object-contain bg-[#FDF9F7]" />
                : <div className="absolute inset-0 bg-[#2C2220] flex items-center justify-center"><span className="text-white text-lg leading-none">▶</span></div>
              }
            </button>
          ))}
        </div>
      )}

      {/* ── Variant selectors ── */}

      {/* Finish (Gold / Silver) */}
      {product.variants && product.variants.length > 1 && (
        <div className="mt-2">
          <p className="text-[0.55rem] tracking-[0.25em] uppercase text-[#8C7B6E] mb-3">
            Finish — <span className="text-[#2C2220]">{activeVariant}</span>
          </p>
          <div className="flex gap-3 flex-wrap">
            {product.variants.map((v) => (
              <button key={v} onClick={() => handleVariant(v)} aria-label={v}
                className={`flex items-center gap-2 px-4 py-3 border text-[0.58rem] tracking-[0.15em] uppercase transition-all duration-200 ${
                  activeVariant === v ? "border-[#2C2220] text-[#2C2220]" : "border-[#E8B4A8]/50 text-[#8C7B6E] hover:border-[#2C2220]"
                }`}>
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: SWATCH_COLORS[v] ?? "#888" }} />
                {v}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Additional variant groups (e.g. Attachment) */}
      {product.variantGroups?.map((group) => (
        <div key={group.label} className="mt-1">
          <p className="text-[0.55rem] tracking-[0.25em] uppercase text-[#8C7B6E] mb-3">
            {group.label}
            {!groupSelections[group.label] && (
              <span className="ml-2 text-[#A0622A]">— please select</span>
            )}
            {groupSelections[group.label] && (
              <span className="ml-2 text-[#2C2220]">— {groupSelections[group.label]}</span>
            )}
          </p>
          <div className="flex gap-3 flex-wrap">
            {group.options.map((opt) => (
              <button key={opt}
                onClick={() => setGroupSelections((prev) => ({ ...prev, [group.label]: opt }))}
                className={`px-4 py-3 border text-[0.58rem] tracking-[0.15em] uppercase transition-all duration-200 ${
                  groupSelections[group.label] === opt
                    ? "border-[#2C2220] text-[#2C2220]"
                    : "border-[#E8B4A8]/50 text-[#8C7B6E] hover:border-[#2C2220]"
                }`}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Buy button — lives here so it has access to all selections */}
      <div className="mt-4">
        <BuyButton
          productId={product.id}
          variant={combinedVariant}
          disabled={!allGroupsSelected}
          disabledMessage="Please select all options above"
        />
      </div>
    </div>
  );
}
