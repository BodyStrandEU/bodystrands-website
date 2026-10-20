"use client";
import { useRef, useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "@/components/SmartImage";
import type { Product } from "@/lib/products";
import { INFOGRAPHIC_IMAGES } from "@/lib/products";
import { PACKAGING_IMAGES } from "@/lib/site-media";
import { getSalePrice } from "@/lib/pricing";
import WishlistButton from "@/components/WishlistButton";
import { useCurrency } from "@/lib/currency-context";
import { useCart } from "@/lib/cart";

const SWATCH_COLORS: Record<string, string> = {
  "Gold Tone":   "#C8A84B",
  "Silver Tone": "#A8A8A8",
};

export default function ProductCard({ product, priority = false, heroImageOverride }: { product: Product; priority?: boolean; heroImageOverride?: string }) {
  const router = useRouter();

  const [activeVariant, setActiveVariant] = useState<string | null>(
    (product.variants ?? [])[0] ?? null
  );
  const [slideIndex, setSlideIndex] = useState(0);

  // The card's media box is portrait (aspect-[7/10] / aspect-[4/5]) to show newly-shot
  // vertical photos edge-to-edge via object-cover. Older square/landscape shots further
  // into the same carousel would get cropped top-and-bottom under that same cover
  // behavior, so each image's real aspect ratio is detected on load and switched to
  // object-contain (full photo visible, letterboxed against the card's own background)
  // instead — fully automatic, no per-photo tagging. The main/first thumbnail is always
  // excluded (stays object-cover no matter what) — it's already been optimized to be
  // vertical and is what drives engagement, so it's never touched by this logic.
  const [containImages, setContainImages] = useState<Set<string>>(new Set());
  function handleImageLoad(src: string, e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    if (!img.naturalWidth || !img.naturalHeight) return;
    const ratio = img.naturalWidth / img.naturalHeight;
    if (ratio > 0.9) {
      setContainImages((prev) => (prev.has(src) ? prev : new Set(prev).add(src)));
    }
  }

  const mediaRef   = useRef<HTMLDivElement>(null);
  const touchStart = useRef({ x: 0, y: 0, time: 0 });
  const swipeDir   = useRef<"h" | "v" | null>(null);
  const lastTouch  = useRef(0);

  const { format } = useCurrency();
  const salePrice = getSalePrice(product);
  const { add: addToCart, openQuickAdd, openDrawer } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  // Products with extra required choices (e.g. Size) open the shared cart drawer in its
  // "pick options" mode instead of adding blind — keeps quick-add frictionless without
  // leaving the grid. Simple/swatch-only products add instantly, then the drawer opens
  // to confirm and offer a way to switch finish if the wrong swatch was showing.
  const needsOptions = (product.variantGroups ?? []).length > 0;

  function handleQuickAdd(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (needsOptions) {
      openQuickAdd(product);
      return;
    }
    if (justAdded) return;
    addToCart({
      productId:   product.id,
      productName: product.name,
      variant:     activeVariant ?? undefined,
      priceAdd:    0,
      unitPrice:   salePrice ?? product.price,
      image:       product.images?.[0],
      currency:    product.currency,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
    if (typeof window !== "undefined") {
      const w = window as Window & { fbq?: (...a: unknown[]) => void; gtag?: (...a: unknown[]) => void };
      w.fbq?.("track", "AddToCart", { content_ids: [product.id], content_name: product.name, content_type: "product", value: salePrice ?? product.price, currency: product.currency });
      w.gtag?.("event", "add_to_cart", { currency: product.currency, value: salePrice ?? product.price, items: [{ item_id: product.id, item_name: product.name, item_variant: activeVariant ?? "", price: salePrice ?? product.price, quantity: 1 }] });
      fetch("/api/cart-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, variant: activeVariant ?? undefined }),
      }).catch(() => {});
    }
    openDrawer();
  }

  // All images for the card carousel — infographics excluded, shared packaging
  // photos (boxes, unboxing, gift wrap) appended at the end, same as the PDP gallery.
  const combinedImages = useMemo(() => {
    const perProduct = new Set(product.infographicImages ?? []);
    const isInfographic = (src: string) => INFOGRAPHIC_IMAGES.has(src) || perProduct.has(src);
    // Gallery mode: flat unified array
    if (product.gallery) {
      return [...product.gallery.filter(src => !isInfographic(src)), ...PACKAGING_IMAGES];
    }
    // Per-variant mode: combine all variant images in order
    const variants = product.variants ?? [];
    if (variants.length > 0 && product.variantImages) {
      return [...variants.flatMap((v) => product.variantImages![v] ?? []).filter(src => !isInfographic(src)), ...PACKAGING_IMAGES];
    }
    return [...(product.images ?? []).filter(src => !isInfographic(src)), ...PACKAGING_IMAGES];
  }, [product.gallery, product.variants, product.variantImages, product.images, product.infographicImages]);

  // Context-specific starting photo (e.g. the festive shot on /christmas) — applied once
  // on mount, doesn't affect the default image shown anywhere else this card is used.
  useEffect(() => {
    if (!heroImageOverride) return;
    const idx = combinedImages.indexOf(heroImageOverride);
    if (idx !== -1) setSlideIndex(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Which variant does each slide belong to? (only used in per-variant mode)
  const slideVariantMap = useMemo(() => {
    if (product.gallery) return [] as (string | null)[];
    const variants = product.variants ?? [];
    if (variants.length === 0 || !product.variantImages) return [] as (string | null)[];
    const result: (string | null)[] = [];
    for (const v of variants) {
      for (let i = 0; i < (product.variantImages[v]?.length ?? 0); i++) {
        result.push(v);
      }
    }
    return result;
  }, [product.gallery, product.variants, product.variantImages]);

  // Active swatch badge follows the carousel position automatically
  useEffect(() => {
    const v = slideVariantMap[slideIndex];
    if (v) setActiveVariant(v);
  }, [slideIndex, slideVariantMap]);

  // Tap a swatch → jump to that variant's hero image
  function jumpToVariant(v: string) {
    if (product.gallery && product.variantHeroes?.[v]) {
      const heroUrl = product.variantHeroes[v];
      const idx = combinedImages.indexOf(heroUrl);
      setSlideIndex(idx !== -1 ? idx : 0);
    } else {
      const idx = slideVariantMap.indexOf(v);
      setSlideIndex(idx !== -1 ? idx : 0);
    }
    setActiveVariant(v);
  }

  // Native touch listeners — direction detected here so preventDefault fires
  // on the very first touchmove before the browser commits to scrolling
  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;

    function onStart(e: TouchEvent) {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
      swipeDir.current = null;
    }

    function onMove(e: TouchEvent) {
      if (swipeDir.current === null) {
        const dx = Math.abs(e.touches[0].clientX - touchStart.current.x);
        const dy = Math.abs(e.touches[0].clientY - touchStart.current.y);
        if (dx > 4 || dy > 4) swipeDir.current = dx >= dy ? "h" : "v";
      }
      if (swipeDir.current === "h") e.preventDefault();
    }

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove",  onMove,  { passive: false });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove",  onMove);
    };
  }, []);

  function goTo(i: number) {
    setSlideIndex((i + combinedImages.length) % combinedImages.length);
  }

  function onTouchEnd(e: React.TouchEvent) {
    lastTouch.current = Date.now();
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const dt = Date.now() - touchStart.current.time;

    if (swipeDir.current === "h" && Math.abs(dx) > 28) {
      dx < 0 ? goTo(slideIndex + 1) : goTo(slideIndex - 1);
    } else if (Math.abs(dx) < 12 && Math.abs(dy) < 12 && dt < 350) {
      e.preventDefault();
      router.push(`/shop/${product.id}`);
    }
    swipeDir.current = null;
  }

  function onCardClick() {
    if (Date.now() - lastTouch.current < 500) return;
    router.push(`/shop/${product.id}`);
  }

  return (
    <div
      className="group block cursor-pointer relative"
      onClick={onCardClick}
    >
      {/* Media container */}
      <div
        ref={mediaRef}
        className="relative overflow-hidden bg-[#FDF9F7] aspect-[7/10] md:aspect-[4/5] select-none"
        onTouchEnd={onTouchEnd}
      >
        <WishlistButton productId={product.id} productName={product.name} />

        {/* Quick add to cart — bottom-right, paired with the wishlist heart above it */}
        <button
          type="button"
          onClick={handleQuickAdd}
          aria-label={justAdded ? "Added to cart" : needsOptions ? "View options" : "Add to cart"}
          className="absolute bottom-2 right-2 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-transform duration-150 active:scale-90"
        >
          {justAdded ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A0622A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2C2220" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          )}
        </button>

        {combinedImages.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-px bg-[#A0622A]/30" />
            <p className="text-[0.5rem] tracking-[0.25em] uppercase text-[#A0622A]/40">Coming Soon</p>
            <div className="w-8 h-px bg-[#A0622A]/30" />
          </div>
        )}

        {combinedImages.map((src, i) => (
          <Image
            key={src + i}
            src={src}
            alt={product.altText || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority && i === 0}
            loading={priority && i === 0 ? "eager" : "lazy"}
            onLoad={i === 0 ? undefined : (e) => handleImageLoad(src, e)}
            className={`transition-[opacity,transform] duration-500 ease-out group-hover:scale-[1.04] ${
              i !== 0 && containImages.has(src) ? "object-contain bg-[#FDF9F7]" : "object-cover"
            } ${i === slideIndex ? "opacity-100" : "opacity-0"}`}
          />
        ))}

        {/* Slide dots */}
        {combinedImages.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10 pointer-events-none">
            {combinedImages.map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all duration-200 ${
                  i === slideIndex ? "w-3 h-1 bg-white" : "w-1 h-1 bg-white/45"
                }`}
              />
            ))}
          </div>
        )}

        {/* Desktop prev / next arrows */}
        {combinedImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goTo(slideIndex - 1); }}
              aria-label="Previous"
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 text-[#2C2220] text-sm leading-none"
            >
              ‹
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goTo(slideIndex + 1); }}
              aria-label="Next"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 text-[#2C2220] text-sm leading-none"
            >
              ›
            </button>
          </>
        )}

      </div>

      {/* Info */}
      <div className="pt-3 px-1">
        {product.variants && product.variants.length > 1 && (
          <div className="flex gap-1.5 mb-2.5">
            {product.variants.map((v) => (
              <button
                key={v}
                aria-label={v}
                onClick={(e) => { e.stopPropagation(); jumpToVariant(v); }}
                className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                  activeVariant === v ? "border-[#2C2220]" : "border-transparent"
                }`}
                style={{ backgroundColor: SWATCH_COLORS[v] ?? "#888" }}
              />
            ))}
          </div>
        )}
        <p className="text-[0.6rem] tracking-[0.15em] uppercase text-[#8C7B6E] mb-1">{product.category}</p>
        {/* A <p>, not <h3> — a sitewide rule forces every h1-h4 into light Cormorant
            Garamond serif, which fights the clean, bold sans look wanted here. */}
        <p role="heading" aria-level={3} className="font-body text-sm font-semibold tracking-normal text-[#2C2220] leading-snug group-hover:text-[#A0622A] transition-colors duration-300">
          {product.name}
        </p>
        <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
          <span className="text-sm font-light tracking-wide text-[#2C2220]">
            {format(salePrice ?? product.price)}
          </span>
          {salePrice !== null && (
            <>
              <span className="text-xs font-light tracking-wide text-[#8C7B6E]/50 line-through">
                {format(product.price)}
              </span>
              <span className="text-[0.55rem] tracking-[0.1em] uppercase text-[#FDF9F7] bg-[#A0622A] px-1.5 py-0.5">
                -{product.salePercent}%
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
