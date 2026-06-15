"use client";
import { useRef, useState, useEffect } from "react";

export default function BrandVideo({ src }: { src: string }) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);
  const [ended, setEnded] = useState(false);

  // Play when visible, pause when scrolled away
  useEffect(() => {
    const v = wrapRef.current;
    if (!v) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        const vid = videoRef.current;
        if (!vid) return;
        if (entry.isIntersecting) vid.play().catch(() => {});
        else { vid.pause(); }
      },
      { threshold: 0.25 }
    );
    obs.observe(v);
    return () => obs.disconnect();
  }, []);

  function toggleSound() {
    const v = videoRef.current;
    if (!v) return;
    if (ended) {
      // Replay with sound
      v.muted = false;
      v.loop  = false;
      v.currentTime = 0;
      v.play().catch(() => {});
      setMuted(false);
      setEnded(false);
      return;
    }
    const next = !muted;
    v.muted = next;
    setMuted(next);
    if (!next) {
      // Unmuting — restart so they catch the full video
      v.loop = false;
      v.currentTime = 0;
    } else {
      v.loop = true;
    }
  }

  return (
    <div ref={wrapRef} className="relative aspect-square overflow-hidden bg-[#2C2220]">
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onEnded={() => { setEnded(true); setMuted(true); const v = videoRef.current; if (v) { v.muted = true; v.loop = true; v.play().catch(() => {}); } }}
        className="w-full h-full object-cover"
      />

      {/* Sound toggle */}
      <button
        onClick={toggleSound}
        aria-label={muted ? "Play with sound" : "Mute"}
        className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white rounded-full px-3 py-1.5 transition-all hover:bg-black/70 group"
      >
        {muted ? (
          <>
            <MutedIcon />
            <span className="text-[0.55rem] tracking-[0.15em] uppercase leading-none">Sound</span>
          </>
        ) : (
          <>
            <UnmutedIcon />
            <span className="text-[0.55rem] tracking-[0.15em] uppercase leading-none">Mute</span>
          </>
        )}
      </button>
    </div>
  );
}

function MutedIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

function UnmutedIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}
