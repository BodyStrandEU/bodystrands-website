export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { isValidToken, COOKIE_NAME } from "@/lib/auth";
import { buildTrackingUrl, carrierLabel } from "@/lib/tracking";
import { getShippingRate } from "@/lib/shipping";

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
    let trackingCarrier: string | null = null;
    let reviewRequestedAt: string | null = null;

    if (typeof s.payment_intent === "string") {
      try {
        const pi = await stripe.paymentIntents.retrieve(s.payment_intent);
        trackingNumber    = pi.metadata?.tracking_number ?? null;
        trackingSentAt    = pi.metadata?.tracking_sent_at ?? null;
        trackingCarrier   = pi.metadata?.tracking_carrier ?? null;
        reviewRequestedAt = pi.metadata?.review_requested_at ?? null;
      } catch {}
    }

    return {
      id:            s.id,
      paymentIntent: typeof s.payment_intent === "string" ? s.payment_intent : null,
      createdAt:     s.created,
      productName:   s.metadata?.productName ?? "Unknown",
      giftWrap:      s.metadata?.giftWrap === "yes",
      giftNote:      s.metadata?.giftNote ?? "",
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
      trackingCarrier,
      reviewRequestedAt,
    };
  }));

  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId, trackingNumber, carrier } = await req.json() as { sessionId: string; trackingNumber: string; carrier?: string };
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
  const trackUrl = buildTrackingUrl(carrier, trackNum);

  const shippingRateForEmail = getShippingRate(addr?.country ?? "", 0);
  const deliveryEst = `${shippingRateForEmail.deliveryMin}–${shippingRateForEmail.deliveryMax} business days`;

  if (!email || !FROM) {
    return NextResponse.json({ error: "No customer email or FROM address configured" }, { status: 400 });
  }

  const carrierText = carrierLabel(carrier);

  await resend.emails.send({
    from:    `Bodystrands <${FROM}>`,
    to:      email,
    subject: `Your Bodystrands order is on its way ✨`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2C2220;background:#FDF9F7;">
        <div style="height:5px;background:linear-gradient(90deg,#E8B4A8,#A0622A);"></div>

        <div style="padding:48px 40px;">
          <p style="font-size:11px;letter-spacing:0.35em;text-transform:uppercase;color:#A0622A;text-align:center;margin:0 0 6px;">Bodystrands</p>
          <div style="width:28px;height:1px;background:#E8B4A8;margin:0 auto 28px;"></div>

          <p style="font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#A0622A;text-align:center;margin:0 0 14px;">✨ &nbsp;On Its Way&nbsp; ✨</p>
          <h1 style="font-weight:300;font-size:30px;margin:0 0 16px;line-height:1.3;text-align:center;">Great news, ${firstName}!</h1>
          <p style="font-size:14px;color:#8C7B6E;margin:0 0 32px;line-height:1.9;text-align:center;">
            Your <strong style="color:#2C2220;">${productName}</strong> just left our studio in Portugal — handcrafted with care, and on its way to you now. Estimated arrival: <strong style="color:#2C2220;">${deliveryEst}</strong>.
          </p>

          ${productImages.length > 0 ? `
          <div style="text-align:center;margin:0 0 32px;">
            ${productImages.map((img) => `<img src="${img}" alt="${productName}" width="220" height="220" style="width:220px;height:220px;object-fit:cover;border:6px solid #ffffff;box-shadow:0 6px 24px rgba(44,34,32,0.15);margin:0 6px;" />`).join("")}
          </div>
          ` : ""}

          <table role="presentation" style="width:100%;margin:0 0 36px;border-collapse:collapse;">
            <tr>
              <td style="text-align:center;width:33.33%;">
                <div style="width:9px;height:9px;border-radius:50%;background:#A0622A;margin:0 auto 8px;"></div>
                <p style="font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:#2C2220;margin:0;">Ordered</p>
              </td>
              <td style="text-align:center;width:33.33%;border-top:2px solid #A0622A;">
                <div style="width:9px;height:9px;border-radius:50%;background:#A0622A;margin:-5.5px auto 8px;"></div>
                <p style="font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:#2C2220;margin:0;font-weight:bold;">Shipped</p>
              </td>
              <td style="text-align:center;width:33.33%;border-top:2px solid #E8B4A8;">
                <div style="width:9px;height:9px;border-radius:50%;background:#E8B4A8;margin:-5.5px auto 8px;"></div>
                <p style="font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:#8C7B6E;margin:0;">Delivered</p>
              </td>
            </tr>
          </table>

          <div style="border:1px solid #E8B4A8;margin:0 0 28px;">
            <div style="padding:24px;text-align:center;">
              <p style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#8C7B6E;margin:0 0 10px;">Tracking Number</p>
              <p style="font-size:22px;letter-spacing:0.2em;color:#2C2220;margin:0 0 6px;font-weight:400;">${trackNum}</p>
              <p style="font-size:11px;color:#8C7B6E;margin:0;">${carrierText}</p>
            </div>
            <a href="${trackUrl}"
               style="display:block;background:#2C2220;color:#FDF9F7;text-align:center;padding:18px;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;text-decoration:none;">
              Track My Parcel &nbsp;→
            </a>
          </div>

          <p style="font-size:13px;color:#8C7B6E;line-height:1.8;margin:0 0 32px;text-align:center;">
            You can also track anytime at <a href="https://www.bodystrands.com/track" style="color:#A0622A;">bodystrands.com/track</a>
          </p>

          <div style="text-align:center;padding-top:24px;border-top:1px solid #E8B4A8;">
            <p style="font-size:13px;color:#8C7B6E;line-height:1.9;margin:0 0 18px;">
              With love from our studio,<br><strong style="color:#2C2220;">The Bodystrands Team</strong>
            </p>
            <p style="font-size:11px;color:#8C7B6E;margin:0;line-height:1.8;">
              Questions? <a href="mailto:info@bodystrands.com" style="color:#A0622A;">info@bodystrands.com</a><br>
              Made in Portugal · Handcrafted in stainless steel · Waterproof &amp; tarnish-resistant
            </p>
          </div>
        </div>
      </div>
    `,
  });

  // Save tracking number + carrier to PaymentIntent metadata
  if (session.payment_intent && typeof session.payment_intent === "string") {
    await stripe.paymentIntents.update(session.payment_intent, {
      metadata: {
        tracking_number:  trackNum,
        tracking_sent_at: new Date().toISOString(),
        tracking_carrier: carrier ?? "",
      },
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
