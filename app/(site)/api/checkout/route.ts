import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { products } from "@/lib/products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
  const { productId, variant, priceAdd } = await req.json() as { productId: string; variant?: string; priceAdd?: number };

  const product = products.find((p) => p.id === productId);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const productName  = variant ? `${product.name} — ${variant}` : product.name;
  const origin       = req.headers.get("origin") ?? "https://bodystrands.com";
  const totalAmount  = product.price + (priceAdd ?? 0);
  const freeShipping = totalAmount >= 50;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: product.currency.toLowerCase(),
          product_data: {
            name: productName,
            description: product.description,
            images: product.images[0]
              ? [`${origin}${product.images[0]}`]
              : [],
          },
          unit_amount: Math.round(totalAmount * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    metadata: {
      productId:   product.id,
      productName: productName,
      price:       totalAmount.toFixed(2),
      currency:    product.currency,
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: freeShipping ? 0 : 500, currency: "eur" },
          display_name: freeShipping ? "Free Shipping — European Union" : "Standard Shipping — European Union",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 4 },
            maximum: { unit: "business_day", value: 7 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: freeShipping ? 0 : 800, currency: "eur" },
          display_name: freeShipping ? "Free Shipping — UK & Switzerland" : "Standard Shipping — UK & Switzerland",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 4 },
            maximum: { unit: "business_day", value: 7 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 1500, currency: "eur" },
          display_name: "Standard Shipping — USA & Canada",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 7 },
            maximum: { unit: "business_day", value: 14 },
          },
        },
      },
    ],
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${origin}/shop`,
    shipping_address_collection: {
      allowed_countries: [
        "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
        "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
        "PL", "PT", "RO", "SK", "SI", "ES", "SE",  // EU
        "GB", "CH",                                  // UK & Switzerland
        "US", "CA",                                  // USA & Canada
      ],
    },
  });

  return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout error";
    console.error("Stripe checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
