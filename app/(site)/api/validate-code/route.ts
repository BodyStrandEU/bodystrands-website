import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { products } from "@/lib/products";
import { lookupCartCode } from "@/lib/discountCode";

// Fetch-based client is required under Cloudflare Workers (see api/checkout/route.ts).
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  httpClient: Stripe.createFetchHttpClient(),
});

// Same rule as checkout: the add-on price is looked up server-side from the selected option, never trusted from the client.
function priceAdd(productId: string, groupSelections: unknown): number {
  const product = products.find((p) => p.id === productId);
  if (!product || !groupSelections || typeof groupSelections !== "object" || !product.variantGroups) return 0;
  const selections = groupSelections as Record<string, string>;
  return product.variantGroups.reduce((sum, group) => {
    if (group.type === "text" || !group.optionPrices) return sum;
    const selected = selections[group.label];
    if (typeof selected !== "string" || !group.options?.includes(selected)) return sum;
    return sum + (group.optionPrices[selected] ?? 0);
  }, 0);
}

// Preview for the cart: is the code valid, and what does the order cost with it?
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { code?: unknown; items?: { productId: string; groupSelections?: Record<string, string>; quantity?: number }[] };
    const found = await lookupCartCode(stripe, body.code);
    if (!found) return NextResponse.json({ valid: false, error: "That code isn't valid or has already been used." });

    // Ordinary code: stacks as usual, Stripe shows the amount at checkout.
    if (!found.exclusive) return NextResponse.json({ valid: true, exclusive: false, code: found.code });

    // Full (pre-sale) price: the code replaces any sale price instead of stacking on it.
    let fullTotal = 0;
    for (const item of Array.isArray(body.items) ? body.items : []) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;
      fullTotal += (product.price + priceAdd(item.productId, item.groupSelections)) * (item.quantity ?? 1);
    }
    const discount = Math.round(fullTotal * (found.percentOff ?? 0)) / 100;
    return NextResponse.json({
      valid: true,
      exclusive: true,
      code: found.code,
      percentOff: found.percentOff,
      fullTotal: Math.round(fullTotal * 100) / 100,
      discount,
      subtotal: Math.round((fullTotal - discount) * 100) / 100,
    });
  } catch (err) {
    console.error("validate-code error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ valid: false, error: "Couldn't check the code, please try again." }, { status: 500 });
  }
}
