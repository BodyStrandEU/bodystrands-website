"use client";
import { useState, useEffect } from "react";

const STORAGE_KEY = "bs_popup";

export default function EmailCapturePopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setVisible(true), 9000);
    return () => clearTimeout(timer);
  }, []);

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      localStorage.setItem(STORAGE_KEY, "subscribed");
    } catch {
      setStatus("error");
    }
  }

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(44,34,32,0.55)" }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div className="relative bg-[#FDF9F7] w-full max-w-sm shadow-2xl">

        {/* Close */}
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-4 right-4 text-[#8C7B6E] hover:text-[#2C2220] transition-colors p-1"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>

        {status === "success" ? (
          <div className="px-10 py-14 text-center">
            <div className="w-8 h-px bg-[#A0622A] mx-auto mb-6" />
            <p className="font-heading text-3xl font-light text-[#2C2220] mb-3">Thank you</p>
            <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[#8C7B6E]">
              Check your inbox for a welcome from us
            </p>
          </div>
        ) : (
          <div className="px-8 py-10">
            <p className="text-[0.48rem] tracking-[0.38em] uppercase text-[#A0622A] mb-4">Bodystrands</p>
            <h2 className="font-heading text-[2.1rem] font-light text-[#2C2220] leading-[1.15] mb-3">
              10% off your<br />first order
            </h2>
            <p className="text-[0.65rem] font-light tracking-wide text-[#8C7B6E] leading-relaxed mb-7">
              Subscribe for your welcome discount code, plus new arrivals and behind-the-scenes moments from our studio in Portugal.
            </p>

            <form onSubmit={subscribe} className="flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={status === "loading"}
                className="w-full border border-[#2C2220]/20 bg-white px-4 py-3 text-[0.7rem] tracking-wide text-[#2C2220] placeholder-[#8C7B6E]/50 focus:outline-none focus:border-[#A0622A] transition-colors"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-[#2C2220] text-[#FDF9F7] py-3.5 text-[0.58rem] tracking-[0.28em] uppercase hover:bg-[#A0622A] transition-colors disabled:opacity-60"
              >
                {status === "loading" ? "Subscribing…" : "Subscribe"}
              </button>
              {status === "error" && (
                <p className="text-[0.6rem] tracking-wide text-[#A0622A]">Something went wrong — please try again.</p>
              )}
            </form>

            <button
              onClick={dismiss}
              className="mt-5 w-full text-[0.52rem] tracking-[0.18em] uppercase text-[#8C7B6E]/50 hover:text-[#8C7B6E] transition-colors"
            >
              No thanks
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
