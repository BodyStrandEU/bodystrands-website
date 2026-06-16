"use client";

import { useState } from "react";

export default function BuyButton({
  productId,
  variant,
  priceAdd,
  disabled: externalDisabled,
  disabledMessage,
  secondary,
}: {
  productId: string;
  variant?: string;
  priceAdd?: number;
  disabled?: boolean;
  disabledMessage?: string;
  secondary?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function handleBuy() {
    setLoading(true);
    setError("");

    if (typeof window !== "undefined") {
      const w = window as Window & { fbq?: (...a: unknown[]) => void; gtag?: (...a: unknown[]) => void };
      w.fbq?.("track", "InitiateCheckout");
      w.gtag?.("event", "begin_checkout");
    }
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, variant, priceAdd: priceAdd ?? 0 }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoading(false);
        setError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setLoading(false);
      setError("Connection error. Please try again.");
    }
  }

  const isDisabled = loading || externalDisabled;

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleBuy}
        disabled={isDisabled}
        title={externalDisabled && disabledMessage ? disabledMessage : undefined}
        className={`w-full text-center py-4 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 ${
          secondary
            ? "btn-primary text-[0.6rem] tracking-[0.22em] uppercase py-3"
            : "btn-primary-filled"
        }`}
      >
        {loading ? "Processing…" : "Buy Now — Skip Cart"}
      </button>
      {error && (
        <p className="text-[0.6rem] tracking-wide text-[#A0622A] text-center">{error}</p>
      )}
    </div>
  );
}
