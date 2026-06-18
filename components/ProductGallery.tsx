"use client";
import { useState, useEffect, useRef } from "react";
import Image from "@/components/SmartImage";
import type { Product } from "@/lib/products";
import { getVideoSources } from "@/lib/videoUtils";

type MediaItem = { type: "image"; src: string } | { type: "video"; src: string };

function buildMedia(images: string[], videoSrc?: string): MediaItem[] {
  const items: MediaItem[] = images.map((src) => ({ type: "image" as const, src }));
  if (videoSrc) items.splice(1, 0, { type: "video" as const, src: videoSrc });
  return items;
}

export default function ProductGallery({
  product,
  activeVariant,
}: {
  product: Product;
  activeVariant: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoError, setVideoError]   = useState(false);
  const [videoReady, setVideoReady]   = useState(false);

  const mainRef    = useRef<HTMLDivElement>(null);
  const videoRef   = useRef<HTMLVideoElement>(null);
  const touchStart = useRef({ x: 0, y: 0 });
  const swipeDir   = useRef<"h" | "v" | null>(null);

  const images = product.variantImages?.[activeVariant] ?? product.images ?? [];
  const videoSrc =
    product.video ??
    (product.variantVideos ? Object.values(product.variantVideos)[0] : undefined);

  const allMedia = buildMedia(images, videoSrc);
  // When video errors, drop it from the display list so swiping skips it cleanly
  const media     = videoError ? allMedia.filter((m) => m.type !== "video") : allMedia;
  const videoIdx  = media.findIndex((m) => m.type === "video"); // -1 when no video or error
  const isOnVideo = activeIndex === videoIdx && videoIdx !== -1;

  // Reset everything when variant changes
  useEffect(() => {
    setActiveIndex(0);
    setVideoError(false);
    setVideoReady(false);
  }, [activeVariant]);

  // If video errored while user was on the video slide, step back to slide 0
  useEffect(() => {
    if (videoError && isOnVideo) setActiveIndex(0);
  }, [videoError, isOnVideo]);

  // Eagerly buffer video as soon as the product page loads —
  // it's at position 2, one swipe away, user is very likely to see it
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !videoSrc || videoError) return;
    v.preload = "auto";
    v.load();
  }, [videoSrc, videoError]);

  // Play/pause via ref so the element is never unmounted and never re-fetches
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isOnVideo) {
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [isOnVideo]);

  // Native touch listeners — direction detected here so preventDefault fires in time
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    function onStart(e: TouchEvent) {
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      swipeDir.current = null;
    }
    function onMove(e: TouchEvent) {
      if (swipeDir.current === null) {
        const dx = Math.abs(e.touches[0].clientX - touchStart.current.x);
        const dy = Math.abs(e.touches[0].clientY - touchStart.current.y);
        if (dx > 4 || dy > 4) swipeDir.current = dx >= dy ? "h" : "v";
      }
      if (swipeDir.current === "h") e.preventDefault();
    }
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove",  onMove,  { passive: false });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove",  onMove);
    };
  }, []);

  const goTo = (i: number) =>
    setActiveIndex(Math.max(0, Math.min(i, media.length - 1)));

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = touchStart.current.x - e.changedTouches[0].clientX;
    const dy = Math.abs(touchStart.current.y - e.changedTouches[0].clientY);
    if (swipeDir.current === "h" && Math.abs(dx) > 30 && Math.abs(dx) > dy) {
      dx > 0 ? goTo(activeIndex + 1) : goTo(activeIndex - 1);
    }
    swipeDir.current = null;
  };

  const currentItem = media[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      {/* Main viewer — full-bleed on mobile */}
      <div
        ref={mainRef}
        className="relative aspect-square overflow-hidden bg-[#FDF9F7] select-none -mx-6 md:mx-0"
        onTouchEnd={handleTouchEnd}
      >
        {/* Images — all rendered, opacity controls visibility */}
        {media.map((item, i) =>
          item.type === "image" ? (
            <Image
              key={item.src}
              src={item.src}
              alt={`${product.name}${activeVariant ? ` — ${activeVariant}` : ""}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={`object-contain transition-opacity duration-300 ${
                i === activeIndex ? "opacity-100" : "opacity-0"
              }`}
              priority={i === 0}
            />
          ) : null
        )}

        {/* Video — always rendered, NEVER unmounted so the buffer is preserved.
            Uses HLS for Cloudflare Stream (iOS-native, adaptive chunks) + MP4 fallback.
            Opacity toggles show/hide; playback controlled via ref above. */}
        {videoSrc && !videoError && (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="auto"
            onCanPlayThrough={() => setVideoReady(true)}
            onError={() => { setVideoError(true); setVideoReady(false); }}
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
              isOnVideo ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {getVideoSources(videoSrc).map((s) => (
              <source key={s.src} src={s.src} type={s.type} />
            ))}
          </video>
        )}

        {/* Buffering spinner — shown only while video is loading */}
        {isOnVideo && !videoReady && !videoError && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          </div>
        )}

        {!currentItem && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[#A0622A]/40">
              Image coming soon
            </p>
          </div>
        )}

        {/* Arrows — desktop */}
        {media.length > 1 && (
          <>
            <button
              onClick={() => goTo(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Previous"
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center bg-white/80 text-[#2C2220] text-xl disabled:opacity-0 transition-opacity hover:bg-white z-10"
            >
              ‹
            </button>
            <button
              onClick={() => goTo(activeIndex + 1)}
              disabled={activeIndex === media.length - 1}
              aria-label="Next"
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center bg-white/80 text-[#2C2220] text-xl disabled:opacity-0 transition-opacity hover:bg-white z-10"
            >
              ›
            </button>
          </>
        )}

        {/* Dots — mobile */}
        {media.length > 1 && (
          <div className="md:hidden absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {media.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to item ${i + 1}`}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                  i === activeIndex ? "bg-white scale-125" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {media.map((item, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={item.type === "video" ? "Play video" : `View ${i + 1}`}
              className={`flex-shrink-0 relative w-16 h-16 overflow-hidden transition-all duration-200 ${
                activeIndex === i ? "ring-1 ring-[#A0622A]" : "opacity-50 hover:opacity-80"
              }`}
            >
              {item.type === "image" ? (
                <Image
                  src={item.src}
                  alt={`View ${i + 1}`}
                  fill
                  className="object-contain bg-[#FDF9F7]"
                />
              ) : (
                <div className="absolute inset-0 bg-[#2C2220] flex items-center justify-center">
                  <span className="text-white text-lg leading-none">▶</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
