import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { products } from "@/lib/products";
import { getShippingRate, ALL_COUNTRIES } from "@/lib/shipping";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type CartItemInput = { productId: string; variant?: string; priceAdd?: number; quantity?: number };

function resolveImage(origin: string, img: string): string {
  return img.startsWith("http") ? img : `${origin}${img}`;
}

function buildSingleShippingOption(country: string, totalAmount: number): Stripe.Checkout.SessionCreateParams.ShippingOption[] {
  const rate = getShippingRate(country, totalAmount);
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

function buildAllShippingOptions(totalAmount: number): Stripe.Checkout.SessionCreateParams.ShippingOption[] {
  // One representative country per zone — getShippingRate is the single source of truth
  // for rates/thresholds, so this can't drift out of sync with the per-country path again.
  const zoneSamples = ["DE", "GB", "US", "CA", "AU"];
  return zoneSamples.map((code) => {
    const rate = getShippingRate(code, totalAmount);
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
        const unitPrice = product.price + (item.priceAdd ?? 0);
        const name      = item.variant ? `${product.name} — ${item.variant}` : product.name;
        totalAmount    += unitPrice * qty;
        productNames.push(name);
        lineItems.push({
          price_data: {
            currency: product.currency.toLowerCase(),
            product_data: {
              name,
              description: product.description,
              images: product.images[0] ? [resolveImage(origin, product.images[0])] : [],
            },
            unit_amount: Math.round(unitPrice * 100),
          },
          quantity: qty,
        });
      }

      if (lineItems.length === 0) {
        return NextResponse.json({ error: "No valid products in cart" }, { status: 400 });
      }

      const shipping_options = country
        ? buildSingleShippingOption(country, totalAmount)
        : buildAllShippingOptions(totalAmount);

      const session = await stripe.checkout.sessions.create({
        // payment_method_types intentionally omitted: Checkout Sessions manage eligible
        // methods dynamically (card, Apple Pay, Google Pay, Klarna, Afterpay/Clearpay, etc.
        // based on currency/amount/country) whenever this field isn't set, using whatever's
        // enabled in the Stripe Dashboard — no hardcoded list that could be ineligible.
        line_items:  lineItems,
        mode:        "payment",
        metadata:    { productName: productNames.join(", "), price: totalAmount.toFixed(2), currency: "EUR" },
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
    const { productId, variant, priceAdd } = body as { productId: string; variant?: string; priceAdd?: number };
    const product = products.find((p) => p.id === productId);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const productName = variant ? `${product.name} — ${variant}` : product.name;
    const totalAmount = product.price + (priceAdd ?? 0);

    const shipping_options = country
      ? buildSingleShippingOption(country, totalAmount)
      : buildAllShippingOptions(totalAmount);

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
            images: product.images[0] ? [resolveImage(origin, product.images[0])] : [],
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
