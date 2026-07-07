export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { isValidToken, COOKIE_NAME } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

function checkAuth(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return !!token && isValidToken(token);
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessions = await stripe.checkout.sessions.list({ limit: 50 });
  const paid = sessions.data.filter(s => s.payment_status === "paid");

  const orders = await Promise.all(paid.map(async (s) => {
    const cd   = s.customer_details;
    const sh   = s.collected_information?.shipping_details;
    const addr = sh?.address || cd?.address;
    let trackingNumber: string | null = null;
    let trackingSentAt: string | null = null;

    if (typeof s.payment_intent === "string") {
      try {
        const pi = await stripe.paymentIntents.retrieve(s.payment_intent);
        trackingNumber = pi.metadata?.tracking_number ?? null;
        trackingSentAt = pi.metadata?.tracking_sent_at ?? null;
      } catch {}
    }

    return {
      id:            s.id,
      paymentIntent: typeof s.payment_intent === "string" ? s.payment_intent : null,
      createdAt:     s.created,
      productName:   s.metadata?.productName ?? "Unknown",
      amount:        (s.amount_total ?? 0) / 100,
      currency:      (s.currency ?? "eur").toUpperCase(),
      customerName:  sh?.name || cd?.name || "—",
      customerEmail: cd?.email || "—",
      address: addr ? {
        line1:       addr.line1 || "",
        line2:       addr.line2 || "",
        city:        addr.city || "",
        postal_code: addr.postal_code || "",
        country:     addr.country || "",
      } : null,
      trackingNumber,
      trackingSentAt,
    };
  }));

  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId, trackingNumber } = await req.json() as { sessionId: string; trackingNumber: string };
  if (!sessionId || !trackingNumber?.trim()) {
    return NextResponse.json({ error: "Missing sessionId or trackingNumber" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Session not paid" }, { status: 400 });
  }

  // Product images were attached at checkout (see product_data.images in /api/checkout) and
  // persist on the ephemeral Stripe Product tied to each line item's price — pull them back
  // out here so the shipping email can show what was actually ordered.
  const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
    expand: ["data.price.product"],
    limit: 10,
  });
  const productImages = lineItems.data
    .map((li) => {
      const product = li.price?.product;
      return typeof product === "object" && product && !("deleted" in product && product.deleted) ? product.images?.[0] : undefined;
    })
    .filter((img): img is string => !!img);

  const cd   = session.customer_details;
  const sh   = session.collected_information?.shipping_details;
  const addr = sh?.address || cd?.address;
  const name = sh?.name || cd?.name || "there";
  const firstName = name.split(" ")[0];
  const email = cd?.email;
  const productName = session.metadata?.productName ?? "your order";
  const FROM = process.env.RESEND_FROM_EMAIL;
  const trackNum = trackingNumber.trim();
  const trackUrl = `https://t.17track.net/en#nums=${encodeURIComponent(trackNum)}`;

  const isEU = ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE"].includes(addr?.country ?? "");
  const deliveryEst = isEU ? "4–7 business days" : "7–14 business days";

  if (!email || !FROM) {
    return NextResponse.json({ error: "No customer email or FROM address configured" }, { status: 400 });
  }

  await resend.emails.send({
    from:    `Bodystrands <${FROM}>`,
    to:      email,
    subject: `Your Bodystrands order is on its way ✨`,
    html: `
      <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#2C2220;background:#FDF9F7;padding:48px 40px;">
        <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#A0622A;margin:0 0 32px;">Bodystrands</p>
        <h1 style="font-weight:300;font-size:28px;margin:0 0 8px;line-height:1.3;">It's on its way, ${firstName}!</h1>
        <p style="font-size:13px;color:#8C7B6E;margin:0 0 32px;line-height:1.8;">Your <strong style="color:#2C2220;">${productName}</strong> has left our studio in Portugal and is heading your way. Estimated delivery: <strong style="color:#2C2220;">${deliveryEst}</strong>.</p>

        ${productImages.length > 0 ? `
        <div style="text-align:center;margin:0 0 28px;">
          ${productImages.map((img) => `<img src="${img}" alt="${productName}" width="120" height="120" style="width:120px;height:120px;object-fit:cover;border:1px solid #E8B4A8;margin:0 4px;" />`).join("")}
        </div>
        ` : ""}

        <div style="border:1px solid #E8B4A8;padding:24px;margin:0 0 28px;text-align:center;">
          <p style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#8C7B6E;margin:0 0 10px;">Tracking Number</p>
          <p style="font-size:22px;letter-spacing:0.2em;color:#2C2220;margin:0 0 6px;font-weight:400;">${trackNum}</p>
          <p style="font-size:11px;color:#8C7B6E;margin:0;">Supported on CTT, DHL, FedEx, UPS & more</p>
        </div>

        <a href="${trackUrl}"
           style="display:block;background:#2C2220;color:#FDF9F7;text-align:center;padding:16px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none;margin-bottom:28px;">
          Track My Parcel
        </a>

        <p style="font-size:13px;color:#8C7B6E;line-height:1.8;margin:0 0 32px;">
          You can also track your order anytime at <a href="https://www.bodystrands.com/track" style="color:#A0622A;">bodystrands.com/track</a> using the number above.
        </p>

        <p style="font-size:11px;color:#8C7B6E;margin:0;padding-top:24px;border-top:1px solid #E8B4A8;line-height:1.8;">
          Questions? Reach us at <a href="mailto:info@bodystrands.com" style="color:#A0622A;">info@bodystrands.com</a> — we respond within 24 hours.<br>
          Made in Portugal · Handcrafted in stainless steel · Waterproof &amp; tarnish-resistant
        </p>
      </div>
    `,
  });

  // Save tracking number to PaymentIntent metadata
  if (session.payment_intent && typeof session.payment_intent === "string") {
    await stripe.paymentIntents.update(session.payment_intent, {
      metadata: {
        tracking_number:  trackNum,
        tracking_sent_at: new Date().toISOString(),
      },
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
