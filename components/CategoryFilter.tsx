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
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-52 flex-shrink-0 pt-2">
        <p className="text-[0.52rem] tracking-[0.3em] uppercase text-[#8C7B6E] mb-6">Categories</p>
        <nav className="flex flex-col gap-0">
          <Link
            href="/shop"
            className={`py-2.5 text-[0.62rem] tracking-[0.15em] uppercase transition-colors duration-200 border-b border-[#E8B4A8]/20 ${
              isActive("all")
                ? "text-[#2C2220] font-normal"
                : "text-[#8C7B6E] hover:text-[#2C2220]"
            }`}
          >
            {isActive("all") && <span className="mr-2 text-[#A0622A]">—</span>}
            All Pieces
          </Link>
          {activeCategories.map((cat) => (
            <Link
              key={cat}
              href={href(cat)}
              className={`py-2.5 text-[0.62rem] tracking-[0.15em] uppercase transition-colors duration-200 border-b border-[#E8B4A8]/20 ${
                isActive(cat)
                  ? "text-[#2C2220] font-normal"
                  : "text-[#8C7B6E] hover:text-[#2C2220]"
              }`}
            >
              {isActive(cat) && <span className="mr-2 text-[#A0622A]">—</span>}
              {cat}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile horizontal scroll */}
      <div className="lg:hidden overflow-x-auto pb-3 mb-8 -mx-6 px-6">
        <div className="flex gap-2 w-max">
          <Link
            href="/shop"
            className={`whitespace-nowrap text-[0.55rem] tracking-[0.18em] uppercase px-4 py-2 border transition-colors duration-200 ${
              isActive("all")
                ? "border-[#2C2220] text-[#2C2220] bg-transparent"
                : "border-[#E8B4A8]/50 text-[#8C7B6E] hover:border-[#2C2220] hover:text-[#2C2220]"
            }`}
          >
            All
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
    </>
  );
}
