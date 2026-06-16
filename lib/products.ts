import productsData from "@/data/products.json";

export const CATEGORIES = [
  "Belly Chains",
  "Back Chains",
  "Body Chains",
  "Shoulder Chains",
  "Anklets",
  "Bracelets",
  "Necklaces",
  "Hand Chains",
  "Head Chains",
  "Eyeglasses Chains",
  "Bikini Clip Chains",
] as const;

export type Category = (typeof CATEGORIES)[number];

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
  variantImages?: Record<string, string[]>;
  video?: string;
  variantVideos?: Record<string, string>;
  featured: boolean;
  variants?: string[];
  variantGroups?: VariantGroup[];
  active?: boolean;
  infographicImages?: string[];
};

// Images that are infographics across all products — hidden on shop card, shown on product page
export const INFOGRAPHIC_IMAGES = new Set([
  // Shared local infographics
  "/images/products/55110011-2bba-4572-8dcb-5f9d06f99c32.png",  // Free Tailored Fit
  "/images/products/0acc7259-5314-4c79-a09d-8f0f7c724ecf.jpeg", // Shipping Fast & Reliable
  "/images/products/4844a113-f32d-458f-a88c-4edea2ff7c35.jpg",  // Waterproof / Stainless Steel
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

export const products: Product[] = productsData as Product[];

// Derived automatically — used by Navbar, homepage tiles, and shop filter
export const activeCategories = [
  ...new Set(products.map((p) => p.category)),
] as Category[];
