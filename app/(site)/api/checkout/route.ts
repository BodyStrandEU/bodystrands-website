import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { products, type Product } from "@/lib/products";
import { getShippingRate, ALL_COUNTRIES } from "@/lib/shipping";
import { fetchExchangeRates, type CurrencyCode } from "@/lib/currency";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const GIFT_WRAP_FEE_EUR = 4;

type CartItemInput = { productId: string; variant?: string; groupSelections?: Record<string, string>; quantity?: number };

// Security: the price add-on is NEVER taken from the client as a number — that would let
// a tampered request pay whatever it wants. Instead we're given which *option* was selected
// per variant group, and we look up that option's price from the product's own server-side
// data. Worst case a tampered request can only pick a real, seller-defined price for a real
// option — never an arbitrary or negative amount.
function computeValidatedPriceAdd(product: Product, groupSelections: unknown): number {
  if (!groupSelections || typeof groupSelections !== "object" || !product.variantGroups) return 0;
  const selections = groupSelections as Record<string, string>;
  return product.variantGroups.reduce((sum, group) => {
    if (group.type === "text" || !group.optionPrices) return sum;
    const selected = selections[group.label];
    if (typeof selected !== "string" || !group.options?.includes(selected)) return sum;
    return sum + (group.optionPrices[selected] ?? 0);
  }, 0);
}

function giftWrapLineItem(): Stripe.Checkout.SessionCreateParams.LineItem {
  return {
    price_data: {
      currency: "eur",
      product_data: {
        name: "Gift Wrapping",
        description: "Wrapped in Bodystrands gift packaging with a handwritten note.",
      },
      unit_amount: Math.round(GIFT_WRAP_FEE_EUR * 100),
    },
    quantity: 1,
  };
}

// Hardcoded, not derived from the request's Origin header — this URL gets baked into the
// Stripe Product and read back later by the confirmation email, the shipping email, and the
// owner-notification email, all outside the original browser request's context. An
// Origin-derived value can be a Vercel preview URL, a bare non-www domain, or missing
// entirely, silently breaking the image in every email downstream. Every other absolute URL
// in this codebase already points at this same canonical domain (see layout.tsx, sitemap.ts,
// stripe/route.ts, admin/orders/route.ts) — this was the one place still relying on Origin.
const CANONICAL_DOMAIN = "https://www.bodystrands.com";

function resolveImage(img: string): string {
  return img.startsWith("http") ? img : `${CANONICAL_DOMAIN}${img}`;
}

function buildSingleShippingOption(country: string, totalAmount: number, rates: Record<CurrencyCode, number>): Stripe.Checkout.SessionCreateParams.ShippingOption[] {
  const rate = getShippingRate(country, totalAmount, rates);
  return [{
    shipping_rate_data: {
      type:          "fixed_amount" as const,
      fixed_amount:  { amount: rate.amount, currency: "eur" },
      display_name:  rate.displayName,
      delivery_estimate: {
        minimum: { unit: "business_day" as const, value: rate.deliveryMin },
        maximum: { unit: "business_day" as const, value: rate.deliveryMax },
      },
    },
  }];
}

function buildAllShippingOptions(totalAmount: number, rates: Record<CurrencyCode, number>): Stripe.Checkout.SessionCreateParams.ShippingOption[] {
  // One representative country per zone — getShippingRate is the single source of truth
  // for rates/thresholds, so this can't drift out of sync with the per-country path again.
  const zoneSamples = ["DE", "GB", "US", "CA", "AU"];
  return zoneSamples.map((code) => {
    const rate = getShippingRate(code, totalAmount, rates);
    return {
      shipping_rate_data: {
        type:          "fixed_amount" as const,
        fixed_amount:  { amount: rate.amount, currency: "eur" },
        display_name:  rate.displayName,
        delivery_estimate: {
          minimum: { unit: "business_day" as const, value: rate.deliveryMin },
          maximum: { unit: "business_day" as const, value: rate.deliveryMax },
        },
      },
    };
  });
}

const STRIPE_COUNTRIES = ALL_COUNTRIES as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[];

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json() as Record<string, unknown>;
    const origin = req.headers.get("origin") ?? "https://bodystrands.com";
    const country = (body.country as string | undefined) ?? "";
    // Live rates so CA free-shipping resolves to an exact $75 CAD at checkout (US is a flat EUR threshold).
    const rates = await fetchExchangeRates();

    // ── Cart checkout (multiple items) ──────────────────────────────────
    if (Array.isArray(body.items)) {
      const cartItems = body.items as CartItemInput[];

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
      let totalAmount = 0;
      const productNames: string[] = [];

      for (const item of cartItems) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) continue;
        const qty       = item.quantity ?? 1;
        const unitPrice = product.price + computeValidatedPriceAdd(product, item.groupSelections);
        const name      = item.variant ? `${product.name} — ${item.variant}` : product.name;
        totalAmount    += unitPrice * qty;
        productNames.push(name);
        lineItems.push({
          price_data: {
            currency: product.currency.toLowerCase(),
            product_data: {
              name,
              description: product.description,
              images: product.images[0] ? [resolveImage(product.images[0])] : [],
            },
            unit_amount: Math.round(unitPrice * 100),
          },
          quantity: qty,
        });
      }

      if (lineItems.length === 0) {
        return NextResponse.json({ error: "No valid products in cart" }, { status: 400 });
      }

      // Gift wrap priced/shipped as an add-on service, not merchandise — it must not
      // count toward the free-shipping threshold, so it's added after shipping_options
      // are computed from the pure product totalAmount.
      const giftWrap = body.giftWrap === true;
      const giftNote = typeof body.giftNote === "string" ? body.giftNote.slice(0, 500) : "";

      const shipping_options = country
        ? buildSingleShippingOption(country, totalAmount, rates)
        : buildAllShippingOptions(totalAmount, rates);

      if (giftWrap) lineItems.push(giftWrapLineItem());

      const session = await stripe.checkout.sessions.create({
        // payment_method_types intentionally omitted: Checkout Sessions manage eligible
        // methods dynamically (card, Apple Pay, Google Pay, Klarna, Afterpay/Clearpay, etc.
        // based on currency/amount/country) whenever this field isn't set, using whatever's
        // enabled in the Stripe Dashboard — no hardcoded list that could be ineligible.
        line_items:  lineItems,
        mode:        "payment",
        metadata:    {
          productName: productNames.join(", "),
          price: totalAmount.toFixed(2),
          currency: "EUR",
          giftWrap: giftWrap ? "yes" : "no",
          ...(giftWrap && giftNote ? { giftNote } : {}),
        },
        shipping_options,
        shipping_address_collection: { allowed_countries: STRIPE_COUNTRIES },
        // Shows and charges the shopper in their local currency (Stripe converts using
        // live FX and still settles into our EUR account — line items/metadata stay in EUR).
        adaptive_pricing: { enabled: true },
        allow_promotion_codes: true,
        expires_at: Math.floor(Date.now() / 1000) + 4 * 60 * 60,
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:  `${origin}/shop`,
      });

      return NextResponse.json({ url: session.url });
    }

    // ── Single-item / Buy Now checkout ──────────────────────────────────
    const { productId, variant, groupSelections } = body as { productId: string; variant?: string; groupSelections?: Record<string, string> };
    const product = products.find((p) => p.id === productId);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const productName = variant ? `${product.name} — ${variant}` : product.name;
    const totalAmount = product.price + computeValidatedPriceAdd(product, groupSelections);

    const shipping_options = country
      ? buildSingleShippingOption(country, totalAmount, rates)
      : buildAllShippingOptions(totalAmount, rates);

    const session = await stripe.checkout.sessions.create({
      // payment_method_types intentionally omitted: Checkout Sessions manage eligible
      // methods dynamically (card, Apple Pay, Google Pay, Klarna, Afterpay/Clearpay, etc.
      // based on currency/amount/country) whenever this field isn't set, using whatever's
      // enabled in the Stripe Dashboard — no hardcoded list that could be ineligible.
      line_items: [{
        price_data: {
          currency: product.currency.toLowerCase(),
          product_data: {
            name: productName,
            description: product.description,
            images: product.images[0] ? [resolveImage(product.images[0])] : [],
          },
          unit_amount: Math.round(totalAmount * 100),
        },
        quantity: 1,
      }],
      mode:     "payment",
      metadata: { productId: product.id, productName, price: totalAmount.toFixed(2), currency: product.currency },
      shipping_options,
      shipping_address_collection: { allowed_countries: STRIPE_COUNTRIES },
      adaptive_pricing: { enabled: true },
      allow_promotion_codes: true,
      expires_at: Math.floor(Date.now() / 1000) + 4 * 60 * 60,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/shop`,
    });

    return NextResponse.json({ url: session.url });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout error";
    console.error("Stripe checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
