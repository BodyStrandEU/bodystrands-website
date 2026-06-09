"use client";

import { useState } from "react";

export default function BuyButton({
  productId,
  variant,
}: {
  productId: string;
  variant?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    setLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, variant }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
      alert("Something went wrong. Please try again.");
    }
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="btn-primary-filled w-full text-center py-4 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? "Redirecting to checkout…" : "Buy Now"}
    </button>
  );
}
