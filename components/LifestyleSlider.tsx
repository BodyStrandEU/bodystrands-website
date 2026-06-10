"use client";
import { useRef } from "react";
import Image from "next/image";

export default function LifestyleSlider({ images }: { images: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "prev" | "next") => {
    if (!trackRef.current) return;
    const itemWidth = trackRef.current.clientWidth / 4;
    trackRef.current.scrollBy({ left: dir === "next" ? itemWidth : -itemWidth, behavior: "smooth" });
  };

  if (images.length === 0) return null;

  return (
    <section className="relative group/slider">
      {/* Left arrow */}
      <button
        onClick={() => scroll("prev")}
        className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[#FDF9F7]/85 backdrop-blur-sm flex items-center justify-center text-[#2C2220] text-xl opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 hover:bg-[#FDF9F7] active:scale-95"
        aria-label="Previous"
      >
        ‹
      </button>

      {/* Right arrow */}
      <button
        onClick={() => scroll("next")}
        className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[#FDF9F7]/85 backdrop-blur-sm flex items-center justify-center text-[#2C2220] text-xl opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 hover:bg-[#FDF9F7] active:scale-95"
        aria-label="Next"
      >
        ›
      </button>

      {/* Scrollable track */}
      <div
        ref={trackRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
      >
        {images.map((src, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-1/2 md:w-1/4 snap-start aspect-square relative overflow-hidden"
          >
            <Image
              src={src}
              alt={`Bodystrands lifestyle ${i + 1}`}
              fill
              className="object-cover object-center hover:scale-105 transition-transform duration-700"
            />
          </div>
        ))}
      </div>

      {/* Label */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <p className="text-[0.45rem] tracking-[0.35em] uppercase text-white/50">
          Our Journal
        </p>
      </div>
    </section>
  );
}
