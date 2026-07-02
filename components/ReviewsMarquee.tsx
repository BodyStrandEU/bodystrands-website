"use client";
import { useState, useRef, useEffect } from "react";

const AGGREGATE = { score: 4.9, count: 120 };

const reviews = [
  { name: "Jovana M.",   headline: "Absolutely stunning piece",      text: "Beautiful body chain! Came in nice packaging and looks exactly as described. I love wearing mine over a thin cashmere shirt—it adds such a classy touch.", date: "Mar 2026" },
  { name: "Johanna K.",  headline: "Perfect gift, arrived on time",   text: "Loved the necklace and the cute note with the package. It was packaged nicely and arrived on the expected date.", date: "Feb 2026" },
  { name: "Yesim A.",    headline: "Even more beautiful in person",   text: "The necklace looks even more beautiful and higher quality in real life than described!", date: "Apr 2026" },
  { name: "Ferdose L.",  headline: "Great quality, very durable",     text: "Item arrived on time and looked like the image. It also seems durable, and I'm not afraid of it snapping easily, which I appreciate.", date: "Jan 2026" },
  { name: "Krystal T.",  headline: "Love the packaging too",          text: "Beautiful body chain and good quality! It came in a sturdy storage box that will ensure it's kept well when it's not being worn.", date: "Mar 2026" },
  { name: "Miranda S.",  headline: "Fast shipping, great seller",     text: "Great quality and the seller is great with communication and fast shipping!", date: "Feb 2026" },
  { name: "Yesim A.",    headline: "Perfect for everyday wear",       text: "A great accessory for crop tops. Feels very comfortable against the skin.", date: "May 2026" },
  { name: "Tomislav V.", headline: "Very satisfied with everything",  text: "Very good quality, very good customer service! I am very satisfied!", date: "Apr 2026" },
];

function Stars({ size = 14 }: { size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="#A0622A">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: typeof reviews[0] }) {
  return (
    <div className="flex flex-col h-full bg-[#FDF9F7] border border-[#E8B4A8]/50 p-6 md:p-7">
      {/* Stars */}
      <div className="mb-4">
        <Stars size={15} />
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
              <span className="font-heading text-5xl font-light text-[#2C2220]">{AGGREGATE.score}</span>
              <div className="flex flex-col gap-1.5">
                <Stars size={18} />
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
