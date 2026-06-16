"use client";
import { useState, FormEvent } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function NewsletterBanner() {
  const [email,  setEmail]  = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrMsg("");

    try {
      const res  = await fetch("/api/newsletter", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrMsg(data.error ?? "Something went wrong.");
        setStatus("error");
      } else {
        setStatus("success");
        setEmail("");
      }
    } catch {
      setErrMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <section className="bg-[#E8B4A8]/20 border-t border-b border-[#E8B4A8]/40 py-16 px-6">
      <div className="max-w-xl mx-auto text-center">

        <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-3">
          Join the Community
        </p>
        <h2 className="font-heading text-3xl md:text-4xl font-light text-[#2C2220] mb-4">
          Stay in the Loop
        </h2>
        <p className="text-[0.75rem] font-light tracking-wide text-[#8C7B6E] leading-relaxed mb-8 max-w-sm mx-auto">
          New arrivals, restocks, and behind-the-scenes moments from our studio in Portugal — straight to your inbox.
        </p>

        {status === "success" ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-px bg-[#A0622A] mx-auto" />
            <p className="text-sm font-light tracking-wide text-[#2C2220]">
              You&apos;re in. Welcome to Bodystrands.
            </p>
            <p className="text-[0.65rem] tracking-wide text-[#8C7B6E]">
              Check your inbox for a welcome note from us.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrMsg(""); }}
              placeholder="your@email.com"
              required
              disabled={status === "loading"}
              aria-label="Email address"
              className="flex-1 px-4 py-3 text-[0.7rem] tracking-wide font-light border border-[#2C2220]/20 bg-white text-[#2C2220] placeholder-[#8C7B6E]/60 outline-none focus:border-[#A0622A] transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-6 py-3 bg-[#2C2220] text-[#FDF9F7] text-[0.6rem] tracking-[0.25em] uppercase font-light hover:bg-[#A0622A] transition-colors disabled:opacity-60 whitespace-nowrap"
            >
              {status === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="mt-3 text-[0.65rem] tracking-wide text-[#A0622A]">{errMsg}</p>
        )}

        <p className="mt-5 text-[0.55rem] tracking-[0.15em] uppercase text-[#8C7B6E]/60">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
