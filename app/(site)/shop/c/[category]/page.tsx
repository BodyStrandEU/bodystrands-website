import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopView from "@/components/ShopView";
import { CATEGORY_META, SHOP_META } from "@/lib/shopMeta";
import { categorySeo } from "@/lib/seo-overrides";
import { CATEGORIES } from "@/lib/products";

// One pre-built page per category. Shoppers and Google never see this address: proxy.ts
// rewrites /shop?category=X here, and the canonical stays /shop?category=X.
export const dynamicParams = false;

export function generateStaticParams() {
  // Every category, including empty ones ("New pieces coming soon"), as before
  return CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const category = decodeURIComponent((await params).category);
  const meta = CATEGORY_META[category] ?? SHOP_META;
  return {
    ...meta,
    ...categorySeo(category),
    alternates: { canonical: `/shop?category=${encodeURIComponent(category)}` },
  };
}

export default async function ShopCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const category = decodeURIComponent((await params).category);
  if (!(CATEGORIES as readonly string[]).includes(category)) notFound();
  return <ShopView category={category} />;
}
