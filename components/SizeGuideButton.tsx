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
        className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#A0622A] text-[#A0622A] hover:bg-[#A0622A] hover:text-white transition-all duration-200 rounded-sm w-full justify-center"
      >
        {/* Ruler icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
          <path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
        <span className="text-[0.7rem] tracking-[0.2em] uppercase font-medium">Size Guide</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <SizeGuideModal image={image} onClose={() => setOpen(false)} />,
        document.body
      )}
    </>
  );
}
