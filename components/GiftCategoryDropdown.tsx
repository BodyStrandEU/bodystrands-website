"use client";

import { useRouter } from "next/navigation";

export default function GiftCategoryDropdown({
  categories,
  active,
}: {
  categories: string[];
  active: string;
}) {
  const router = useRouter();

  return (
    <select
      value={active}
      onChange={(e) => {
        const value = e.target.value;
        const href = value === "all" ? "/gifts#under-40" : `/gifts?category=${encodeURIComponent(value)}#under-40`;
        router.push(href);
      }}
      className="border border-[#E8B4A8]/50 bg-transparent px-4 py-2.5 text-[0.62rem] tracking-[0.12em] uppercase text-[#2C2220] focus:outline-none focus:border-[#A0622A] transition-colors appearance-none cursor-pointer"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238C7B6E' stroke-width='1.2' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 14px center",
        paddingRight: "36px",
      }}
      aria-label="Jump to a category within Under €40"
    >
      <option value="all">All Categories</option>
      {categories.map((cat) => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
  );
}
