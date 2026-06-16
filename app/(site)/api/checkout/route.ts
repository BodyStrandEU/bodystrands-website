import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { products } from "@/lib/products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type CartItemInput = { productId: string; variant?: string; priceAdd?: number; quantity?: number };

function buildShippingOptions(totalAmount: number) {
  const free = totalAmount >= 50;
  return [
    {
      shipping_rate_data: {
        type: "fixed_amount" as const,
        fixed_amount: { amount: free ? 0 : 500, currency: "eur" },
        display_name: free ? "Free Shipping — European Union" : "Standard Shipping — European Union",
        delivery_estimate: { minimum: { unit: "business_day" as const, value: 4 }, maximum: { unit: "business_day" as const, value: 7 } },
      },
    },
    {
      shipping_rate_data: {
        type: "fixed_amount" as const,
        fixed_amount: { amount: free ? 0 : 800, currency: "eur" },
        display_name: free ? "Free Shipping — UK & Switzerland" : "Standard Shipping — UK & Switzerland",
        delivery_estimate: { minimum: { unit: "business_day" as const, value: 4 }, maximum: { unit: "business_day" as const, value: 7 } },
      },
    },
    {
      shipping_rate_data: {
        type: "fixed_amount" as const,
        fixed_amount: { amount: 1500, currency: "eur" },
        display_name: "Standard Shipping — USA & Canada",
        delivery_estimate: { minimum: { unit: "business_day" as const, value: 7 }, maximum: { unit: "business_day" as const, value: 14 } },
      },
    },
  ];
}

const ALLOWED_COUNTRIES = [
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR",
  "DE","GR","HU","IE","IT","LV","LT","LU","MT","NL",
  "PL","PT","RO","SK","SI","ES","SE",
  "GB","CH",
  "US","CA",
] as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;
    const origin = req.headers.get("origin") ?? "https://bodystrands.com";

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
              images: product.images[0] ? [`${origin}${product.images[0]}`] : [],
            },
            unit_amount: Math.round(unitPrice * 100),
          },
          quantity: qty,
        });
      }

      if (lineItems.length === 0) {
        return NextResponse.json({ error: "No valid products in cart" }, { status: 400 });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items:  lineItems,
        mode:        "payment",
        metadata:    { productName: productNames.join(", "), price: totalAmount.toFixed(2), currency: "EUR" },
        shipping_options:            buildShippingOptions(totalAmount),
        shipping_address_collection: { allowed_countries: ALLOWED_COUNTRIES },
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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: product.currency.toLowerCase(),
          product_data: {
            name: productName,
            description: product.description,
            images: product.images[0] ? [`${origin}${product.images[0]}`] : [],
          },
          unit_amount: Math.round(totalAmount * 100),
        },
        quantity: 1,
      }],
      mode:     "payment",
      metadata: { productId: product.id, productName, price: totalAmount.toFixed(2), currency: product.currency },
      shipping_options:            buildShippingOptions(totalAmount),
      shipping_address_collection: { allowed_countries: ALLOWED_COUNTRIES },
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
