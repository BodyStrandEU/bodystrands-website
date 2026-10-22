import type { Metadata } from "next";
import ShopView from "@/components/ShopView";
import { SHOP_META } from "@/lib/shopMeta";

// Pre-built "All Pieces" page. Category views (/shop?category=X) are rewritten by proxy.ts to
// the pre-built /shop/c/[category] route, so neither reads searchParams and both can be cached.
export const metadata: Metadata = {
  ...SHOP_META,
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return <ShopView />;
}
