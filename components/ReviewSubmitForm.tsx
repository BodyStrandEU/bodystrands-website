"use client";
import { useState, FormEvent } from "react";

function StarPicker({ rating, onChange }: { rating: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          aria-label={`${i} star${i !== 1 ? "s" : ""}`}
          className="p-0.5"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill={i <= rating ? "#A0622A" : "none"} stroke={i <= rating ? "#A0622A" : "#D4B8A8"} strokeWidth="1.5">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

const inputClass = "w-full border border-[#2C2220]/20 bg-white px-4 py-3 text-[0.75rem] tracking-wide text-[#2C2220] placeholder:text-[#8C7B6E]/50 focus:outline-none focus:border-[#A0622A] transition-colors font-light";

export default function ReviewSubmitForm({ token }: { token: string }) {
  const [name, setName]         = useState("");
  const [rating, setRating]     = useState(0);
  const [headline, setHeadline] = useState("");
  const [text, setText]         = useState("");
  const [photo, setPhoto]       = useState<File | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [done, setDone]         = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !headline.trim() || !text.trim() || rating === 0) {
      setError("Please fill in your name, a star rating, headline, and review.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("token", token);
      formData.set("name", name.trim());
      formData.set("rating", String(rating));
      formData.set("headline", headline.trim());
      formData.set("text", text.trim());
      if (photo) formData.set("photo", photo);

      const res = await fetch("/api/reviews/submit", { method: "POST", body: formData });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <p className="text-[0.7rem] tracking-[0.15em] uppercase text-[#A0622A] mb-2">Thank you ✓</p>
        <p className="text-[0.75rem] font-light tracking-wide text-[#8C7B6E] leading-relaxed">
          Your review has been submitted and will appear on the site once we&apos;ve had a look.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2">
        <label className="text-[0.55rem] tracking-[0.2em] uppercase text-[#8C7B6E]">Your Rating</label>
        <StarPicker rating={rating} onChange={setRating} />
      </div>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name (e.g. Sofia A.)"
        aria-label="Your name"
        className={inputClass}
      />

      <input
        type="text"
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
        placeholder="Sum it up in a few words"
        aria-label="Review headline"
        className={inputClass}
      />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What did you think?"
        aria-label="Review text"
        rows={4}
        className={`${inputClass} resize-none`}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-[0.55rem] tracking-[0.2em] uppercase text-[#8C7B6E]">
          Photo <span className="text-[#8C7B6E]/60 normal-case tracking-normal">(optional)</span>
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          className="text-[0.7rem] text-[#8C7B6E] file:mr-3 file:py-2 file:px-4 file:border file:border-[#2C2220]/20 file:bg-white file:text-[0.6rem] file:tracking-[0.15em] file:uppercase file:cursor-pointer"
        />
      </div>

      {error && <p className="text-[0.65rem] tracking-wide text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full border border-[#A0622A] bg-[#A0622A] text-[#FDF9F7] py-3.5 text-[0.65rem] tracking-[0.28em] uppercase font-light hover:bg-[#8A5222] hover:border-[#8A5222] transition-colors disabled:opacity-50"
      >
        {loading ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}
