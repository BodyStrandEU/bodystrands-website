// LOCAL MOCKUP — curated matching sets for the "Shop the Set" offer preview.
// A product can appear in several sets; the product page shows the first set it's in.

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
  { id: "bridal-pearl",     name: "Bridal Pearl Set",        why: "Pearl strands for the wedding day",            productIds: ["pearl-wedding-back-necklace", "pearl-hand-chain", "layered-pearl-bracelet"] },
  { id: "cowrie-beach",     name: "Cowrie Beach Set",        why: "Shells and bare feet for the beach",           productIds: ["cowrie-shell-belly-chain", "cowrie-shell-anklet", "barefoot-toe-chain-anklet"] },
  { id: "mirror-link",      name: "Mirror Link Set",         why: "The same mirror-link chain on hand and foot",  productIds: ["mirror-link-hand-chain", "mirror-link-foot-chain"] },
];

export function getSetFor(productId: string): ProductSet | undefined {
  return PRODUCT_SETS.find((s) => s.productIds.includes(productId));
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
  for (const set of PRODUCT_SETS) {
    const present = set.productIds.filter((id) => (qtyByProduct.get(id) ?? 0) > 0);
    if (present.length < 2) continue;
    for (const id of present) {
      const partnerMax = Math.max(...present.filter((o) => o !== id).map((o) => qtyByProduct.get(o)!));
      allowance.set(id, Math.min(qtyByProduct.get(id)!, partnerMax));
    }
  }

  return lines.map((l) => {
    const left = allowance.get(l.productId) ?? 0;
    const units = Math.min(left, l.quantity);
    allowance.set(l.productId, left - units);
    return units;
  });
}
