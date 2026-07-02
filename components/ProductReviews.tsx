"use client";
import { useState } from "react";
import { CATEGORY_REVIEWS, type Review } from "@/data/category-reviews";

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

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="flex flex-col bg-white border border-[#E8B4A8]/40 p-5 md:p-6">
      <div className="flex items-start justify-between gap-3 mb-3">
        <Stars rating={review.rating} />
        <span className="text-[0.55rem] tracking-[0.12em] text-[#8C7B6E]/70 whitespace-nowrap mt-0.5">
          {review.date}
        </span>
      </div>

      <p className="text-[0.72rem] font-semibold tracking-wide text-[#2C2220] mb-2 leading-snug">
        {review.headline}
      </p>

      <p className="text-[0.75rem] font-light leading-relaxed text-[#5C4E47] flex-1 mb-4">
        {review.text}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-[#E8B4A8]/30">
        <div>
          <p className="text-[0.6rem] tracking-[0.18em] uppercase text-[#2C2220] font-medium">
            {review.name}
          </p>
          <p className="text-[0.55rem] tracking-[0.1em] text-[#8C7B6E]/70 mt-0.5">
            {review.location}
          </p>
        </div>
        <span className="flex items-center gap-1 text-[0.5rem] tracking-[0.15em] uppercase text-[#A0622A]/70">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" />
          </svg>
          Verified
        </span>
      </div>
    </div>
  );
}

const INITIAL_VISIBLE = 6;

export default function ProductReviews({ category }: { category: string }) {
  const reviews = CATEGORY_REVIEWS[category];
  if (!reviews || reviews.length === 0) return null;

  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? reviews : reviews.slice(0, INITIAL_VISIBLE);

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;

  return (
    <section className="mt-20 md:mt-28 pt-16 border-t border-[#E8B4A8]/40">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
        <div>
          <p className="text-[0.55rem] tracking-[0.3em] uppercase text-[#A0622A] mb-3">
            Customer Reviews
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-light text-[#2C2220] mb-5">
            What people are saying
          </h2>
          <div className="flex items-center gap-4">
            <span className="font-heading text-4xl font-light text-[#2C2220]">{avgRating}</span>
            <div className="flex flex-col gap-1.5">
              <Stars rating={5} size={16} />
              <span className="text-[0.6rem] tracking-[0.15em] uppercase text-[#8C7B6E]">
                {fiveStarCount} of {reviews.length} customers gave 5 stars
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {visible.map((review, i) => (
          <ReviewCard key={i} review={review} />
        ))}
      </div>

      {/* Show more */}
      {!showAll && reviews.length > INITIAL_VISIBLE && (
        <div className="mt-10 text-center">
          <button
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-2 px-7 py-3 border border-[#2C2220]/25 text-[0.6rem] tracking-[0.25em] uppercase text-[#2C2220] hover:bg-[#2C2220] hover:text-[#FDF9F7] transition-colors duration-200"
          >
            Show all {reviews.length} reviews
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}
