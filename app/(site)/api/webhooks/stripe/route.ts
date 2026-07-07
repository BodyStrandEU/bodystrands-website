import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook signature invalid";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerEmail = session.customer_details?.email;
    const productName   = session.metadata?.productName;
    const productId     = session.metadata?.productId;
    const FROM          = process.env.RESEND_FROM_EMAIL;

    if (customerEmail && productName && FROM) {
      const productUrl = productId
        ? `https://www.bodystrands.com/shop/${productId}`
        : "https://www.bodystrands.com/shop";

      await resend.emails.send({
        from:    `Bodystrands <${FROM}>`,
        to:      customerEmail,
        subject: `You left something behind — ${productName}`,
        html: `
          <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#2C2220;background:#FDF9F7;padding:48px 40px;">
            <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#A0622A;margin:0 0 24px;">Bodystrands</p>
            <h1 style="font-weight:300;font-size:26px;margin:0 0 16px;line-height:1.3;">Still thinking about it?</h1>
            <p style="font-size:14px;line-height:1.9;color:#8C7B6E;margin:0 0 12px;">
              You left <strong style="color:#2C2220;">${productName}</strong> in your cart.
              It's still waiting for you — each piece is handmade in our studio in Portugal, so once it's gone, it's gone.
            </p>
            <p style="font-size:14px;line-height:1.9;color:#8C7B6E;margin:0 0 32px;">
              Use code <strong style="color:#2C2220;letter-spacing:0.1em;">WELCOME10</strong> for 10% off if it's your first order.
            </p>
            <a href="${productUrl}"
               style="display:inline-block;background:#2C2220;color:#FDF9F7;padding:14px 36px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none;">
              Complete Your Order
            </a>
            <p style="font-size:11px;color:#8C7B6E;margin-top:40px;padding-top:20px;border-top:1px solid #E8B4A8;">
              Made in Portugal · Handcrafted in 316L stainless steel · Waterproof &amp; tarnish-resistant
            </p>
          </div>
        `,
      });
    }
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const productName   = session.metadata?.productName ?? "Unknown product";
    const amountTotal   = ((session.amount_total ?? 0) / 100).toFixed(2);
    const currency      = (session.currency ?? "eur").toUpperCase();
    const customerEmail = session.customer_details?.email ?? "—";
    const customerName  = session.customer_details?.name ?? "—";
    const address       = session.customer_details?.address;
    const addressLine   = address
      ? [address.line1, address.city, address.country].filter(Boolean).join(", ")
      : "—";

    const orderDate = new Date(session.created * 1000).toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Lisbon",
    });

    // Customer order confirmation
    const FROM = process.env.RESEND_FROM_EMAIL;
    const shippingAddr = session.shipping_details?.address || session.customer_details?.address;
    const shippingName = session.shipping_details?.name || customerName;
    const isEU = ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE"].includes(shippingAddr?.country ?? "");
    const deliveryEst = isEU ? "4–7 business days" : "7–14 business days";

    if (FROM && customerEmail !== "—") {
      await resend.emails.send({
        from:    `Bodystrands <${FROM}>`,
        to:      customerEmail,
        subject: `Your Bodystrands order is confirmed ✨`,
        html: `
          <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#2C2220;background:#FDF9F7;padding:48px 40px;">
            <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#A0622A;margin:0 0 32px;">Bodystrands</p>
            <h1 style="font-weight:300;font-size:28px;margin:0 0 8px;line-height:1.3;">Order Confirmed</h1>
            <p style="font-size:13px;color:#8C7B6E;margin:0 0 32px;">Thank you, ${shippingName.split(" ")[0]}. We've received your order and we're preparing it with care in our studio in Portugal.</p>

            <div style="border:1px solid #E8B4A8;padding:24px;margin:0 0 28px;">
              <p style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#8C7B6E;margin:0 0 14px;">Order Summary</p>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="font-size:13px;padding:6px 0;color:#8C7B6E;width:110px;">Item</td><td style="font-size:13px;padding:6px 0;color:#2C2220;">${productName}</td></tr>
                <tr><td style="font-size:13px;padding:6px 0;color:#8C7B6E;">Total</td><td style="font-size:14px;padding:6px 0;color:#A0622A;font-weight:bold;">${currency} ${amountTotal}</td></tr>
                <tr><td style="font-size:13px;padding:6px 0;color:#8C7B6E;">Ship to</td><td style="font-size:13px;padding:6px 0;color:#2C2220;">${[shippingAddr?.line1, shippingAddr?.city, shippingAddr?.country].filter(Boolean).join(", ")}</td></tr>
              </table>
            </div>

            <div style="margin:0 0 32px;">
              <p style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#8C7B6E;margin:0 0 14px;">What happens next</p>
              <p style="font-size:13px;color:#8C7B6E;line-height:1.8;margin:0 0 8px;">📦 &nbsp;We'll ship your order within <strong style="color:#2C2220;">1–2 business days</strong>.</p>
              <p style="font-size:13px;color:#8C7B6E;line-height:1.8;margin:0 0 8px;">✉️ &nbsp;You'll receive a <strong style="color:#2C2220;">shipping confirmation</strong> with your tracking number as soon as it's on its way.</p>
              <p style="font-size:13px;color:#8C7B6E;line-height:1.8;margin:0;">🚚 &nbsp;Estimated delivery: <strong style="color:#2C2220;">${deliveryEst}</strong>.</p>
            </div>

            <a href="https://www.bodystrands.com/track" style="display:inline-block;background:#2C2220;color:#FDF9F7;padding:14px 36px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none;margin-bottom:32px;">Track Your Order</a>

            <p style="font-size:11px;color:#8C7B6E;margin:0;padding-top:24px;border-top:1px solid #E8B4A8;line-height:1.8;">
              Questions? Reply to this email or reach us at <a href="mailto:info@bodystrands.com" style="color:#A0622A;">info@bodystrands.com</a><br>
              Made in Portugal · Handcrafted in 316L stainless steel · Waterproof &amp; tarnish-resistant
            </p>
          </div>
        `,
      }).catch(e => console.error("Customer confirmation email failed:", e));
    }

    // Owner notification
    await resend.emails.send({
      from:    "Bodystrands Orders <onboarding@resend.dev>",
      to:      "storenavaria@gmail.com",
      subject: `New order — ${productName} (${currency} ${amountTotal})`,
      html: `
        <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2C2220;">
          <h2 style="font-weight:300;letter-spacing:0.05em;border-bottom:1px solid #E8B4A8;padding-bottom:12px;">
            New Order Received
          </h2>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <tr>
              <td style="padding:8px 0;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#8C7B6E;width:120px;">Product</td>
              <td style="padding:8px 0;font-size:14px;">${productName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#8C7B6E;">Amount</td>
              <td style="padding:8px 0;font-size:14px;font-weight:bold;color:#A0622A;">${currency} ${amountTotal}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#8C7B6E;">Customer</td>
              <td style="padding:8px 0;font-size:14px;">${customerName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#8C7B6E;">Email</td>
              <td style="padding:8px 0;font-size:14px;"><a href="mailto:${customerEmail}" style="color:#A0622A;">${customerEmail}</a></td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#8C7B6E;">Ship to</td>
              <td style="padding:8px 0;font-size:14px;">${addressLine}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#8C7B6E;">Date</td>
              <td style="padding:8px 0;font-size:14px;">${orderDate}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#8C7B6E;">Session ID</td>
              <td style="padding:8px 0;font-size:11px;color:#8C7B6E;">${session.id}</td>
            </tr>
          </table>
          <p style="font-size:12px;color:#8C7B6E;margin-top:24px;border-top:1px solid #E8B4A8;padding-top:16px;">
            View in Stripe: <a href="https://dashboard.stripe.com/payments/${session.payment_intent}" style="color:#A0622A;">Open dashboard</a>
          </p>
        </div>
      `,
    });
  }

  return NextResponse.json({ received: true });
}
