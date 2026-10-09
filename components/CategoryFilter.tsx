"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { activeCategories } from "@/lib/products";

export default function CategoryFilter() {
  const searchParams = useSearchParams();
  const active = searchParams.get("category") || "all";

  const isActive = (cat: string) => cat === active;

  const href = (cat: string) =>
    cat === "all" ? "/shop" : `/shop?category=${encodeURIComponent(cat)}`;

  return (
    <div className="mb-8 md:mb-12 -mx-6 px-6 md:mx-0 md:px-0 overflow-x-auto md:overflow-visible">
      <div className="flex md:flex-wrap gap-2 w-max md:w-auto">
        <Link
          href="/shop"
          className={`whitespace-nowrap text-[0.55rem] tracking-[0.18em] uppercase px-4 py-2 border transition-colors duration-200 ${
            isActive("all")
              ? "border-[#2C2220] text-[#2C2220] bg-transparent"
              : "border-[#E8B4A8]/50 text-[#8C7B6E] hover:border-[#2C2220] hover:text-[#2C2220]"
          }`}
        >
          All Pieces
        </Link>
        {activeCategories.map((cat) => (
          <Link
            key={cat}
            href={href(cat)}
            className={`whitespace-nowrap text-[0.55rem] tracking-[0.18em] uppercase px-4 py-2 border transition-colors duration-200 ${
              isActive(cat)
                ? "border-[#2C2220] text-[#2C2220] bg-transparent"
                : "border-[#E8B4A8]/50 text-[#8C7B6E] hover:border-[#2C2220] hover:text-[#2C2220]"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>
    </div>
  );
}
