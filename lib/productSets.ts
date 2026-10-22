// "Shop the Set" — curated matching sets, plus an automatic partner for every product that
// isn't in one, so every product page offers something to wear with it at 10% off together.
import { products, type Product } from "@/lib/products";

export type ProductSet = {
  id: string;
  name: string;
  why: string;
  productIds: string[];
};

export const SET_DISCOUNT_PERCENT = 10;

export const PRODUCT_SETS: ProductSet[] = [
  { id: "pink-cross",       name: "Pink Cross Set",          why: "Same pink enamel cross on a gold chain",       productIds: ["pink-cross-choker", "pink-cross-charm-bracelet"] },
  { id: "pearl-cross",      name: "Pearl Cross Set",         why: "Pearls and a cross, from neck to hand",        productIds: ["rosary-pearl-cross-choker", "pearl-cross-hand-chain", "pearl-rosary-cross-bracelet"] },
  { id: "turquoise",        name: "Turquoise Set",           why: "The same turquoise beads on every piece",      productIds: ["turquoise-beaded-choker", "layered-turquoise-bead-bracelet", "beaded-glasses-chain"] },
  { id: "pearl-heart-init", name: "Pearl Heart Initial Set", why: "Your initial with a pearl heart, three ways",   productIds: ["initial-heart-pearl-choker", "pearl-heart-initial-bracelet", "pearl-heart-initial-anklet"] },
  { id: "diamond-initial",  name: "Diamond Initial Set",     why: "Matching sparkling initials",                  productIds: ["initial-letter-rhinestone-choker", "diamond-initial-layered-bracelet", "diamond-initial-anklet"] },
  { id: "letter",           name: "Initial Letter Set",      why: "A simple letter on neck, wrist and ankle",     productIds: ["monogram-letter-necklace", "script-initial-bracelet", "initial-letter-anklet"] },
  { id: "bridal-pearl",     name: "Bridal Pearl Set",        why: "A pearl strand back and pearl bracelet for the wedding day", productIds: ["pearl-wedding-back-necklace", "layered-pearl-bracelet"] },
  { id: "cowrie-beach",     name: "Cowrie Beach Set",        why: "Shells and bare feet for the beach",           productIds: ["cowrie-shell-belly-chain", "cowrie-shell-anklet", "barefoot-toe-chain-anklet"] },
  { id: "mirror-link",      name: "Mirror Link Set",         why: "The same mirror-link chain on hand and foot",  productIds: ["mirror-link-hand-chain", "mirror-link-foot-chain"] },
  // Added Oct 22, 2026
  { id: "pearl-wedding",    name: "Pearl Wedding Set",       why: "Pearls for your hair, shoulder and hand",      productIds: ["pearl-bridal-head-chain", "pearl-shoulder-necklace", "pearl-hand-chain"] },
  { id: "bridal-chain",     name: "Bridal Chain Set",        why: "Fine chain for your hair, shoulder and hand",  productIds: ["bridal-forehead-chain", "bridal-shoulder-chain", "silver-finger-hand-chain"] },
  { id: "pearl-beach",      name: "Pearl Beach Set",         why: "Pearls from waist to bare feet",               productIds: ["pearl-belly-chain", "pearl-barefoot-sandal"] },
  { id: "crisscross",       name: "Crisscross Festival Set", why: "The same crisscross drape on head, hand and waist", productIds: ["boho-hair-chain", "boho-finger-hand-chain", "boho-belly-chain"] },
  { id: "coin-disc",        name: "Coin Disc Set",           why: "Flat coin links on neck, wrist and ankle",     productIds: ["coin-disc-chain-choker", "coin-disc-bracelet", "coin-disc-chain-anklet"] },
  { id: "zodiac",           name: "Zodiac Set",              why: "Your star sign on neck, wrist and ankle",      productIds: ["zodiac-slip-on-necklace", "zodiac-charm-bracelet", "zodiac-anklet"] },
  { id: "birth-flower",     name: "Birth Flower Set",        why: "Your birth flower on neck, wrist and ankle",   productIds: ["birth-flower-charm-necklace", "birth-flower-charm-bracelet", "birth-flower-anklet"] },
  { id: "birthstone",       name: "Birthstone Set",          why: "Your birthstone on neck, wrist and finger",    productIds: ["birthstone-choker-necklace", "birthstone-bracelet", "birthstone-ring"] },
  { id: "crystal",          name: "Colorful Crystal Set",    why: "The same sunset-toned crystal beads",          productIds: ["colorful-crystal-bead-choker", "colorful-crystal-bead-bracelet", "colorful-crystal-bead-anklet"] },
  { id: "evil-eye",         name: "Evil Eye Set",            why: "Evil eye protection, three ways",              productIds: ["evil-eye-choker-necklace", "evil-eye-charm-anklet", "evil-eye-ring"] },
  { id: "butterfly",        name: "Butterfly Set",           why: "Butterfly charms for waist and ankle",         productIds: ["butterfly-charm-belly-chain", "butterfly-anklet"] },
  { id: "dragonfly",        name: "Dragonfly Set",           why: "The same dragonfly charm on neck and waist",   productIds: ["dragonfly-pendant-necklace", "dragonfly-charm-belly-chain"] },
  { id: "star",             name: "Star Set",                why: "Star charms on red or green beads",            productIds: ["beaded-star-choker", "star-charm-crystal-bracelet"] },
  { id: "gold-cross",       name: "Gold Cross Set",          why: "Bold gold crosses for neck and wrist",         productIds: ["chunky-toggle-cross-necklace", "gold-beaded-cross-bracelet"] },
  { id: "pearl-bead",       name: "Pearl Bead Set",          why: "The same pearl bead chain, neck and glasses",  productIds: ["layered-pearl-choker", "pearl-glasses-chain"] },
  { id: "snake-chain",      name: "Snake Chain Set",         why: "Smooth snake chain at the waist and on your glasses", productIds: ["snake-belly-chain", "minimalist-glasses-chain"] },
  { id: "turquoise-beach",  name: "Turquoise Beach Set",     why: "Turquoise beads for neck and waist",           productIds: ["turquoise-beaded-cable-chain-necklace", "turquoise-beaded-belly-chain"] },
  { id: "plus-size",        name: "Plus Size Set",           why: "Made-to-fit sizing for waist, wrist and foot", productIds: ["plus-size-belly-chain", "plus-size-bracelet", "plus-size-toe-chain-anklet"] },
];

// ── Metal colour ─────────────────────────────────────────────────────────────────────
// A set only ever shows one colour: every piece appears (and goes in the cart) in the colour
// of the product being viewed. A piece qualifies if its main photo is that colour, or it has
// its own photo for that colour option (user rule, Oct 22, 2026).
export type Tone = "gold" | "silver";
export const toneOfLabel = (label?: string | null): Tone | null =>
  !label ? null : /silver/i.test(label) ? "silver" : /gold/i.test(label) ? "gold" : null;

export function defaultTone(p: Product): Tone {
  const first = (p.variants ?? []).map(toneOfLabel).find(Boolean);
  if (first) return first;
  return /silver/i.test(p.name) ? "silver" : "gold";
}

export const toneVariant = (p: Product, tone: Tone) => (p.variants ?? []).find((v) => toneOfLabel(v) === tone);

export function imageIn(p: Product, tone: Tone): string | undefined {
  const v = toneVariant(p, tone);
  return (v && p.variantHeroes?.[v]) || p.images?.[0];
}

export function canShowIn(p: Product, tone: Tone): boolean {
  if (defaultTone(p) === tone) return true;
  const v = toneVariant(p, tone);
  return !!(v && p.variantHeroes?.[v]);
}

const tonesOf = (p: Product): Tone[] => (["gold", "silver"] as Tone[]).filter((t) => canShowIn(p, t));

// ── Automatic pairs ──────────────────────────────────────────────────────────────────
// Rule-based, deterministic (same result on server and client, so checkout can verify the
// discount): a shared material/charm wins first, then a piece for a different part of the
// body that's worn together, then a shared finish. Partners are spread out so one product
// isn't suggested everywhere.

// Which categories are worn together with each category
const WORN_WITH: Record<string, string[]> = {
  "Belly Chains":      ["Anklets", "Foot Chains", "Necklaces", "Bracelets", "Body Chains", "Hand Chains", "Head Chains", "Shoulder Chains", "Back Chains"],
  "Body Chains":       ["Anklets", "Foot Chains", "Bracelets", "Hand Chains", "Belly Chains"],
  "Shoulder Chains":   ["Head Chains", "Hand Chains", "Bracelets", "Belly Chains"],
  "Back Chains":       ["Head Chains", "Hand Chains", "Bracelets", "Belly Chains"],
  "Head Chains":       ["Shoulder Chains", "Hand Chains", "Back Chains", "Belly Chains"],
  "Necklaces":         ["Bracelets", "Anklets", "Rings", "Eyeglasses Chains", "Belly Chains"],
  "Bracelets":         ["Anklets", "Necklaces", "Rings", "Belly Chains"],
  "Anklets":           ["Bracelets", "Belly Chains", "Necklaces", "Body Chains"],
  "Foot Chains":       ["Belly Chains", "Body Chains", "Bracelets"],
  "Hand Chains":       ["Bracelets", "Rings", "Head Chains", "Shoulder Chains", "Belly Chains"],
  "Leg Chains":        ["Anklets", "Foot Chains"],
  "Rings":             ["Bracelets", "Necklaces", "Hand Chains"],
  "Eyeglasses Chains": ["Necklaces", "Bracelets"],
};

// Body, back and shoulder chains all dress the torso — together they compete instead of
// reading as a set, so they never pair with each other (user rule, Oct 22, 2026).
const TORSO = new Set(["Body Chains", "Back Chains", "Shoulder Chains"]);
export const clashes = (a: string, b: string) => a !== b && TORSO.has(a) && TORSO.has(b);

// Materials and charms that make two pieces a genuine match, with the wording shown to shoppers
const MOTIFS: [RegExp, string][] = [
  [/\bcross\b/i, "a cross on both pieces"],
  [/butterfl/i, "butterfly charms on both"],
  [/initial|monogram|letter/i, "personalised with your initial"],
  [/zodiac|star sign|horoscope/i, "your star sign on both"],
  [/birth flower/i, "your birth flower on both"],
  [/birthstone|birth month|gemstone/i, "your birthstone on both"],
  [/turquoise/i, "turquoise on both pieces"],
  [/crystal/i, "crystal beads on both"],
  [/evil eye/i, "evil eye charms on both"],
  [/coin|disc/i, "coin links on both"],
  [/snake chain|\bsnake\b/i, "the same snake chain"],
  [/crisscross|crossover/i, "the same crisscross drape"],
  [/cowrie|shell/i, "shells on both pieces"],
  [/dragonfly/i, "dragonfly charms on both"],
  [/heart/i, "hearts on both pieces"],
  [/mirror.link/i, "the same mirror-link chain"],
  [/\bstar\b/i, "star charms on both"],
  [/plus size/i, "made-to-fit plus sizing"],
  [/pearl/i, "pearls on both pieces"],
];

const ZONE_WHY: Record<string, string> = {
  "Back Chains": "back", "Head Chains": "hair", "Shoulder Chains": "shoulders", "Belly Chains": "waist",
  "Body Chains": "body", "Anklets": "ankle", "Foot Chains": "feet", "Necklaces": "neck",
  "Bracelets": "wrist", "Hand Chains": "hand", "Rings": "finger", "Leg Chains": "legs", "Eyeglasses Chains": "glasses",
};

// Names only — descriptions mention other materials in passing ("pairs well with pearls"),
// which produced false matches like a plain back chain with a pearl cross hand chain.
const textOf = (p: Product) => p.name;
const finishes = (p: Product) => new Set((p.variants ?? []).filter((v) => /tone/i.test(v)));

// Pieces with a signature charm or fit only pair with pieces that share it — a cross goes
// with a cross, an initial with an initial (user rule, Oct 22, 2026)
const OWN_KIND = [
  /plus size/i, /initial|monogram|letter/i, /\bcross\b/i, /butterfl/i, /zodiac/i, /evil eye/i,
  /dragonfly/i, /\bstar\b/i, /birth flower/i, /birthstone|birth month/i,
];
// strict: either side's signature must be on both. loose (fallback when nothing strict fits):
// only the partner's signature is checked, so a plain piece never gets a cross added to it.
const ownKindOnly = (p: Product, q: Product, strict: boolean) =>
  OWN_KIND.some((re) => re.test(q.name) !== re.test(p.name) && (strict || re.test(q.name)));

function buildAutoPairs(): ProductSet[] {
  const curated = new Set(PRODUCT_SETS.flatMap((s) => s.productIds));
  const active = products.filter((p) => p.active !== false);
  const timesUsed = new Map<string, number>();
  const pairs: ProductSet[] = [];

  for (const p of active) {
    if (curated.has(p.id)) continue;
    const zones = WORN_WITH[p.category] ?? [];
    const pMotifs = MOTIFS.filter(([re]) => re.test(textOf(p)));
    const pFin = finishes(p);

    let best: { q: Product; score: number; why: string } | null = null;
    for (const strict of [true, false]) {
    if (best) break;
    for (const q of active) {
      if (q.id === p.id || q.category === p.category) continue;
      if (ownKindOnly(p, q, strict) || clashes(p.category, q.category)) continue;
      if (!canShowIn(q, defaultTone(p))) continue;
      const zoneRank = zones.indexOf(q.category);
      const shared = pMotifs.find(([re]) => re.test(textOf(q)));
      if (zoneRank < 0 && !shared) continue;
      let score = 0;
      if (shared) score += 10 - MOTIFS.indexOf(shared) * 0.2; // earlier motifs are more specific
      if (zoneRank >= 0) score += 4 - zoneRank;
      if ([...pFin].some((f) => finishes(q).has(f))) score += 1;
      if (tonesOf(p).every((t) => canShowIn(q, t))) score += 1.5; // still works if they switch colour
      score -= (timesUsed.get(q.id) ?? 0) * 1.5;
      if (!best || score > best.score || (score === best.score && q.id < best.q.id)) {
        best = {
          q, score,
          why: shared ? shared[1] : `${ZONE_WHY[p.category] ?? "one"} and ${ZONE_WHY[q.category] ?? "another"}, worn together`,
        };
      }
    }
    }
    if (!best) continue;
    timesUsed.set(best.q.id, (timesUsed.get(best.q.id) ?? 0) + 1);
    const why = best.why.charAt(0).toUpperCase() + best.why.slice(1);
    pairs.push({ id: `pair-${p.id}`, name: "Matching Pair", why, productIds: [p.id, best.q.id] });
  }
  return pairs;
}

export const AUTO_PAIRS: ProductSet[] = buildAutoPairs();
const ALL_SETS: ProductSet[] = [...PRODUCT_SETS, ...AUTO_PAIRS];

export function getSetFor(productId: string): ProductSet | undefined {
  return PRODUCT_SETS.find((s) => s.productIds.includes(productId))
    ?? AUTO_PAIRS.find((s) => s.productIds[0] === productId);
}

export function setUnitPrice(unitPrice: number): number {
  return Math.round(unitPrice * (1 - SET_DISCOUNT_PERCENT / 100) * 100) / 100;
}

/**
 * How many units of each cart line get the set price. A set qualifies once the cart holds
 * at least two different products from it, and each discounted unit needs a partner from
 * the same set — so 3 choker + 1 bracelet discounts 1 choker and 1 bracelet, not 3 chokers.
 * Shared by the cart drawer (display) and /api/checkout (what Stripe actually charges).
 */
export function setDiscountedUnits(lines: { productId: string; quantity: number }[]): number[] {
  const qtyByProduct = new Map<string, number>();
  for (const l of lines) qtyByProduct.set(l.productId, (qtyByProduct.get(l.productId) ?? 0) + l.quantity);

  const allowance = new Map<string, number>();
  for (const set of ALL_SETS) {
    const present = set.productIds.filter((id) => (qtyByProduct.get(id) ?? 0) > 0);
    if (present.length < 2) continue;
    for (const id of present) {
      const partnerMax = Math.max(...present.filter((o) => o !== id).map((o) => qtyByProduct.get(o)!));
      // A product can sit in a curated set and in someone else's automatic pair — keep the best match
      allowance.set(id, Math.max(allowance.get(id) ?? 0, Math.min(qtyByProduct.get(id)!, partnerMax)));
    }
  }

  return lines.map((l) => {
    const left = allowance.get(l.productId) ?? 0;
    const units = Math.min(left, l.quantity);
    allowance.set(l.productId, left - units);
    return units;
  });
}
