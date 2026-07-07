"use client";
import { useRef, useState } from "react";
import Image from "@/components/SmartImage";
import { createPortal } from "react-dom";
import { CATEGORY_REVIEWS, type Review } from "@/data/category-reviews";
import customerReviewsRaw from "@/data/customer-reviews.json";

// Real, verified-purchase reviews approved via /admin/reviews. Committed to this JSON
// file on approval, so a new one goes live on the next deploy just like any other content edit.
const CUSTOMER_REVIEWS = customerReviewsRaw as Record<string, Review[]>;

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

function ReviewCard({ review, onOpenPhoto }: { review: Review; onOpenPhoto: () => void }) {
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
    </div>
  );
}

const INITIAL_VISIBLE = 4;

export default function ProductReviews({ category, productId, className = "" }: { category: string; productId?: string; className?: string }) {
  const reviews = [...(CATEGORY_REVIEWS[category] ?? []), ...(CUSTOMER_REVIEWS[category] ?? [])];

  // Hooks must run unconditionally — bail out in the render below if there's no data.
  const [showAll, setShowAll] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (reviews.length === 0) return null;

  // This product's own reviews float to the top (most recent first) as they accumulate;
  // the rest of the category fills in underneath in a natural-looking (not photo-grouped) order.
  const own   = reviews.filter((r) => productId && r.productId === productId).sort((a, b) => parseDate(b.date) - parseDate(a.date));
  const other = reviews.filter((r) => !(productId && r.productId === productId)).sort((a, b) => stableShuffleKey(a) - stableShuffleKey(b));
  const sorted = [...own, ...other];
  const visible = showAll ? sorted : sorted.slice(0, INITIAL_VISIBLE);
  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    return { star, pct: Math.round((count / reviews.length) * 100) };
  });

  // Single shared pool of photo reviews — the strip and every inline thumbnail all open
  // the same lightbox instance, just at a different starting index, so prev/next cycles
  // through every photo review site-wide rather than being scoped to one card.
  const photoReviews = sorted.filter((r) => r.image);

  return (
    <section className={`pt-8 mt-2 border-t border-[#E8B4A8]/40 ${className}`}>
      <h2 className="font-heading text-xl md:text-2xl font-light text-[#2C2220] mb-4">
        What our customers think about our {category}
      </h2>

      {/* Summary: score + star breakdown bars */}
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

      {/* Photo strip */}
      <PhotoStrip photoReviews={photoReviews} onOpen={setLightboxIndex} />

      {/* List */}
      <div className="flex flex-col gap-3">
        {visible.map((review, i) => (
          <ReviewCard
            key={i}
            review={review}
            onOpenPhoto={() => setLightboxIndex(photoReviews.indexOf(review))}
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
    </section>
  );
}
