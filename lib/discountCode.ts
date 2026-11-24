import type Stripe from "stripe";

// One discount-code box in the cart. Non-stackable codes (e.g. "SAVE25") are stored in Stripe as
// "CART-SAVE25", so typing SAVE25 on Stripe's own page (Buy Now flow) can't be stacked on top of
// already-reduced sale prices. Any other code is looked up as-is and behaves like a normal Stripe code.
// Single use, expiry and the percentage all live in Stripe (max_redemptions, expires_at,
// coupon.percent_off), so there's nothing to keep in sync here.
const CART_CODE_PREFIX = "CART-";

// exclusive = non-stackable: replaces sale prices with full price and nothing else applies.
// Any other code is an ordinary Stripe promotion code and stacks like it always has.
export type CartCode = { promotionCodeId: string; code: string; exclusive: boolean; percentOff: number | null };

export async function lookupCartCode(stripe: Stripe, raw: unknown): Promise<CartCode | null> {
  if (typeof raw !== "string") return null;
  const code = raw.trim().toUpperCase();
  if (!/^[A-Z0-9_-]{2,30}$/.test(code)) return null;

  for (const exclusive of [true, false]) {
    const { data } = await stripe.promotionCodes.list({ code: exclusive ? CART_CODE_PREFIX + code : code, active: true, limit: 1 });
    const promo = data[0];
    if (!promo) continue;
    // `active` already turns false once max_redemptions is hit or expires_at passes, but check anyway.
    if (promo.expires_at && promo.expires_at * 1000 < Date.now()) continue;
    if (promo.max_redemptions && promo.times_redeemed >= promo.max_redemptions) continue;
    const ref = promo.promotion.coupon;
    if (!ref) continue;
    const coupon = typeof ref === "string" ? await stripe.coupons.retrieve(ref) : ref;
    if (!coupon.valid) continue;
    if (exclusive && !coupon.percent_off) continue;
    return { promotionCodeId: promo.id, code, exclusive, percentOff: coupon.percent_off ?? null };
  }
  return null;
}
