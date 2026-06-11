"use client";
import { useState } from "react";

type Spec = { label: string; value: string };

export default function ProductDetails({
  fullDescription,
  specs,
}: {
  fullDescription?: string;
  specs?: Spec[];
}) {
  const [open, setOpen] = useState(false);

  if (!fullDescription && !specs?.length) return null;

  return (
    <div className="border-t border-[#E8B4A8]/40">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-[0.58rem] tracking-[0.2em] uppercase text-[#8C7B6E] hover:text-[#2C2220] transition-colors duration-200"
      >
        <span>Product Details</span>
        <span className={`transition-transform duration-200 text-[0.5rem] ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="pb-6 flex flex-col gap-5">
          {fullDescription && (
            <p className="text-sm font-light leading-relaxed tracking-wide text-[#8C7B6E] whitespace-pre-line">
              {fullDescription}
            </p>
          )}
          {!!specs?.length && (
            <div className="flex flex-col gap-3">
              {specs.map(({ label, value }) => (
                <div key={label} className="flex gap-4">
                  <span className="text-[0.55rem] tracking-[0.15em] uppercase text-[#2C2220] w-28 flex-shrink-0 pt-px">{label}</span>
                  <span className="text-[0.62rem] font-light leading-relaxed tracking-wide text-[#8C7B6E] flex-1">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
