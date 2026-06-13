"use client";

import { useState } from "react";

export default function BuyButton({
  productId,
  variant,
  priceAdd,
  disabled: externalDisabled,
  disabledMessage,
}: {
  productId: string;
  variant?: string;
  priceAdd?: number;
  disabled?: boolean;
  disabledMessage?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    setLoading(true);
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
        alert(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setLoading(false);
      alert("Connection error. Please try again.");
    }
  }

  const isDisabled = loading || externalDisabled;

  return (
    <button
      onClick={handleBuy}
      disabled={isDisabled}
      title={externalDisabled && disabledMessage ? disabledMessage : undefined}
      className="btn-primary-filled w-full text-center py-4 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? "Redirecting to checkout…" : externalDisabled && disabledMessage ? disabledMessage : "Buy Now"}
    </button>
  );
}
