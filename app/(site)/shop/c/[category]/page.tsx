import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopView from "@/components/ShopView";
import { CATEGORY_META, SHOP_META, categorySlug, categoryFromSlug } from "@/lib/shopMeta";
import { categorySeo } from "@/lib/seo-overrides";
import { CATEGORIES } from "@/lib/products";

// One pre-built page per category, at a space-free slug (/shop/c/back-chains). Shoppers and
// Google never see this address: next.config.ts rewrites /shop?category=Back Chains here, and
// the canonical stays /shop?category=Back%20Chains.
export const dynamicParams = false;

export function generateStaticParams() {
  // Every category, including empty ones ("New pieces coming soon"), as before
  return CATEGORIES.map((category) => ({ category: categorySlug(category) }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const category = categoryFromSlug((await params).category);
  if (!category) return SHOP_META;
  return {
    ...(CATEGORY_META[category] ?? SHOP_META),
    ...categorySeo(category),
    alternates: { canonical: `/shop?category=${encodeURIComponent(category)}` },
  };
}

export default async function ShopCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const category = categoryFromSlug((await params).category);
  if (!category) notFound();
  return <ShopView category={category} />;
}
