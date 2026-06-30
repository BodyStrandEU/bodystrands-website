"use client";
import { useWishlist } from "@/lib/wishlist";

export default function WishlistButton({
  productId,
  variant = "card",
}: {
  productId: string;
  variant?: "card" | "page";
}) {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(productId);

  if (variant === "page") {
    return (
      <button
        onClick={() => toggle(productId)}
        aria-label={saved ? "Remove from saved" : "Save this piece"}
        aria-pressed={saved}
        className={`flex items-center gap-1.5 transition-colors duration-200 ${
          saved ? "text-[#A0622A]" : "text-[#8C7B6E]/60 hover:text-[#A0622A]"
        }`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
        <span className="text-[0.48rem] tracking-[0.18em] uppercase">
          {saved ? "Saved" : "Save"}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        toggle(productId);
      }}
      aria-label={saved ? "Remove from saved" : "Save this piece"}
      aria-pressed={saved}
      className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-transform duration-150 active:scale-90"
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill={saved ? "#A0622A" : "none"}
        stroke={saved ? "#A0622A" : "#2C2220"}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
    </button>
  );
}
