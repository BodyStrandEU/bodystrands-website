import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { products } from "@/lib/products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
  const { productId, variant } = await req.json() as { productId: string; variant?: string };

  const product = products.find((p) => p.id === productId);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const productName = variant ? `${product.name} — ${variant}` : product.name;
  const origin = req.headers.get("origin") ?? "https://bodystrands.com";

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
          unit_amount: Math.round(product.price * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/shop`,
    shipping_address_collection: {
      allowed_countries: [
        "PT", "ES", "FR", "DE", "IT", "NL", "BE", "GB", "IE", "US", "CA", "AU",
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
