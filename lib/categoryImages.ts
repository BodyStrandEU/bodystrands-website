// The worn-jewelry photo that represents each category in Google results and link previews
// (same photos as the homepage category tiles). Every page should point Google at jewelry
// being worn — never packaging or the studio.
export const CATEGORY_IMAGES: Record<string, string> = {
  "Back Chains":       "/images/elvan-back-full.jpg",
  "Body Chains":       "/images/category-body.jpg",
  "Belly Chains":      "/images/category-belly.png",
  "Shoulder Chains":   "/images/category-shoulder.jpg",
  "Anklets":           "/images/lifestyle-anklet.jpg",
  "Foot Chains":       "/images/category-foot.jpg",
  "Necklaces":         "/images/category-necklace.jpg",
  "Bracelets":         "/images/category-bracelet.jpg",
  "Hand Chains":       "/images/category-hand.jpg",
  "Head Chains":       "/images/category-head.jpg",
  "Eyeglasses Chains": "/images/category-glasses.jpg",
  "Leg Chains":        "/images/category-leg.jpg",
  "Rings":             "/images/category-rings.jpg",
};

export function previewImages(src: string, alt: string) {
  return {
    openGraph: { images: [{ url: src, alt }] },
    twitter: { card: "summary_large_image" as const, images: [src] },
  };
}
