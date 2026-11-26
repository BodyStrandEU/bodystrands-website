import type { Product } from "./products";
import { effectiveSalePercent } from "./sale";

// Real sale price (the product's own admin sale or the sitewide sale, whichever is bigger)
// — null when the product isn't on sale.
export function getSalePrice(product: Pick<Product, "price" | "salePercent">): number | null {
  const percent = effectiveSalePercent(product);
  if (percent <= 0) return null;
  return Math.round(product.price * (1 - percent / 100) * 100) / 100;
}
