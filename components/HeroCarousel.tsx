"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import MagneticButton from "@/components/MagneticButton";

type Slide = {
  image: string;
  eyebrow: string;
  headline: React.ReactNode;
  sub: string;
};

const SLIDES: Slide[] = [
  {
    image: "/images/hero-bridal-shoulder.jpeg",
    eyebrow: "Handmade Body Jewelry",
    headline: <>Wear it. <em className="not-italic text-[#A0622A]">Feel it.</em></>,
    sub: "Dainty, minimal body chains crafted by hand. Made to move with you.",
  },
  {
    image: "/images/hero-handmade.jpg",
    eyebrow: "Piece by Piece",
    headline: <>Handmade, <em className="not-italic text-[#A0622A]">Not Mass-Made.</em></>,
    sub: "Every chain shaped, linked, and finished by hand in our studio.",
  },
  {
    image: "/images/hero-packaging.jpg",
    eyebrow: "Thoughtfully Packaged",
    headline: <>Arrives <em className="not-italic text-[#A0622A]">Beautifully.</em></>,
    sub: "Every piece ships in signature Bodystrands packaging, ready to gift or keep.",
  },
];

const SLIDE_DURATION = 4000;

export default function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), SLIDE_DURATION);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[active];

  return (
    <section className="relative flex flex-col min-h-screen">
      {/* ── Top panel — cream background, large brand headline.
          Fixed min-height on the text wrapper so 1-line and 2-line headlines
          don't change the panel's total height and push the image down. ── */}
      <div className="relative z-10 bg-[#FDF9F7] pt-20 md:pt-24 pb-6 md:pb-8 px-6 flex-shrink-0 flex flex-col items-center text-center">
        <p key={`eyebrow-${active}`} className="hero-enter text-[0.58rem] md:text-[0.62rem] tracking-[0.4em] uppercase text-[#A0622A] mb-3" style={{ animationDelay: "0.05s" }}>
          {slide.eyebrow}
        </p>
        <div className="min-h-[56px] md:min-h-[130px] flex items-center justify-center">
          <h1 key={`headline-${active}`} className="hero-enter font-heading text-3xl md:text-5xl lg:text-6xl font-light text-[#2C2220] leading-[1.08] max-w-4xl" style={{ animationDelay: "0.2s" }}>
            {slide.headline}
          </h1>
        </div>
      </div>

      {/* ── Image block — fills all remaining viewport height.
          This wrapper is never re-keyed by `active`, so hero-image-reveal only
          plays once on initial mount — text appears first, image follows. ── */}
      <div className="relative flex-1 overflow-hidden hero-image-reveal">
        {SLIDES.map((s, i) => (
          <div
            key={s.image}
            className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
            style={{ opacity: i === active ? 1 : 0 }}
          >
            <Image
              src={s.image}
              alt=""
              fill
              priority={i === 0}
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C2220]/50 via-transparent to-transparent" />

        {/* Subtext + CTA overlaid on the image */}
        <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center text-center px-6 pb-8 md:pb-12">
          <p key={`sub-${active}`} className="hero-enter text-sm font-light leading-relaxed tracking-wide text-white/90 mb-6 max-w-sm drop-shadow-md" style={{ animationDelay: active === 0 ? "0.85s" : "0s" }}>
            {slide.sub}
          </p>
          <MagneticButton>
            <Link href="/shop" className="btn-primary-filled text-center">Shop Now</Link>
          </MagneticButton>

          {/* Carousel progress indicator */}
          <div className="flex gap-2 mt-8">
            {SLIDES.map((s, i) => (
              <button
                key={s.image}
                onClick={() => setActive(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="relative h-[3px] w-10 rounded-full bg-white/30 overflow-hidden"
              >
                {i === active && (
                  <span
                    className="absolute inset-y-0 left-0 bg-white rounded-full"
                    style={{ animation: `heroProgress ${SLIDE_DURATION}ms linear forwards` }}
                  />
                )}
                {i < active && <span className="absolute inset-0 bg-white rounded-full" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes heroProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes heroImageReveal {
          from { opacity: 0; transform: scale(1.03); }
          to   { opacity: 1; transform: scale(1); }
        }
        .hero-image-reveal {
          animation: heroImageReveal 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.45s both;
        }
      `}</style>
    </section>
  );
}
