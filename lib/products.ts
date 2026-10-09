import productsData from "@/data/products.json";
import categoryOrderData from "@/data/category-order.json";

export const CATEGORIES = [
  "Anklets",
  "Back Chains",
  "Belly Chains",
  "Bikini Clip Chains",
  "Body Chains",
  "Bracelets",
  "Eyeglasses Chains",
  "Foot Chains",
  "Hand Chains",
  "Head Chains",
  "Leg Chains",
  "Necklaces",
  "Rings",
  "Shoulder Chains",
] as const;

export type Category = (typeof CATEGORIES)[number];

// Occasion/recipient tags for the /gifts mega-menu — assigned by human judgment
// (via the admin panel or the listing process), never inferred automatically.
// See KEYWORD_TAG_HINTS below for the assisted-suggestion half of that process.
export const GIFT_TAGS = ["personalized", "confirmation", "bridal"] as const;
export type GiftTag = (typeof GIFT_TAGS)[number];

export type Spec = { label: string; value: string };
export type VariantGroup = {
  label: string;
  type?: "options" | "text";           // default "options"
  options?: string[];                   // for "options" type
  optionPrices?: Record<string, number>; // optional price add per option
  placeholder?: string;                 // for "text" type
};

export type Product = {
  id: string;
  name: string;
  price: number;
  currency: string;
  category: Category;
  description: string;
  fullDescription?: string;
  specs?: Spec[];
  images: string[];
  gallery?: string[];
  variantImages?: Record<string, string[]>;
  variantHeroes?: Record<string, string>;
  video?: string;
  variantVideos?: Record<string, string>;
  featured: boolean;
  variants?: string[];
  variantGroups?: VariantGroup[];
  active?: boolean;
  altText?: string;
  infographicImages?: string[];
  sizeGuideImage?: string;
  dateAdded?: string; // ISO 8601 — when the product was first introduced; drives homepage "New Pieces" sort
  giftTags?: GiftTag[]; // occasion/recipient tags for the /gifts mega-menu — see GIFT_TAGS above
  audience?: "men" | "women" | "unisex"; // who the piece is marketed toward — data-only for now, no UI yet (Phase 1 of the men's line rollout). Omitted = women's (the default, existing catalog).
  plusSize?: boolean; // surfaces the product on the /plus-size collection page, in addition to its normal category — same pattern as giftTags, never removes it from regular category browsing
  christmas?: boolean; // surfaces the product on the /christmas collection page, in addition to its normal category — same pattern as plusSize
};

// Images that are infographics across all products — hidden on shop card, shown on product page
export const INFOGRAPHIC_IMAGES = new Set([
  // Shared local infographics
  "/images/products/55110011-2bba-4572-8dcb-5f9d06f99c32.webp",  // Free Tailored Fit
  "/images/products/0acc7259-5314-4c79-a09d-8f0f7c724ecf.webp", // Shipping Fast & Reliable
  "/images/products/4844a113-f32d-458f-a88c-4edea2ff7c35.webp",  // Waterproof / Stainless Steel
  "/images/products/2394f642-d0d8-4e4e-af9a-96e01db744ae.webp",  // Pink Cross Choker — Sizing infographic
  // Belly Chain Sizing Guide (one Etsy URL per product, same image)
  "https://i.etsystatic.com/55122258/r/il/a37305/8138540167/il_fullxfull.8138540167_cp1u.jpg",
  "https://i.etsystatic.com/55122258/r/il/15d2b6/8138543253/il_fullxfull.8138543253_p77g.jpg",
  "https://i.etsystatic.com/55122258/r/il/1aad66/8138545889/il_fullxfull.8138545889_li6b.jpg",
  "https://i.etsystatic.com/55122258/r/il/36e8b2/8138539081/il_fullxfull.8138539081_gral.jpg",
  "https://i.etsystatic.com/55122258/r/il/90c06c/8138546519/il_fullxfull.8138546519_j89t.jpg",
  "https://i.etsystatic.com/55122258/r/il/b78f3a/8138541925/il_fullxfull.8138541925_g6th.jpg",
  "https://i.etsystatic.com/55122258/r/il/d372c8/8138549735/il_fullxfull.8138549735_a729.jpg",
  "https://i.etsystatic.com/55122258/r/il/de39c3/8138549029/il_fullxfull.8138549029_6q5v.jpg",
  "https://i.etsystatic.com/55122258/r/il/ff2c3d/8138547075/il_fullxfull.8138547075_5799.jpg",
]);

export function isValidCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

// Keyword hints for the admin panel to PRE-CHECK likely gift tags on a new product —
// a starting suggestion, never applied automatically or trusted on its own. Keywords
// like "cross" or "wedding" have real false positives (e.g. Cross Belly Chain is not a
// confirmation gift), so every suggestion still requires a human to actually confirm it.
const GIFT_TAG_KEYWORDS: Record<GiftTag, string[]> = {
  personalized: ["birthstone", "zodiac", "monogram", "initial", "birth flower", "gemstone", "personalized"],
  confirmation: ["pink cross", "faith"],
  bridal: ["bridal", "wedding"],
};

export function suggestGiftTags(name: string): GiftTag[] {
  const lower = name.toLowerCase();
  return GIFT_TAGS.filter((tag) => GIFT_TAG_KEYWORDS[tag].some((kw) => lower.includes(kw)));
}

export const products: Product[] = productsData as Product[];

// Admin-editable display order for categories (drag-and-drop at
// /admin/category-order) — falls back to CATEGORIES' own order for any
// category missing from the file (e.g. a brand-new one not yet dragged in).
export const CATEGORY_ORDER: Category[] = [
  ...(categoryOrderData as string[]),
  ...CATEGORIES.filter((c) => !(categoryOrderData as string[]).includes(c)),
] as Category[];

const CATEGORY_RANK = new Map(CATEGORY_ORDER.map((c, i) => [c, i]));
export function byCategoryOrder(a: Category, b: Category): number {
  return (CATEGORY_RANK.get(a) ?? 0) - (CATEGORY_RANK.get(b) ?? 0);
}

// Derived automatically — used by Navbar, homepage tiles, and shop filter.
// Only counts products that are actually visible (active !== false), so a
// category with zero active products (e.g. Bikini Clip Chains, Oct 2026)
// disappears from nav/filters on its own instead of lingering as a dead link.
export const activeCategories = [
  ...new Set(products.filter((p) => p.active !== false).map((p) => p.category)),
].sort(byCategoryOrder) as Category[];
