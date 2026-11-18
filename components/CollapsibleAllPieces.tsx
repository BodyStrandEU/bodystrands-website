"use client";
import { useState, type ReactNode } from "react";

// The full catalogue under the category tiles is hidden until the shopper asks for it, but it
// stays in the page's HTML so Google still sees every product. Product photos are lazy-loaded,
// so hidden cards download none of their images and the shop opens fast.
export default function CollapsibleAllPieces({ count, children }: { count: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 md:px-10 mb-8">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="w-full border border-[#2C2220] py-4 text-[0.6rem] tracking-[0.25em] uppercase text-[#2C2220] hover:bg-[#2C2220] hover:text-white transition-colors duration-200"
        >
          {open ? "Hide all pieces ↑" : `Browse all ${count} pieces ↓`}
        </button>
      </div>
      <div hidden={!open}>{children}</div>
    </div>
  );
}
