import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getShippingRate } from "@/lib/shipping";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Conservative (upper-bound) delivery estimate for the Google Customer Reviews opt-in —
// same "state the realistic worst case, not the optimistic best case" approach used
// elsewhere for this program, so the estimate is rarely exceeded in practice.
const PROCESSING_DAYS_MAX = 2;

function estimatedDeliveryDate(countryCode: string): string {
  const { deliveryMax } = getShippingRate(countryCode, 0);
  const date = new Date();
  date.setDate(date.getDate() + PROCESSING_DAYS_MAX + deliveryMax);
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing session id" }, { status: 400 });

  try {
    const session = await stripe.checkout.sessions.retrieve(id);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Not paid" }, { status: 400 });
    }

    const country = session.customer_details?.address?.country ?? "";

    return NextResponse.json({
      productName: session.metadata?.productName ?? "",
      amount:      (session.amount_total ?? 0) / 100,
      currency:    (session.currency ?? "eur").toUpperCase(),
      orderId:     session.id,
      email:       session.customer_details?.email ?? "",
      country,
      estimatedDeliveryDate: country ? estimatedDeliveryDate(country) : "",
    });
  } catch {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
}
