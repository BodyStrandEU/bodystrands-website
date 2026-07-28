import sizeGuideData from "@/data/size-guide.json";
import type { Category } from "@/lib/products";

export type MeasurementRegion =
  | "chainLength"
  | "ankle"
  | "wrist"
  | "waist"
  | "forehead"
  | "finger"
  | "upperArm"
  | "thigh";

export type SizeEntry = {
  productId: string;
  category: Category;
  region: MeasurementRegion;
  minCm: number;
  maxCm: number;
};

export const SIZE_GUIDE: SizeEntry[] = sizeGuideData as SizeEntry[];

// Categories with no meaningful sizing decision — fully adjustable / one-size by design.
export const ONE_SIZE_CATEGORIES: Category[] = ["Eyeglasses Chains", "Bikini Clip Chains"];

export type CategorySizeConfig = {
  region: MeasurementRegion;
  measureLabel: string;
  measureHint: string;
  quickPicks?: { label: string; valueCm: number }[];
};

export const CATEGORY_SIZE_CONFIG: Partial<Record<Category, CategorySizeConfig>> = {
  "Necklaces": {
    region: "chainLength",
    measureLabel: "Desired chain length",
    measureHint: "Not sure what “length” means on you? Pick a style below, or enter an exact number if you already know it.",
    quickPicks: [
      { label: "Choker", valueCm: 38 },
      { label: "Collarbone", valueCm: 44 },
      { label: "Princess", valueCm: 48 },
      { label: "Matinee", valueCm: 56 },
    ],
  },
  "Anklets": {
    region: "ankle",
    measureLabel: "Ankle circumference (cm)",
    measureHint: "Wrap a soft tape measure snugly around your ankle bone, where the anklet will sit.",
  },
  "Bracelets": {
    region: "wrist",
    measureLabel: "Wrist circumference (cm)",
    measureHint: "Wrap a soft tape measure snugly around your wrist, just below the bone.",
  },
  "Belly Chains": {
    region: "waist",
    measureLabel: "Waist circumference (cm)",
    measureHint: "Measure around your natural waistline — where you’d like the chain to sit.",
  },
  "Body Chains": {
    region: "waist",
    measureLabel: "Waist circumference (cm)",
    measureHint: "Measure around your natural waistline — where you’d like the chain to sit.",
  },
  "Back Chains": {
    region: "waist",
    measureLabel: "Waist / hip circumference (cm)",
    measureHint: "Measure around where the chain will sit across your lower back.",
  },
  "Head Chains": {
    region: "forehead",
    measureLabel: "Forehead circumference (cm)",
    measureHint: "Measure around your forehead, just above your eyebrows.",
  },
  "Hand Chains": {
    region: "finger",
    measureLabel: "Ring finger circumference (cm)",
    measureHint: "Wrap a soft tape or a strip of paper snugly around the base of the finger you’ll wear the ring on.",
  },
  "Shoulder & Arm Chains": {
    region: "upperArm",
    measureLabel: "Upper arm circumference (cm)",
    measureHint: "Measure around the fullest part of your upper arm/bicep. (This fits our bicep and arm-band styles specifically — full shoulder-drape pieces are made custom-fit, see note below.)",
  },
  "Leg Chains": {
    region: "thigh",
    measureLabel: "Thigh circumference (cm)",
    measureHint: "Measure around the fullest part of your thigh, where the chain will sit.",
  },
};

export function matchingProductIds(category: Category, valueCm: number): string[] {
  const config = CATEGORY_SIZE_CONFIG[category];
  if (!config) return [];
  return SIZE_GUIDE.filter(
    (e) => e.category === category && e.region === config.region && valueCm >= e.minCm && valueCm <= e.maxCm
  ).map((e) => e.productId);
}

// Products in a category that simply have no size data yet, so they never appear in
// calculator results — used to power an honest "these are available too, message us
// to confirm fit" fallback instead of a dead end.
export function sizedProductIdsInCategory(category: Category): Set<string> {
  return new Set(SIZE_GUIDE.filter((e) => e.category === category).map((e) => e.productId));
}
