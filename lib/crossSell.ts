import type { Category } from "@/lib/products";

/**
 * Which categories pair well with each other for a "Complete the Look" upsell.
 * Rule-based on styling logic (bridal pieces pair with bridal, beach with beach,
 * stacking pieces with stacking pieces) rather than real purchase-history data —
 * revisit once there's enough order volume to do this from actual co-purchase stats.
 */
export const CATEGORY_PAIRINGS: Record<Category, Category[]> = {
  "Belly Chains":          ["Anklets", "Bracelets", "Body Chains"],
  "Back Chains":           ["Shoulder & Arm Chains", "Necklaces", "Head Chains"],
  "Body Chains":           ["Anklets", "Bikini Clip Chains", "Belly Chains"],
  "Shoulder & Arm Chains": ["Back Chains", "Necklaces", "Head Chains"],
  "Anklets":               ["Bracelets", "Belly Chains", "Body Chains"],
  "Bracelets":             ["Necklaces", "Anklets", "Hand Chains"],
  "Necklaces":             ["Bracelets", "Back Chains", "Eyeglasses Chains"],
  "Hand Chains":           ["Bracelets", "Shoulder & Arm Chains", "Head Chains"],
  "Head Chains":           ["Back Chains", "Shoulder & Arm Chains", "Necklaces"],
  "Eyeglasses Chains":     ["Necklaces", "Bracelets", "Hand Chains"],
  "Leg Chains":            ["Belly Chains", "Anklets", "Body Chains"],
  "Bikini Clip Chains":    ["Body Chains", "Anklets", "Belly Chains"],
};
