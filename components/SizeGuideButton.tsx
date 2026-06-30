"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "@/components/SmartImage";

function SizeGuideModal({ image, onClose }: { image: string; onClose: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Size guide"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
        <span className="text-white/70 text-[0.6rem] tracking-[0.2em] uppercase">Size Guide</span>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-white/60 hover:text-white transition-colors p-2 -mr-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 relative" onClick={(e) => e.stopPropagation()}>
        <Image src={image} alt="Size guide" fill className="object-contain" sizes="100vw" />
      </div>
    </div>
  );
}

export default function SizeGuideButton({ image }: { image?: string }) {
  const [open, setOpen] = useState(false);
  if (!image) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-[#A0622A] hover:text-[#8A5222] transition-colors duration-200"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="1" />
          <path d="M7 3v4M11 3v2M15 3v4M19 3v2" />
        </svg>
        <span className="text-[0.55rem] tracking-[0.15em] uppercase underline underline-offset-2">Size Guide</span>
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <SizeGuideModal image={image} onClose={() => setOpen(false)} />,
        document.body
      )}
    </>
  );
}
