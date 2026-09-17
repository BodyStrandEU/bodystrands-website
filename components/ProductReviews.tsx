"use client";
import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "@/components/SmartImage";
import { createPortal } from "react-dom";
import { type Review, dedupeReviews } from "@/data/category-reviews";
import customerReviewsRaw from "@/data/customer-reviews.json";
import { products } from "@/lib/products";

// Real, verified-purchase reviews approved via /admin/reviews. Committed to this JSON
// file on approval, so a new one goes live on the next deploy just like any other content edit.
// This is the ONLY source this component reads from — no seeded/placeholder testimonials.
const CUSTOMER_REVIEWS = customerReviewsRaw as Record<string, Review[]>;
const ALL_REAL_REVIEWS: Review[] = Object.values(CUSTOMER_REVIEWS).flat();

// Each review is assigned to exactly one real product it was actually left for (fixed
// Sep 2026 — previously the same review was copy-pasted across many near-identical
// products, which is both dishonest and against Google's review-markup guidelines).
// This maps a review's productId to that product's category, so we can build the
// "other X in this category" tier without duplicating reviews across products ourselves.
const CATEGORY_BY_PRODUCT_ID: Record<string, string> = Object.fromEntries(
  products.map((p) => [p.id, p.category])
);
const PRODUCT_NAME_BY_ID: Record<string, string> = Object.fromEntries(
  products.map((p) => [p.id, p.name])
);

// Deterministic "random-looking" order — a stable hash of each review's own content, not
// Math.random(). Using real randomness here would render a different order on the server
// vs. the client and trigger a hydration mismatch; this stays identical on every render.
function stableShuffleKey(r: Review): number {
  const s = `${r.name}|${r.date}|${r.headline}`;
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) | 0;
  return hash;
}

function parseDate(d: string): number {
  const t = Date.parse(d);
  return Number.isNaN(t) ? 0 : t;
}

function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= rating ? "#A0622A" : "none"}
          stroke={i <= rating ? "#A0622A" : "#D4B8A8"}
          strokeWidth="1.5"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function Avatar({ name, size = "w-9 h-9 text-[0.6rem]" }: { name: string; size?: string }) {
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <div className={`${size} rounded-full bg-[#E8B4A8]/50 flex items-center justify-center flex-shrink-0`}>
      <span className="font-medium text-[#8A5222]">{initial}</span>
    </div>
  );
}

// Etsy-style lightbox: photo on one side, that photo's own review alongside it, with
// prev/next arrows cycling through every photo review — not just a single static image.
function PhotoReviewLightbox({
  reviews, index, onIndexChange, onClose,
}: {
  reviews: Review[]; index: number; onIndexChange: (i: number) => void; onClose: () => void;
}) {
  const review = reviews[index];
  const go = (dir: 1 | -1) => onIndexChange((index + dir + reviews.length) % reviews.length);

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 md:p-8" onClick={onClose}>
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 md:top-5 md:right-5 text-white/80 hover:text-white text-2xl leading-none z-10"
      >
        ✕
      </button>

      {reviews.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); go(-1); }}
            aria-label="Previous photo review"
            className="absolute left-2 md:left-5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#2C2220] shadow-lg z-10 hover:bg-[#FDF9F7] transition-colors"
          >
            ‹
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); go(1); }}
            aria-label="Next photo review"
            className="absolute right-2 md:right-5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#2C2220] shadow-lg z-10 hover:bg-[#FDF9F7] transition-colors"
          >
            ›
          </button>
        </>
      )}

      <div
        className="flex flex-col md:flex-row w-full max-w-3xl max-h-[90vh] bg-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full md:w-3/5 aspect-square flex-shrink-0">
          <Image src={review.image!} alt={`${review.name}'s photo review`} fill sizes="(max-width: 768px) 100vw, 60vw" className="object-cover" />
        </div>
        <div className="flex flex-col p-5 md:p-6 md:w-2/5 overflow-y-auto">
          <div className="flex items-center gap-2.5 mb-3">
            <Avatar name={review.name} />
            <div className="min-w-0">
              <p className="text-[0.62rem] tracking-[0.1em] uppercase text-[#2C2220] font-medium truncate">{review.name}</p>
              <p className="text-[0.55rem] text-[#8C7B6E]/70 truncate">{review.location}</p>
            </div>
            <span className="ml-auto text-[0.55rem] tracking-[0.1em] text-[#8C7B6E]/70 whitespace-nowrap">{review.date}</span>
          </div>
          <Stars rating={review.rating} />
          <p className="text-[0.78rem] font-semibold tracking-wide text-[#2C2220] mt-3 mb-1.5 leading-snug">{review.headline}</p>
          <p className="text-[0.8rem] font-light leading-relaxed text-[#5C4E47]">{review.text}</p>
          {review.shopResponse && (
            <div className="mt-3 pl-3 border-l-2 border-[#A0622A]/40">
              <p className="text-[0.6rem] tracking-[0.1em] uppercase text-[#A0622A] font-medium mb-1">
                Response from Bodystrands
              </p>
              <p className="text-[0.72rem] font-light leading-relaxed text-[#8C7B6E]">
                {review.shopResponse}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// Horizontal strip of every photo submitted for this category — the "proof gallery",
// separate from the text list below so the list itself doesn't need photos clustered up top.
function PhotoStrip({ photoReviews, onOpen }: { photoReviews: Review[]; onOpen: (i: number) => void }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  if (photoReviews.length === 0) return null;

  function scroll(dir: 1 | -1) {
    scrollerRef.current?.scrollBy({ left: dir * 180, behavior: "smooth" });
  }

  return (
    <div className="relative mb-6">
      <div ref={scrollerRef} className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        {photoReviews.map((r, i) => (
          <button
            key={i}
            onClick={() => onOpen(i)}
            aria-label={`View ${r.name}'s photo`}
            className="relative w-20 h-20 flex-shrink-0 overflow-hidden"
          >
            <Image src={r.image!} alt={`${r.name}'s photo review`} fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
      {photoReviews.length > 4 && (
        <button
          onClick={() => scroll(1)}
          aria-label="See more photos"
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-[#E8B4A8]/50 items-center justify-center text-[#2C2220] text-xs shadow-sm hover:bg-[#FDF9F7] transition-colors"
        >
          →
        </button>
      )}
    </div>
  );
}

// Sits as the first card in the list when this product has no reviews of its own yet —
// same bordered-box footprint as a real ReviewCard so it blends into the list rather
// than looming over it as a separate empty-state banner.
function BeFirstCard() {
  return (
    <div className="flex flex-col justify-center items-center text-center bg-[#FDF9F7] border border-dashed border-[#A0622A]/40 p-4 md:p-5 min-h-[120px]">
      <p className="text-[0.68rem] tracking-[0.1em] uppercase text-[#A0622A] font-medium mb-1">
        Be the first to review this item
      </p>
      <p className="text-[0.72rem] font-light text-[#8C7B6E]">
        No one's reviewed this exact piece yet — here's what customers are saying about the rest of the shop.
      </p>
    </div>
  );
}

// When a card is shown outside the context of its own product (the "other X from our
// shop" and "more reviews from our shop" tiers), it needs to say which product it was
// actually left for — an Etsy-style "Purchased: <product>" link — since otherwise a
// review with no visible product context reads as if it's about the page you're on.
function PurchasedLink({ productId }: { productId?: string }) {
  const name = productId ? PRODUCT_NAME_BY_ID[productId] : undefined;
  if (!productId || !name) return null;
  return (
    <p className="text-[0.6rem] text-[#8C7B6E] mb-2">
      Purchased:{" "}
      <Link href={`/shop/${productId}`} className="underline decoration-[#E8B4A8] hover:text-[#A0622A]">
        {name}
      </Link>
    </p>
  );
}

function ReviewCard({
  review, onOpenPhoto, showPurchasedLink = false,
}: {
  review: Review; onOpenPhoto: () => void; showPurchasedLink?: boolean;
}) {
  return (
    <div className="flex flex-col bg-white border border-[#E8B4A8]/40 p-4 md:p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <Avatar name={review.name} />
        <div className="min-w-0">
          <p className="text-[0.62rem] tracking-[0.1em] uppercase text-[#2C2220] font-medium truncate">
            {review.name}
          </p>
          <p className="text-[0.55rem] text-[#8C7B6E]/70 truncate">
            {review.location}
          </p>
        </div>
        <span className="ml-auto text-[0.55rem] tracking-[0.1em] text-[#8C7B6E]/70 whitespace-nowrap">
          {review.date}
        </span>
      </div>

      {showPurchasedLink && <PurchasedLink productId={review.productId} />}

      <Stars rating={review.rating} />

      <p className="text-[0.72rem] font-semibold tracking-wide text-[#2C2220] mt-2.5 mb-1.5 leading-snug">
        {review.headline}
      </p>

      <div className="flex items-start gap-3">
        <p className="text-[0.75rem] font-light leading-relaxed text-[#5C4E47] flex-1">
          {review.text}
        </p>
        {review.image && (
          <button
            onClick={onOpenPhoto}
            aria-label={`View ${review.name}'s photo`}
            className="relative w-14 h-14 flex-shrink-0 overflow-hidden"
          >
            <Image
              src={review.image}
              alt={`${review.name}'s photo review — ${review.headline}`}
              fill
              sizes="56px"
              className="object-cover"
            />
          </button>
        )}
      </div>

      {review.shopResponse && (
        <div className="mt-3 pl-3 border-l-2 border-[#A0622A]/40">
          <p className="text-[0.6rem] tracking-[0.1em] uppercase text-[#A0622A] font-medium mb-1">
            Response from Bodystrands
          </p>
          <p className="text-[0.72rem] font-light leading-relaxed text-[#8C7B6E]">
            {review.shopResponse}
          </p>
        </div>
      )}
    </div>
  );
}

const INITIAL_VISIBLE = 4;

// One tier's worth of reviews: heading, optional score/breakdown summary (only the
// "this product" tier gets one — the other two are honest social proof, not this
// product's own rating), a photo strip, cards, show-more, and its own lightbox.
function ReviewGroup({
  heading, reviews, showSummary, emptyState, showPurchasedLink = false,
}: {
  heading: string; reviews: Review[]; showSummary: boolean; emptyState?: ReactNode; showPurchasedLink?: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (reviews.length === 0) {
    return emptyState ? <div>{emptyState}</div> : null;
  }

  const visibleReviews = showAll ? reviews : reviews.slice(0, INITIAL_VISIBLE);
  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    return { star, pct: Math.round((count / reviews.length) * 100) };
  });

  // Single shared pool of photo reviews — the strip and every inline thumbnail all open
  // the same lightbox instance, just at a different starting index, so prev/next cycles
  // through every photo review in this tier rather than being scoped to one card.
  const photoReviews = reviews.filter((r) => r.image);

  return (
    <div>
      <h3 className="font-heading text-lg md:text-xl font-light text-[#2C2220] mb-4">{heading}</h3>

      {showSummary && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 mb-6">
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="font-heading text-3xl font-light text-[#2C2220]">{avgRating.toFixed(1)}</span>
            <div className="flex flex-col gap-1">
              <Stars rating={Math.round(avgRating)} size={14} />
              <span className="text-[0.55rem] tracking-[0.1em] uppercase text-[#8C7B6E] whitespace-nowrap">
                {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1 w-full sm:max-w-[200px]">
            {breakdown.map(({ star, pct }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-[0.55rem] text-[#8C7B6E] w-2.5 flex-shrink-0">{star}</span>
                <div className="flex-1 h-1 bg-[#E8B4A8]/25 rounded-full overflow-hidden">
                  <div className="h-full bg-[#A0622A] rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[0.55rem] text-[#8C7B6E] w-6 flex-shrink-0 text-right">{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <PhotoStrip photoReviews={photoReviews} onOpen={setLightboxIndex} />

      <div className="flex flex-col gap-3">
        {visibleReviews.map((review, i) => (
          <ReviewCard
            key={i}
            review={review}
            onOpenPhoto={() => setLightboxIndex(photoReviews.indexOf(review))}
            showPurchasedLink={showPurchasedLink}
          />
        ))}
      </div>

      {!showAll && reviews.length > INITIAL_VISIBLE && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#2C2220]/25 text-[0.58rem] tracking-[0.2em] uppercase text-[#2C2220] hover:bg-[#2C2220] hover:text-[#FDF9F7] transition-colors duration-200"
        >
          Show all {reviews.length} reviews
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      )}

      {lightboxIndex !== null && (
        <PhotoReviewLightbox
          reviews={photoReviews}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}

export default function ProductReviews({ category, productId, className = "" }: { category: string; productId?: string; className?: string }) {
  // This product's own real reviews, most recent first. This is the ONLY tier that
  // ever feeds the page's aggregateRating/Review schema markup (see shop/[id]/page.tsx)
  // since it's the only one genuinely about this exact product.
  const own = ALL_REAL_REVIEWS
    .filter((r) => productId && r.productId === productId)
    .sort((a, b) => parseDate(b.date) - parseDate(a.date));

  // Other real products in the same category — its own honest tier ("reviews of
  // other X"), never folded into this product's own rating/schema.
  const sameCategory = productId
    ? dedupeReviews(
        ALL_REAL_REVIEWS.filter(
          (r) => r.productId !== productId && CATEGORY_BY_PRODUCT_ID[r.productId ?? ""] === category
        )
      ).sort((a, b) => stableShuffleKey(a) - stableShuffleKey(b))
    : [];

  // Every other real review in the shop, outside this product's own category — the
  // widest tier of social proof. Deduped: the rare still-duplicated review collapses
  // to one copy so it doesn't repeat in the list.
  const shopWide = dedupeReviews(
    ALL_REAL_REVIEWS.filter(
      (r) => r.productId !== productId && CATEGORY_BY_PRODUCT_ID[r.productId ?? ""] !== category
    )
  ).sort((a, b) => stableShuffleKey(a) - stableShuffleKey(b));

  return (
    <section className={`pt-8 mt-2 border-t border-[#E8B4A8]/40 ${className}`}>
      <div className="flex flex-col gap-10">
        <ReviewGroup
          heading={own.length > 0 ? "What customers are saying about this piece" : "Be the first to review this item"}
          reviews={own}
          showSummary
          emptyState={<BeFirstCard />}
        />
        <ReviewGroup heading={`Reviews of other ${category} from our shop`} reviews={sameCategory} showSummary={false} showPurchasedLink />
        <ReviewGroup heading="More reviews from our shop" reviews={shopWide} showSummary={false} showPurchasedLink />
      </div>
    </section>
  );
}
