import type { Product } from "./products";

// Real, admin-set sale price — null when the product isn't on sale.
export function getSalePrice(product: Pick<Product, "price" | "salePercent">): number | null {
  if (!product.salePercent || product.salePercent <= 0) return null;
  return Math.round(product.price * (1 - product.salePercent / 100) * 100) / 100;
}
