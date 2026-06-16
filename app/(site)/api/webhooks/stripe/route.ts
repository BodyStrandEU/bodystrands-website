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
