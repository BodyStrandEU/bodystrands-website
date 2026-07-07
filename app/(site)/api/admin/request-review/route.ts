export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { isValidToken, COOKIE_NAME } from "@/lib/auth";
import { createReviewToken } from "@/lib/reviewToken";
import { products } from "@/lib/products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

function checkAuth(req: NextRequest): boolean {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return !!token && isValidToken(token);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId } = await req.json() as { sessionId: string };
  if (!sessionId) return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Session not paid" }, { status: 400 });
  }

  const email = session.customer_details?.email;
  const name  = session.collected_information?.shipping_details?.name || session.customer_details?.name || "there";
  const firstName = name.split(" ")[0];
  const FROM = process.env.RESEND_FROM_EMAIL;
  if (!email || !FROM) {
    return NextResponse.json({ error: "No customer email or FROM address configured" }, { status: 400 });
  }

  // Resolve which product/category this order was for. Single-item "Buy Now" orders carry
  // productId in metadata directly; cart orders only have a combined name string, so fall
  // back to matching it against the catalog.
  const productId   = session.metadata?.productId;
  const productName = session.metadata?.productName ?? "your order";
  const product = productId
    ? products.find((p) => p.id === productId)
    : products.find((p) => productName.startsWith(p.name));
  const category = product?.category ?? "General";

  const token      = createReviewToken(sessionId, category, productName);
  const reviewUrl  = `https://www.bodystrands.com/review/${token}`;

  await resend.emails.send({
    from:    `Bodystrands <${FROM}>`,
    to:      email,
    subject: `How's your ${productName.split(" — ")[0]}?`,
    html: `
      <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#2C2220;background:#FDF9F7;padding:48px 40px;">
        <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#A0622A;text-align:center;margin:0 0 32px;">Bodystrands</p>
        <h1 style="font-weight:300;font-size:28px;margin:0 0 16px;line-height:1.3;text-align:center;">How's it looking, ${firstName}?</h1>
        <p style="font-size:14px;color:#8C7B6E;margin:0 0 32px;line-height:1.9;text-align:center;">
          We'd love to know what you think of your <strong style="color:#2C2220;">${productName}</strong>. Got a photo wearing it? Even better — it helps other shoppers picture it in real life.
        </p>
        <a href="${reviewUrl}"
           style="display:block;background:#2C2220;color:#FDF9F7;text-align:center;padding:16px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none;margin-bottom:28px;">
          Leave a Review
        </a>
        <p style="font-size:11px;color:#8C7B6E;margin:0;padding-top:24px;border-top:1px solid #E8B4A8;line-height:1.8;text-align:center;">
          Questions? Reach us at <a href="mailto:info@bodystrands.com" style="color:#A0622A;">info@bodystrands.com</a>
        </p>
      </div>
    `,
  });

  if (session.payment_intent && typeof session.payment_intent === "string") {
    await stripe.paymentIntents.update(session.payment_intent, {
      metadata: { review_requested_at: new Date().toISOString() },
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
