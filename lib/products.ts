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
  "/images/products/55110011-2bba-4572-8dcb-5f9d06f99c32.png",  // Free Tailored Fit
  "/images/products/0acc7259-5314-4c79-a09d-8f0f7c724ecf.jpeg", // Shipping Fast & Reliable
  "/images/products/4844a113-f32d-458f-a88c-4edea2ff7c35.jpg",  // Waterproof / Stainless Steel
]);

export function isValidCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

export const products: Product[] = productsData as Product[];

// Derived automatically — used by Navbar, homepage tiles, and shop filter
export const activeCategories = [
  ...new Set(products.map((p) => p.category)),
] as Category[];
