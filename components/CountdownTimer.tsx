"use client";
import { useState, useEffect } from "react";

const WINDOW_MS   = 12 * 60 * 60 * 1000; // 12 hours
const STORAGE_KEY = "bs_sale_start";

function getRemaining(): number {
  if (typeof window === "undefined") return WINDOW_MS;
  const stored = localStorage.getItem(STORAGE_KEY);
  const start  = stored ? parseInt(stored, 10) : Date.now();
  if (!stored) localStorage.setItem(STORAGE_KEY, String(start));
  const elapsed   = Date.now() - start;
  const remaining = WINDOW_MS - (elapsed % WINDOW_MS);
  // If a full window has passed, reset the stored start
  if (elapsed >= WINDOW_MS) {
    const newStart = Date.now() - (elapsed % WINDOW_MS);
    localStorage.setItem(STORAGE_KEY, String(newStart));
  }
  return remaining;
}

function fmt(ms: number) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return {
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
  };
}

export default function CountdownTimer() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    setRemaining(getRemaining());
    const id = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(id);
  }, []);

  if (remaining === null) return null;

  const { h, m, s } = fmt(remaining);

  return (
    <div className="flex items-center gap-2.5">
      <div className="w-1 h-1 rounded-full bg-[#A0622A] animate-pulse" />
      <p className="text-[0.55rem] tracking-[0.18em] uppercase text-[#8C7B6E]">
        Sale ends in
      </p>
      <div className="flex items-center gap-1 font-light text-[0.7rem] tracking-widest text-[#2C2220]">
        <span>{h}</span>
        <span className="text-[#A0622A]/60 pb-px">:</span>
        <span>{m}</span>
        <span className="text-[#A0622A]/60 pb-px">:</span>
        <span>{s}</span>
      </div>
    </div>
  );
}
