"use client";
import { useState, useRef, useEffect } from "react";
import { type Review, dedupeReviews } from "@/data/category-reviews";
import customerReviewsRaw from "@/data/customer-reviews.json";

// Real, verified-purchase reviews only — same source ProductReviews.tsx reads from.
// No seeded/placeholder testimonials and no hardcoded aggregate score.
const CUSTOMER_REVIEWS = customerReviewsRaw as Record<string, Review[]>;

function stableShuffleKey(r: Review): number {
  const s = `${r.name}|${r.date}|${r.headline}`;
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) | 0;
  return hash;
}

// Deduped: the same real review is stored once per product it applies to (e.g. one
// review duplicated across 14 near-identical anklets) so it counts as each product's
// own review — but this homepage carousel is shop-wide, so without this the same
// review/photo would repeat over and over.
const reviews: Review[] = dedupeReviews(Object.values(CUSTOMER_REVIEWS).flat()).sort((a, b) => stableShuffleKey(a) - stableShuffleKey(b));
const AGGREGATE = {
  score: reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0,
  count: reviews.length,
};

function Stars({ rating = 5, size = 14 }: { rating?: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= rating ? "#A0622A" : "none"} stroke={i <= rating ? "#A0622A" : "#D4B8A8"} strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="flex flex-col h-full bg-[#FDF9F7] border border-[#E8B4A8]/50 p-6 md:p-7">
      {/* Stars */}
      <div className="mb-4">
        <Stars rating={review.rating} size={15} />
      </div>

      {/* Headline */}
      <p className="text-[0.75rem] font-semibold tracking-wide text-[#2C2220] mb-2">
        {review.headline}
      </p>

      {/* Review text */}
      <p className="text-[0.78rem] font-light leading-relaxed text-[#8C7B6E] flex-1">
        &ldquo;{review.text}&rdquo;
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#E8B4A8]/40">
        <span className="text-[0.6rem] tracking-[0.2em] uppercase text-[#2C2220] font-medium">
          {review.name}
        </span>
        <span className="text-[0.58rem] tracking-[0.12em] text-[#8C7B6E]/70">
          {review.date}
        </span>
      </div>
    </div>
  );
}

export default function ReviewsMarquee() {
  const [current, setCurrent]           = useState(0);
  const [cardsPerView, setCardsPerView] = useState(1);
  const containerRef  = useRef<HTMLDivElement>(null);
  const touchStartX   = useRef(0);
  const touchStartY   = useRef(0);
  const isDragging    = useRef(false);
  const maxIndexRef   = useRef(0);

  const maxIndex = Math.max(0, reviews.length - cardsPerView);
  maxIndexRef.current = maxIndex;

  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) setCardsPerView(4);
      else if (window.innerWidth >= 768) setCardsPerView(2);
      else setCardsPerView(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    setCurrent(c => Math.min(c, maxIndex));
  }, [cardsPerView, maxIndex]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      isDragging.current  = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - touchStartX.current;
      const dy = e.touches[0].clientY - touchStartY.current;
      if (!isDragging.current) {
        if (Math.abs(dx) > Math.abs(dy)) { isDragging.current = true; e.preventDefault(); }
      } else { e.preventDefault(); }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!isDragging.current) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      if (dx < -40) setCurrent(c => Math.min(maxIndexRef.current, c + 1));
      else if (dx > 40) setCurrent(c => Math.max(0, c - 1));
    };
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove",  onTouchMove,  { passive: false });
    el.addEventListener("touchend",   onTouchEnd,   { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove",  onTouchMove);
      el.removeEventListener("touchend",   onTouchEnd);
    };
  }, []);

  const cardWidthPct = 100 / cardsPerView;
  const translatePct = current * cardWidthPct;

  // No real reviews yet — hide the section entirely rather than show an empty/fake carousel.
  if (reviews.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-[#FDF9F7]">
      <div className="max-w-7xl mx-auto px-6 md:px-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 gap-8">
          <div>
            <p className="text-[0.6rem] tracking-[0.3em] uppercase text-[#A0622A] mb-3">Customer Reviews</p>
            <h2 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220] mb-6">
              Worn &amp; Loved
            </h2>
            {/* Aggregate score */}
            <div className="flex items-center gap-4">
              <span className="font-heading text-5xl font-light text-[#2C2220]">{AGGREGATE.score.toFixed(1)}</span>
              <div className="flex flex-col gap-1.5">
                <Stars rating={Math.round(AGGREGATE.score)} size={18} />
                <span className="text-[0.65rem] tracking-[0.15em] uppercase text-[#8C7B6E]">
                  Based on {AGGREGATE.count.toLocaleString()} reviews
                </span>
              </div>
            </div>
          </div>

          {/* Desktop nav arrows */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setCurrent(c => Math.max(0, c - 1))}
              disabled={current === 0}
              aria-label="Previous reviews"
              className="w-11 h-11 flex items-center justify-center border border-[#2C2220]/20 text-[#2C2220] hover:bg-[#2C2220] hover:text-[#FDF9F7] transition-colors disabled:opacity-20 disabled:cursor-default"
            >
              ←
            </button>
            <button
              onClick={() => setCurrent(c => Math.min(maxIndex, c + 1))}
              disabled={current === maxIndex}
              aria-label="Next reviews"
              className="w-11 h-11 flex items-center justify-center border border-[#2C2220]/20 text-[#2C2220] hover:bg-[#2C2220] hover:text-[#FDF9F7] transition-colors disabled:opacity-20 disabled:cursor-default"
            >
              →
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div ref={containerRef} className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${translatePct}%)` }}
          >
            {reviews.map((review, i) => (
              <div
                key={i}
                className="flex-shrink-0 px-2 md:px-3"
                style={{ width: `${cardWidthPct}%` }}
              >
                <ReviewCard review={review} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile dots */}
        <div className="flex md:hidden justify-center gap-2 mt-8">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to review ${i + 1}`}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === current ? "bg-[#A0622A]" : "bg-[#E8B4A8]"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
