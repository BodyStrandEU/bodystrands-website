import { Metadata } from "next";
import SizeGuideTool from "@/components/SizeGuideTool";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Size Guide — Find Your Fit | Bodystrands",
  description: "Not sure what size to get? Enter your measurement and instantly see which Bodystrands necklaces, anklets, bracelets, and body chains fit you.",
  alternates: { canonical: "/size-guide" },
};

export default function SizeGuidePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-3">Bodystrands</p>
      <h1 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220] mb-4">Find Your Fit</h1>
      <p className="text-sm font-light tracking-wide text-[#8C7B6E] leading-relaxed mb-12 max-w-2xl">
        Pick a category, enter your measurement, and we&apos;ll show you exactly which pieces fit —
        no guessing. Every Bodystrands piece is also custom-resizable at no extra cost if nothing
        below matches yet.
      </p>

      <SizeGuideTool products={products} />
    </div>
  );
}
