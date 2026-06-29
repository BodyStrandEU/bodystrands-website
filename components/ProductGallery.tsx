"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "@/components/SmartImage";
import type { Product } from "@/lib/products";
import { getVideoSources } from "@/lib/videoUtils";

type MediaItem = { type: "image"; src: string } | { type: "video"; src: string };

function buildMedia(images: string[], videoSrc?: string): MediaItem[] {
  const items: MediaItem[] = images.map((src) => ({ type: "image" as const, src }));
  if (videoSrc) items.splice(1, 0, { type: "video" as const, src: videoSrc });
  return items;
}

// ── Full-screen lightbox with pinch-to-zoom ───────────────────────────────────
function GalleryLightbox({
  media,
  startIndex,
  product,
  onClose,
}: {
  media: MediaItem[];
  startIndex: number;
  product: Product;
  onClose: () => void;
}) {
  const [index, setIndex]         = useState(startIndex);
  const [scale, setScale]         = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Refs so touch handlers always read current values without stale closures
  const scaleRef = useRef(1);
  const txRef    = useRef(0);
  const tyRef    = useRef(0);
  const indexRef = useRef(startIndex);
  useEffect(() => { scaleRef.current = scale; },                              [scale]);
  useEffect(() => { txRef.current = translate.x; tyRef.current = translate.y; }, [translate]);
  useEffect(() => { indexRef.current = index; },                              [index]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowRight") nav(indexRef.current + 1);
      if (e.key === "ArrowLeft")  nav(indexRef.current - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]); // eslint-disable-line

  function resetZoom() {
    scaleRef.current = 1; txRef.current = 0; tyRef.current = 0;
    setScale(1); setTranslate({ x: 0, y: 0 });
  }

  function nav(i: number) {
    const next = Math.max(0, Math.min(i, media.length - 1));
    if (next === indexRef.current) return;
    indexRef.current = next;
    setIndex(next);
    resetZoom();
  }

  // Pinch-to-zoom + pan + swipe-between-images
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const g    = { mode: "none" as "none" | "pinch" | "pan" | "swipe" };
    const pch  = { dist: 0, startScale: 1 };
    const pan  = { sx: 0, sy: 0, stx: 0, sty: 0 };
    const sw   = { x: 0, t: 0 };

    function pinchDist(touches: TouchList) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function onStart(e: TouchEvent) {
      if (e.touches.length === 2) {
        g.mode = "pinch";
        pch.dist = pinchDist(e.touches);
        pch.startScale = scaleRef.current;
      } else {
        if (scaleRef.current > 1.05) {
          g.mode = "pan";
          pan.sx = e.touches[0].clientX; pan.sy = e.touches[0].clientY;
          pan.stx = txRef.current;       pan.sty = tyRef.current;
        } else {
          g.mode = "swipe";
          sw.x = e.touches[0].clientX; sw.t = Date.now();
        }
      }
    }

    function onMove(e: TouchEvent) {
      e.preventDefault();
      if (g.mode === "pinch" && e.touches.length === 2) {
        const d = pinchDist(e.touches);
        const s = Math.min(4, Math.max(1, pch.startScale * (d / pch.dist)));
        scaleRef.current = s;
        setScale(s);
      } else if (g.mode === "pan" && e.touches.length >= 1) {
        const nx = pan.stx + (e.touches[0].clientX - pan.sx);
        const ny = pan.sty + (e.touches[0].clientY - pan.sy);
        txRef.current = nx; tyRef.current = ny;
        setTranslate({ x: nx, y: ny });
      }
    }

    function onEnd(e: TouchEvent) {
      if (g.mode === "swipe" && e.changedTouches.length >= 1) {
        const dx = e.changedTouches[0].clientX - sw.x;
        const dt = Date.now() - sw.t;
        if (Math.abs(dx) > 40 && dt < 400) {
          const next = dx < 0
            ? Math.min(indexRef.current + 1, media.length - 1)
            : Math.max(indexRef.current - 1, 0);
          if (next !== indexRef.current) {
            indexRef.current = next; setIndex(next); resetZoom();
          }
        }
      } else if (g.mode === "pinch" && scaleRef.current < 1.05) {
        resetZoom();
      }
      if (e.touches.length === 0) g.mode = "none";
    }

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove",  onMove,  { passive: false });
    el.addEventListener("touchend",   onEnd,   { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove",  onMove);
      el.removeEventListener("touchend",   onEnd);
    };
  }, []); // empty deps — all state read via refs

  const currentItem = media[index];
  const isImg = currentItem?.type === "image";

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
        <span className="text-white/45 text-[0.55rem] tracking-[0.15em] font-light select-none">
          {index + 1} / {media.length}
        </span>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-white/60 hover:text-white transition-colors p-2 -mr-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main area */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        style={{ touchAction: "none" }}
      >
        {isImg && (
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
              transformOrigin: "center center",
              willChange: "transform",
            }}
          >
            <Image
              src={currentItem.src}
              alt={product.altText || product.name}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        )}

        {!isImg && currentItem?.type === "video" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <video autoPlay muted loop playsInline className="max-w-full max-h-full object-contain">
              {getVideoSources(currentItem.src).map((s) => (
                <source key={s.src} src={s.src} type={s.type} />
              ))}
            </video>
          </div>
        )}

        {/* Desktop arrows */}
        {media.length > 1 && (
          <>
            <button
              onClick={() => nav(index - 1)}
              disabled={index === 0}
              aria-label="Previous"
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center bg-white/10 hover:bg-white/20 text-white text-2xl disabled:opacity-0 transition-all z-10"
            >‹</button>
            <button
              onClick={() => nav(index + 1)}
              disabled={index === media.length - 1}
              aria-label="Next"
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center bg-white/10 hover:bg-white/20 text-white text-2xl disabled:opacity-0 transition-all z-10"
            >›</button>
          </>
        )}

        {/* Pinch-to-zoom hint — mobile only */}
        {isImg && scale <= 1.05 && (
          <p className="md:hidden absolute bottom-4 left-0 right-0 text-center text-white/30 text-[0.42rem] tracking-[0.22em] uppercase pointer-events-none select-none">
            Pinch to zoom
          </p>
        )}
      </div>

      {/* Thumbnail strip */}
      {media.length > 1 && (
        <div className="flex-shrink-0 py-3 px-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide justify-center">
            {media.map((item, i) => (
              <button
                key={i}
                onClick={() => nav(i)}
                aria-label={`View ${i + 1}`}
                className={`flex-shrink-0 w-11 h-11 relative overflow-hidden transition-all duration-200 ${
                  i === index ? "ring-1 ring-white opacity-100" : "opacity-40 hover:opacity-65"
                }`}
              >
                {item.type === "image" ? (
                  <Image src={item.src} alt="" fill className="object-contain bg-neutral-900" sizes="44px" />
                ) : (
                  <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
                    <span className="text-white text-sm leading-none">▶</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main gallery ──────────────────────────────────────────────────────────────
export default function ProductGallery({
  product,
  activeVariant,
}: {
  product: Product;
  activeVariant: string;
}) {
  const [activeIndex, setActiveIndex]   = useState(0);
  const [videoError, setVideoError]     = useState(false);
  const [videoReady, setVideoReady]     = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const mainRef    = useRef<HTMLDivElement>(null);
  const videoRef   = useRef<HTMLVideoElement>(null);
  const touchStart = useRef({ x: 0, y: 0, time: 0 });
  const swipeDir   = useRef<"h" | "v" | null>(null);

  const images = product.gallery ?? product.variantImages?.[activeVariant] ?? product.images ?? [];
  const videoSrc =
    product.variantVideos?.[activeVariant] ??
    product.video ??
    (product.variantVideos ? Object.values(product.variantVideos)[0] : undefined);

  const allMedia  = buildMedia(images, videoSrc);
  const media     = videoError ? allMedia.filter((m) => m.type !== "video") : allMedia;
  const videoIdx  = media.findIndex((m) => m.type === "video");
  const isOnVideo = activeIndex === videoIdx && videoIdx !== -1;

  // Reset when variant changes
  useEffect(() => {
    if (product.gallery && product.variantHeroes?.[activeVariant]) {
      const heroUrl    = product.variantHeroes[activeVariant];
      const vid        = product.variantVideos?.[activeVariant] ?? product.video
        ?? (product.variantVideos ? Object.values(product.variantVideos)[0] : undefined);
      const mediaItems = buildMedia(product.gallery, vid);
      const idx        = mediaItems.findIndex((m) => m.type === "image" && m.src === heroUrl);
      setActiveIndex(idx !== -1 ? idx : 0);
    } else {
      setActiveIndex(0);
    }
    setVideoError(false);
    setVideoReady(false);
  }, [activeVariant, product.gallery, product.variantHeroes, product.video, product.variantVideos]);

  useEffect(() => {
    if (videoError && isOnVideo) setActiveIndex(0);
  }, [videoError, isOnVideo]);

  // Eagerly buffer video
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !videoSrc || videoError) return;
    v.preload = "auto";
    v.load();
  }, [videoSrc, videoError]);

  // Play/pause via ref
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isOnVideo) { v.currentTime = 0; v.play().catch(() => {}); }
    else           { v.pause(); }
  }, [isOnVideo]);

  // Native touch — direction detected here so preventDefault fires in time
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;

    function onStart(e: TouchEvent) {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
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
    const dt = Date.now() - touchStart.current.time;

    if (swipeDir.current === "h" && Math.abs(dx) > 30 && Math.abs(dx) > dy) {
      dx > 0 ? goTo(activeIndex + 1) : goTo(activeIndex - 1);
    } else if (Math.abs(dx) < 8 && dy < 8 && dt < 300 && media[activeIndex]?.type === "image") {
      setLightboxOpen(true);
    }
    swipeDir.current = null;
  };

  function handleImageClick() {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: fine)").matches &&
      media[activeIndex]?.type === "image"
    ) {
      setLightboxOpen(true);
    }
  }

  const currentItem = media[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      {/* Main viewer */}
      <div
        ref={mainRef}
        className="group relative aspect-square overflow-hidden bg-[#FDF9F7] select-none -mx-6 md:mx-0 md:cursor-zoom-in"
        onTouchEnd={handleTouchEnd}
        onClick={handleImageClick}
      >
        {/* Images */}
        {media.map((item, i) =>
          item.type === "image" ? (
            <Image
              key={item.src}
              src={item.src}
              alt={product.altText || `${product.name}${activeVariant ? ` — ${activeVariant}` : ""}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={`object-contain transition-opacity duration-300 ${
                i === activeIndex ? "opacity-100" : "opacity-0"
              }`}
              priority={i === 0}
            />
          ) : null
        )}

        {/* Video — never unmounted so buffer is preserved */}
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

        {/* Buffering spinner */}
        {isOnVideo && !videoReady && !videoError && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          </div>
        )}

        {!currentItem && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[#A0622A]/40">Image coming soon</p>
          </div>
        )}

        {/* Image counter badge */}
        {media.length > 1 && (
          <div className="absolute top-3 right-3 z-10 pointer-events-none">
            <span className="bg-black/35 text-white text-[0.5rem] tracking-[0.05em] px-2 py-1 font-light">
              {activeIndex + 1} / {media.length}
            </span>
          </div>
        )}

        {/* Desktop "Click to zoom" hint */}
        {currentItem?.type === "image" && (
          <div className="hidden md:flex absolute bottom-3 left-3 items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
              <path d="M11 8v6M8 11h6"/>
            </svg>
            <span className="text-white/55 text-[0.42rem] tracking-[0.18em] uppercase">Click to zoom</span>
          </div>
        )}

        {/* Desktop arrows */}
        {media.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goTo(activeIndex - 1); }}
              disabled={activeIndex === 0}
              aria-label="Previous"
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center bg-white/80 text-[#2C2220] text-xl disabled:opacity-0 transition-opacity hover:bg-white z-10"
            >‹</button>
            <button
              onClick={(e) => { e.stopPropagation(); goTo(activeIndex + 1); }}
              disabled={activeIndex === media.length - 1}
              aria-label="Next"
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center bg-white/80 text-[#2C2220] text-xl disabled:opacity-0 transition-opacity hover:bg-white z-10"
            >›</button>
          </>
        )}

        {/* Dots — mobile */}
        {media.length > 1 && (
          <div className="md:hidden absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {media.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); goTo(i); }}
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

      {/* Lightbox portal */}
      {lightboxOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <GalleryLightbox
            media={media}
            startIndex={activeIndex}
            product={product}
            onClose={() => setLightboxOpen(false)}
          />,
          document.body
        )}
    </div>
  );
}
