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
  description: string;           // short teaser shown on product page
  fullDescription?: string;      // longer copy shown in collapsible details
  specs?: Spec[];                // dimensions, material, care, shipping — collapsible
  images: string[];              // card thumbnail (index 0) + fallback gallery
  variantImages?: Record<string, string[]>; // gallery per variant: sub hero first, then variant photos, then apply-to-both
  video?: string;
  variantVideos?: Record<string, string>;
  featured: boolean;
  variants?: string[];
};

export function isValidCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

export const products: Product[] = [
  // ── SHOULDER CHAINS ──────────────────────────────────────────────────────────
  {
    id: "goddess-shoulder-chain",
    name: "Goddess Shoulder Chain",
    price: 45.00,
    currency: "EUR",
    category: "Shoulder Chains",
    description: "Your dress is already the one. This is the detail that makes the whole look completely, unforgettably yours. Draped softly from the neck across both shoulders, handcrafted in tarnish-resistant stainless steel — available in gold or silver.",
    fullDescription: "This dainty shoulder chain drapes softly from the neck across both shoulders and down the upper arms, adding a delicate layered shimmer to strapless gowns, off-the-shoulder dresses, and sweetheart necklines. It sits so lightly you forget you are wearing it — until you catch it in a photo and realize it made the whole look.\n\nHandmade from durable stainless steel in gold or silver, so it holds its colour and resists tarnishing through the ceremony, the dancing, and every moment in between.",
    specs: [
      { label: "Material",       value: "High-quality stainless steel" },
      { label: "Colours",        value: "Gold or Silver" },
      { label: "Neck chain",     value: "38.5 cm with 6 cm extension" },
      { label: "Shoulder chain", value: "46 cm × 2" },
      { label: "Arm chain",      value: "55 cm × 2" },
      { label: "Custom fit",     value: "Message us after checkout — we adjust every chain length at no extra cost" },
      { label: "Care",           value: "Wipe gently with a soft cloth after wear. Store in an airtight container." },
      { label: "Shipping",       value: "Dispatches within 1–2 business days" },
    ],
    // Card thumbnail
    images: ["/images/products/goddess-shoulder-chain-main.png"],
    // Gallery: sub hero first → variant photos in folder order → apply-to-both at end
    variantImages: {
      "Gold Tone": [
        "/images/products/goddess-shoulder-chain-main.png",
        "/images/products/goddess-shoulder-chain-gold-1.jpg",
        "/images/products/goddess-shoulder-chain-gold-2.jpg",
        "/images/products/goddess-shoulder-chain-gold-3.png",
        "/images/products/goddess-shoulder-chain-both-1.jpg",
        "/images/products/goddess-shoulder-chain-both-2.jpg",
        "/images/products/goddess-shoulder-chain-both-3.jpg",
        "/images/products/goddess-shoulder-chain-both-4.png",
        "/images/products/goddess-shoulder-chain-both-5.png",
      ],
      "Silver Tone": [
        "/images/products/goddess-shoulder-chain-main.png",
        "/images/products/goddess-shoulder-chain-silver-2.jpg",
        "/images/products/goddess-shoulder-chain-silver-3.jpg",
        "/images/products/goddess-shoulder-chain-both-1.jpg",
        "/images/products/goddess-shoulder-chain-both-2.jpg",
        "/images/products/goddess-shoulder-chain-both-3.jpg",
        "/images/products/goddess-shoulder-chain-both-4.png",
        "/images/products/goddess-shoulder-chain-both-5.png",
      ],
    },
    variantVideos: {
      "Gold Tone":   "/images/products/goddess-shoulder-chain-gold.mp4",
      "Silver Tone": "/images/products/goddess-shoulder-chain-silver.mp4",
    },
    featured: true,
    variants: ["Gold Tone", "Silver Tone"],
  },
];

// Derived automatically — used by Navbar, homepage tiles, and shop filter
// Add a product to a category and it appears everywhere without any other changes
export const activeCategories = [
  ...new Set(products.map((p) => p.category)),
] as Category[];
