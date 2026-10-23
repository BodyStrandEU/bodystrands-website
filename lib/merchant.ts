import type { Product } from "@/lib/products";

// One source for the IDs Google Merchant Center sees, used by both the merchant feed and the
// product pages' structured data. When they differ, Google counts the page's product as
// "not in Merchant Center" and adds a duplicate from the crawl (Oct 2026 email: 94 products).
export const feedVariantId = (product: Product, variant: string | null) =>
  variant ? `${product.id}-${variant.toLowerCase().replace(/\s+/g, "-")}` : product.id;
