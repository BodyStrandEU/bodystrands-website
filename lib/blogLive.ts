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

// ── Contextual category links ────────────────────────────────────────────────────────────
// The first plain-text mention of a category phrase in a post links to that category page
// (once per category per post). Internal links with the words people search ("back necklace",
// "backless dress", "arm chain") tell Google which page answers them — Search Console had the
// Back Chains page at positions 10–13 for those searches (Oct 2026).
const CATEGORY_PHRASES: [RegExp, string][] = [
  [/\b(back necklaces?|back chains?|backdrop necklaces?|back jewelry|backless dress(?:es)?)\b/i, "Back Chains"],
  [/\b(shoulder chains?|arm chains?|arm necklaces?)\b/i, "Shoulder Chains"],
  [/\b(belly chains?|waist chains?)\b/i, "Belly Chains"],
  [/\b(body chains?|body harness(?:es)?)\b/i, "Body Chains"],
  [/\b(head chains?|forehead chains?|hair chains?)\b/i, "Head Chains"],
  [/\b(hand chains?|finger chains?)\b/i, "Hand Chains"],
  [/\b(thigh chains?|leg chains?)\b/i, "Leg Chains"],
  [/\b(barefoot sandals?|foot chains?|toe chains?)\b/i, "Foot Chains"],
  [/\b(anklets?)\b/i, "Anklets"],
  [/\b(glasses chains?|eyeglasses chains?|sunglasses chains?)\b/i, "Eyeglasses Chains"],
];

/** One per post: links each category at most once, skipping text already inside a link. */
export function createCategoryLinker() {
  const done = new Set<string>();
  return (html: string): string =>
    // split into [text, <a…>…</a>, text, …] so existing links are never touched
    html.split(/(<a\b[^>]*>[\s\S]*?<\/a>)/i).map((part) => {
      if (/^<a\b/i.test(part)) return part;
      for (const [re, category] of CATEGORY_PHRASES) {
        if (done.has(category)) continue;
        const m = part.match(re);
        if (!m || m.index === undefined) continue;
        done.add(category);
        const href = `/shop?category=${encodeURIComponent(category)}`;
        part = part.slice(0, m.index) + `<a href="${href}">${m[0]}</a>` + part.slice(m.index + m[0].length);
      }
      return part;
    }).join("");
}
