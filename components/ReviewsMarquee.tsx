"use client";
import { useState, useRef, useEffect } from "react";

const reviews = [
  { name: "Jovana",   text: "Beautiful body chain! Came in nice packaging and looks exactly as described. I love wearing mine over a thin cashmere shirt—it adds such a classy touch." },
  { name: "Johanna",  text: "Loved the necklace and the cute note with the package. It was packaged nicely and arrived on the expected date." },
  { name: "Yesim",    text: "The necklace looks even more beautiful and higher quality in real life than described!" },
  { name: "Ferdose",  text: "Item arrived on time and looked like the image. It also seems durable, and I'm not afraid of it snapping easily, which I appreciate." },
  { name: "Krystal",  text: "Beautiful body chain and good quality! It came in a sturdy storage box that will ensure it's kept well when it's not being worn." },
  { name: "Miranda",  text: "Great quality and the seller is great with communication and fast shipping!" },
  { name: "Yesim",    text: "A great accessory for crop tops. Feels very comfortable against the skin." },
  { name: "Tomislav", text: "Very good quality, very good customer service! I am very satisfied!" },
];

function StarRow() {
  return (
    <div className="flex gap-0.5 mb-3">
      {[...Array(5)].map((_, i) => (
        <span key={i} className="text-[#A0622A] text-[0.65rem]">★</span>
      ))}
    </div>
  );
}

export default function ReviewsMarquee() {
  const [current, setCurrent]         = useState(0);
  const [cardsPerView, setCardsPerView] = useState(1);
  const containerRef  = useRef<HTMLDivElement>(null);
  const touchStartX   = useRef(0);
  const touchStartY   = useRef(0);
  const isDragging    = useRef(false);
  const maxIndexRef   = useRef(0);

  const maxIndex = Math.max(0, reviews.length - cardsPerView);
  maxIndexRef.current = maxIndex;

  // Responsive cards per view
  useEffect(() => {
    const update = () => setCardsPerView(window.innerWidth >= 768 ? 3 : 1);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Clamp index when switching between mobile/desktop
  useEffect(() => {
    setCurrent(c => Math.min(c, maxIndex));
  }, [cardsPerView, maxIndex]);

  // Non-passive touch handlers — same pattern as ProductGallery
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
        if (Math.abs(dx) > Math.abs(dy)) {
          isDragging.current = true;
          e.preventDefault();
        }
      } else {
        e.preventDefault();
      }
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
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6 md:px-10 mb-14 text-center">
        <p className="text-[0.6rem] tracking-[0.3em] uppercase text-[#A0622A] mb-3">Real Reviews</p>
        <h2 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220]">
          Worn &amp; Loved
        </h2>
      </div>

      <div className="relative max-w-7xl mx-auto px-10 md:px-16">

        {/* Prev arrow — desktop only */}
        <button
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
          aria-label="Previous reviews"
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center border border-[#2C2220]/20 bg-[#FDF9F7] text-[#2C2220] hover:bg-[#2C2220] hover:text-[#FDF9F7] transition-colors disabled:opacity-25 disabled:cursor-default"
        >
          ←
        </button>

        {/* Next arrow — desktop only */}
        <button
          onClick={() => setCurrent(c => Math.min(maxIndex, c + 1))}
          disabled={current === maxIndex}
          aria-label="Next reviews"
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center border border-[#2C2220]/20 bg-[#FDF9F7] text-[#2C2220] hover:bg-[#2C2220] hover:text-[#FDF9F7] transition-colors disabled:opacity-25 disabled:cursor-default"
        >
          →
        </button>

        {/* Carousel track */}
        <div ref={containerRef} className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${translatePct}%)` }}
          >
            {reviews.map((review, i) => (
              <div
                key={i}
                className="flex-shrink-0 px-3"
                style={{ width: `${cardWidthPct}%` }}
              >
                <StarRow />
                <p className="text-[0.8rem] font-light leading-relaxed tracking-wide text-[#2C2220] italic">
                  &ldquo;{review.text}&rdquo;
                </p>
                <p className="text-[0.58rem] tracking-[0.22em] uppercase text-[#8C7B6E] mt-4">
                  — {review.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators — mobile only */}
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
