import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing session id" }, { status: 400 });

  try {
    const session = await stripe.checkout.sessions.retrieve(id);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Not paid" }, { status: 400 });
    }

    return NextResponse.json({
      productName: session.metadata?.productName ?? "",
      amount:      (session.amount_total ?? 0) / 100,
      currency:    (session.currency ?? "eur").toUpperCase(),
    });
  } catch {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
}
