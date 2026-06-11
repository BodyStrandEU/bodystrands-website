import productsData from "@/data/products.json";

export const CATEGORIES = [
  "Back Chains",
  "Body Chains",
  "Shoulder Chains",
  "Anklets",
  "Eyeglasses Chains",
  "Bracelets",
  "Bikini Clip Chains",
  "Belly Chains",
  "Necklaces",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Spec = { label: string; value: string };

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
  active?: boolean;
};

export function isValidCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

export const products: Product[] = productsData as Product[];

// Derived automatically — used by Navbar, homepage tiles, and shop filter
export const activeCategories = [
  ...new Set(products.map((p) => p.category)),
] as Category[];
