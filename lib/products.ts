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

export type Product = {
  id: string;
  name: string;
  price: number;
  currency: string;
  category: Category;
  description: string;
  images: string[];
  variantImages?: Record<string, string[]>;
  video?: string;
  variantVideos?: Record<string, string>;
  featured: boolean;
  variants?: string[];
};

export function isValidCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

export const products: Product[] = [
  {
    id: "back-body-chain-wedding",
    name: "Back Body Chain — Wedding",
    price: 29.99,
    currency: "EUR",
    category: "Back Chains",
    description: "A delicate, dainty back body chain handcrafted for weddings and special occasions. Adjustable fit, tarnish-resistant stainless steel.",
    images: ["/images/products/lifestyle-2.jpg"],
    featured: true,
    variants: ["Gold Tone", "Silver Tone"],
  },
  {
    id: "waist-chain",
    name: "Dainty Waist Chain",
    price: 24.99,
    currency: "EUR",
    category: "Belly Chains",
    description: "Ultra-thin waist chain with adjustable extender. Water-resistant and made to be worn every day.",
    images: ["/images/products/lifestyle-1.jpg"],
    featured: true,
    variants: ["Gold Tone", "Silver Tone"],
  },
  {
    id: "pearl-anklet",
    name: "Pearl Anklet",
    price: 22.99,
    currency: "EUR",
    category: "Anklets",
    description: "Dual-strand pearl and gold chain anklet. 21cm base with 5cm adjustable extender. Handmade in stainless steel.",
    images: ["/images/products/lifestyle-3.jpg"],
    featured: true,
    variants: ["Gold Tone", "Silver Tone"],
  },
  {
    id: "arm-chain",
    name: "Arm Chain Bracelet",
    price: 19.99,
    currency: "EUR",
    category: "Body Chains",
    description: "Minimalist arm chain that wraps gracefully around your upper arm. Adjustable, lightweight and comfortable.",
    images: ["/images/products/lifestyle-4.jpg"],
    featured: false,
    variants: ["Gold Tone", "Silver Tone"],
  },
];
