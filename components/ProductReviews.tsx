"use client";
import { useState } from "react";
import Image from "@/components/SmartImage";
import { CATEGORY_REVIEWS, type Review } from "@/data/category-reviews";
import customerReviewsRaw from "@/data/customer-reviews.json";

// Real, verified-purchase reviews approved via /admin/reviews. Committed to this JSON
// file on approval, so a new one goes live on the next deploy just like any other content edit.
const CUSTOMER_REVIEWS = customerReviewsRaw as Record<string, Review[]>;

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

function Avatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-[#E8B4A8]/50 flex items-center justify-center flex-shrink-0">
      <span className="text-[0.65rem] font-medium text-[#8A5222]">{initial}</span>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="flex flex-col bg-white border border-[#E8B4A8]/40 overflow-hidden">
      {review.image && (
        <div className="relative w-full h-44 md:h-52">
          <Image
            src={review.image}
            alt={`${review.name}'s photo review — ${review.headline}`}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover object-[center_70%]"
          />
        </div>
      )}

      <div className="flex flex-col p-4 md:p-5">
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

        <p className="text-[0.75rem] font-light leading-relaxed text-[#5C4E47]">
          {review.text}
        </p>
      </div>
    </div>
  );
}

// Photo reviews are shown first, so keep enough initially visible that none of
// them are hidden behind "Show all" — bump this if more photo reviews are added.
const INITIAL_VISIBLE = 6;

export default function ProductReviews({ category, className = "" }: { category: string; className?: string }) {
  const reviews = [...(CATEGORY_REVIEWS[category] ?? []), ...(CUSTOMER_REVIEWS[category] ?? [])];

  // Hooks must run unconditionally — bail out in the render below if there's no data.
  const [showAll, setShowAll] = useState(false);

  if (reviews.length === 0) return null;

  // Photo reviews first (stable sort preserves relative order within each group).
  const sorted = [...reviews].sort((a, b) => (b.image ? 1 : 0) - (a.image ? 1 : 0));
  const visible = showAll ? sorted : sorted.slice(0, INITIAL_VISIBLE);
  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const recommendPct = Math.round((reviews.filter((r) => r.rating >= 4).length / reviews.length) * 100);

  return (
    <section className={`pt-8 mt-2 border-t border-[#E8B4A8]/40 ${className}`}>
      <h2 className="font-heading text-xl md:text-2xl font-light text-[#2C2220] mb-4">
        Reviews for this piece
      </h2>

      {/* Summary */}
      <div className="flex items-center gap-3 mb-6">
        <span className="font-heading text-3xl font-light text-[#2C2220]">{avgRating.toFixed(1)}</span>
        <div className="flex flex-col gap-1">
          <Stars rating={Math.round(avgRating)} size={14} />
          <span className="text-[0.55rem] tracking-[0.1em] uppercase text-[#8C7B6E] whitespace-nowrap">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""} · {recommendPct}% recommend
          </span>
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {visible.map((review, i) => (
          <ReviewCard key={i} review={review} />
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
    </section>
  );
}
