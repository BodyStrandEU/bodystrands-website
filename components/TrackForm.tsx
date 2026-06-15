"use client";
import { useState, FormEvent } from "react";

export default function TrackForm() {
  const [number, setNumber] = useState("");
  const [error, setError]   = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = number.trim();
    if (!trimmed) {
      setError("Please enter a tracking number.");
      return;
    }
    setError("");
    window.open(
      `https://t.17track.net/en#nums=${encodeURIComponent(trimmed)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <input
          type="text"
          value={number}
          onChange={(e) => { setNumber(e.target.value); setError(""); }}
          placeholder="e.g. RR123456789PT"
          aria-label="Tracking number"
          className="w-full border border-[#2C2220]/20 bg-white px-4 py-3.5 text-[0.75rem] tracking-widest text-[#2C2220] placeholder:text-[#8C7B6E]/50 placeholder:tracking-wide focus:outline-none focus:border-[#A0622A] transition-colors font-light"
        />
        {error && (
          <p className="text-[0.65rem] tracking-wide text-red-400">{error}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full border border-[#A0622A] bg-[#A0622A] text-[#FDF9F7] py-3.5 text-[0.65rem] tracking-[0.28em] uppercase font-light hover:bg-[#8A5222] hover:border-[#8A5222] transition-colors"
      >
        Track Parcel
      </button>

      <p className="text-center text-[0.55rem] tracking-[0.12em] uppercase text-[#8C7B6E]/60 pt-1">
        Powered by 17track · Supports CTT, DHL, FedEx, UPS & more
      </p>
    </form>
  );
}
