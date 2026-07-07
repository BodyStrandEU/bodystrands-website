"use client";
import { useState, FormEvent } from "react";
import { CARRIERS, buildTrackingUrl, type CarrierId } from "@/lib/tracking";

// Most orders currently ship via DHL Germany, so default to it instead of
// letting 17track's auto-detect guess (it's guessed wrong before).
const DEFAULT_CARRIER: CarrierId = "dhl-de";

export default function TrackForm() {
  const [number, setNumber]   = useState("");
  const [carrier, setCarrier] = useState<string>(DEFAULT_CARRIER);
  const [error, setError]     = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = number.trim();
    if (!trimmed) {
      setError("Please enter a tracking number.");
      return;
    }
    setError("");
    window.open(buildTrackingUrl(carrier, trimmed), "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <input
          type="text"
          value={number}
          onChange={(e) => { setNumber(e.target.value); setError(""); }}
          placeholder="e.g. LF123456789DE"
          aria-label="Tracking number"
          className="w-full border border-[#2C2220]/20 bg-white px-4 py-3.5 text-[0.75rem] tracking-widest text-[#2C2220] placeholder:text-[#8C7B6E]/50 placeholder:tracking-wide focus:outline-none focus:border-[#A0622A] transition-colors font-light"
        />
        {error && (
          <p className="text-[0.65rem] tracking-wide text-red-400">{error}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[0.55rem] tracking-[0.2em] uppercase text-[#8C7B6E]">Carrier</label>
        <select
          value={carrier}
          onChange={(e) => setCarrier(e.target.value)}
          aria-label="Carrier"
          className="w-full border border-[#2C2220]/20 bg-white px-4 py-3 text-[0.7rem] tracking-wide text-[#2C2220] focus:outline-none focus:border-[#A0622A] transition-colors font-light"
        >
          {CARRIERS.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="w-full border border-[#A0622A] bg-[#A0622A] text-[#FDF9F7] py-3.5 text-[0.65rem] tracking-[0.28em] uppercase font-light hover:bg-[#8A5222] hover:border-[#8A5222] transition-colors"
      >
        Track Parcel
      </button>

      <p className="text-center text-[0.55rem] tracking-[0.12em] uppercase text-[#8C7B6E]/60 pt-1">
        Not the right carrier? Switch to Auto-detect above and try again.
      </p>
    </form>
  );
}
