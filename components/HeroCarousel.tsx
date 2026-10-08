"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import MagneticButton from "@/components/MagneticButton";

type Slide = {
  image: string;
  // Optional art direction: a separate photo for phones (the hero is tall and narrow
  // there, so a wide photo gets zoomed in hard), and where to anchor each crop so the
  // overlaid sub-text and button land on a quiet part of the photo.
  mobileImage?: string;
  position?: string;
  mobilePosition?: string;
  eyebrow: string;
  headline: React.ReactNode;
  sub: string;
};

// Full-screen landscape photos (Oct 8, 2026, user request): every photo keeps its left third
// plain and light, because the desktop text sits there in dark ink.
const SLIDES: Slide[] = [
  {
    image: "/images/hero-shoulder-chain.jpg",
    mobileImage: "/images/hero-shoulder-chain-mobile.jpg",
    position: "center 30%",
    mobilePosition: "75% center",   // neck + both shoulder chains
    eyebrow: "Handmade Body Jewelry",
    headline: <>Wear it. <em className="not-italic text-[#A0622A]">Feel it.</em></>,
    sub: "Dainty, minimal body chains crafted by hand. Made to move with you.",
  },
  {
    image: "/images/hero-studio.jpg",
    mobileImage: "/images/hero-studio-mobile.jpg",
    position: "center 40%",
    mobilePosition: "60% center",   // hand pulling chain off the spool
    eyebrow: "Piece by Piece",
    headline: <>Handmade, <em className="not-italic text-[#A0622A] whitespace-nowrap">Not Mass-Made.</em></>,
    sub: "Every chain shaped, linked, and finished by hand in our studio.",
  },
  {
    image: "/images/hero-packaging-boxes.jpg",
    mobileImage: "/images/hero-packaging-boxes-mobile.jpg",
    position: "center 45%",
    mobilePosition: "77% center",   // hand + both boxes
    eyebrow: "Thoughtfully Packaged",
    headline: <>Arrives <em className="not-italic text-[#A0622A]">Beautifully.</em></>,
    sub: "Every piece ships in signature Bodystrands packaging, ready to gift or keep.",
  },
  {
    image: "/images/hero-gift-wrap.jpg",
    mobileImage: "/images/hero-gift-wrap-mobile.jpg",
    position: "center 45%",
    mobilePosition: "86% center",   // both wrapped boxes + tag
    eyebrow: "Gift Wrapping",
    headline: <>Ready to <em className="not-italic text-[#A0622A]">Gift.</em></>,
    sub: "Add gift wrap and a personal note at checkout for €4.",
  },
];

const SLIDE_DURATION = 4000;

export default function HeroCarousel() {
  const [active, setActive] = useState(0);

  // Restarts on every slide change, so a slide picked from the progress bars gets its full time.
  useEffect(() => {
    if (SLIDES.length < 2) return;
    const t = setTimeout(() => setActive((i) => (i + 1) % SLIDES.length), SLIDE_DURATION);
    return () => clearTimeout(t);
  }, [active]);

  const slide = SLIDES[active];
  const s0HasMobile = SLIDES.every((x) => x.mobileImage);

  return (
    // Full-screen photo with the text on it (Oct 8, 2026, user request — modelled on
    // elli.com): the photo fills everything under the fixed header. Desktop puts the
    // text on the plain wall on the left in dark ink. Phones show the photo in the top
    // Phones use the vertical photos (mobileImage, 9:16, subject at the top) full-screen,
    // fading into cream at the bottom where the same dark text sits — a dark scrim over
    // light photos looked muddy. A slide without a vertical photo would fall back to its
    // landscape photo in the top two-thirds (about 4:5, so it isn't blown up 3x).
    <section className="relative h-[calc(100svh-2rem)] min-h-[560px] bg-[#FDF9F7]">
      <div className="absolute inset-x-0 bottom-0 top-[93px] md:top-[95px] overflow-hidden hero-image-reveal">
        <div className={`absolute inset-x-0 top-0 md:bottom-0 ${s0HasMobile ? "bottom-0" : "bottom-[34%]"}`}>
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
              className="object-cover hidden md:block"
              style={{ objectPosition: s.position ?? "center" }}
              sizes="100vw"
            />
            <Image
              src={s.mobileImage ?? s.image}
              alt=""
              fill
              priority={i === 0}
              className="object-cover md:hidden"
              style={{ objectPosition: s.mobileImage ? "center top" : s.mobilePosition ?? "center" }}
              sizes="100vw"
            />
          </div>
        ))}
          {/* Phones: the photo fades into the cream the text sits on. */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent via-[#FDF9F7]/70 via-60% to-[#FDF9F7] md:hidden" />
        </div>
        {/* Desktop: a light wash on the left for the dark text. */}
        <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-[#FDF9F7]/35 via-transparent to-transparent" />

        <div className="absolute inset-0 z-10 flex items-end md:items-center">
          <div className="w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-16 pb-8 md:pb-0 flex flex-col items-center md:items-start text-center md:text-left">
            <p key={`eyebrow-${active}`} className="hero-enter text-[0.6rem] md:text-[0.62rem] tracking-[0.4em] uppercase text-[#A0622A] mb-3 md:mb-4" style={{ animationDelay: "0.05s" }}>
              {slide.eyebrow}
            </p>
            <h1 key={`headline-${active}`} className="hero-enter font-heading text-4xl md:text-6xl lg:text-7xl font-light text-[#2C2220] leading-[1.05] mb-4 md:mb-5 md:max-w-[34rem]" style={{ animationDelay: "0.2s" }}>
              {slide.headline}
            </h1>
            <p key={`sub-${active}`} className="hero-enter text-sm md:text-base font-light leading-relaxed tracking-wide text-[#2C2220]/80 mb-6 md:mb-8 max-w-sm" style={{ animationDelay: "0.35s" }}>
              {slide.sub}
            </p>
            <MagneticButton>
              <Link href="/shop" className="btn-primary-filled text-center">Shop Now</Link>
            </MagneticButton>

            {/* Carousel progress indicator */}
            {SLIDES.length > 1 && <div className="flex gap-2 mt-6 md:mt-8">
              {SLIDES.map((s, i) => (
                <button
                  key={s.image}
                  onClick={() => setActive(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className="relative h-[3px] w-10 rounded-full bg-[#2C2220]/15 overflow-hidden"
                >
                  {i === active && (
                    <span
                      className="absolute inset-y-0 left-0 bg-[#A0622A] rounded-full"
                      style={{ animation: `heroProgress ${SLIDE_DURATION}ms linear forwards` }}
                    />
                  )}
                  {i < active && <span className="absolute inset-0 bg-[#A0622A] rounded-full" />}
                </button>
              ))}
            </div>}
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
