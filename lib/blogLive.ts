import { products } from "@/lib/products";
import { getSalePrice } from "@/lib/pricing";

// Blog posts are written once, but product names and prices change (renames, sales). When a post
// is shown, every product link gets the product's current name, and a price written right after
// the link — "(€29.60)" or "at €25" in the same sentence — gets the current price (sale price if
// on sale). Budget lines like "Around €30 — …" aren't tied to a product and are left alone.

const byId = new Map(products.map((p) => [p.id, p]));

const euro = (n: number) => `€${Number.isInteger(n) ? n : n.toFixed(2)}`;

// Only swap link text that is the product's proper name ("Dainty Hand Chain"), not phrases like
// "this belly chain" or "our pearl one" that read as part of the sentence.
const looksLikeName = (t: string) => /^[A-Z0-9][^<]*$/.test(t) && t.split(/\s+/).every((w) => /^[A-Z0-9&(]/.test(w));

const LINK_THEN_PRICE = /<a href="\/shop\/([a-z0-9-]+)">([^<]+)<\/a>([^<.!?€]{0,70}?)€(\d+(?:\.\d+)?)/g;
const LINK = /<a href="\/shop\/([a-z0-9-]+)">([^<]+)<\/a>/g;

export function liveBlogHtml(html: string): string {
  const withPrices = html.replace(LINK_THEN_PRICE, (all, id: string, text: string, between: string) => {
    const p = byId.get(id);
    if (!p || p.active === false) return all;
    return `<a href="/shop/${id}">${text}</a>${between}${euro(getSalePrice(p) ?? p.price)}`;
  });
  return withPrices.replace(LINK, (all, id: string, text: string) => {
    const p = byId.get(id);
    if (!p || !looksLikeName(text.trim()) || text.trim() === p.name) return all;
    return `<a href="/shop/${id}">${p.name}</a>`;
  });
}
