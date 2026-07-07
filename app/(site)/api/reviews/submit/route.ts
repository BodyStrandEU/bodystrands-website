export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { verifyReviewToken } from "@/lib/reviewToken";
import { getPendingReviews, savePendingReviews, getCustomerReviews, type PendingReview } from "@/lib/reviews-data";
import { uploadImageToDir } from "@/lib/github";
import { COUNTRY_GROUPS } from "@/lib/shipping";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

const COUNTRY_NAME: Record<string, string> = Object.fromEntries(
  COUNTRY_GROUPS.flatMap((g) => g.countries.map((c) => [c.code, c.name]))
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const token    = formData.get("token") as string | null;
    const name     = (formData.get("name") as string | null)?.trim();
    const rating   = Number(formData.get("rating"));
    const headline = (formData.get("headline") as string | null)?.trim();
    const text     = (formData.get("text") as string | null)?.trim();
    const photo    = formData.get("photo") as File | null;

    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });
    const payload = verifyReviewToken(token);
    if (!payload) return NextResponse.json({ error: "This review link is invalid or has expired." }, { status: 400 });

    if (!name || !headline || !text || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Please fill in your name, a rating, headline, and review text." }, { status: 400 });
    }

    // One review per completed order — block duplicate submissions on the same link.
    const { reviews: pending } = await getPendingReviews();
    const { data: approved }   = await getCustomerReviews();
    const alreadySubmitted =
      pending.some((r) => r.sessionId === payload.sessionId) ||
      Object.values(approved).flat().some((r) => r.sessionId === payload.sessionId);
    if (alreadySubmitted) {
      return NextResponse.json({ error: "A review has already been submitted for this order." }, { status: 400 });
    }

    // Real customer city/country for the review byline, pulled fresh from the order.
    let location = "Verified Buyer";
    try {
      const session = await stripe.checkout.sessions.retrieve(payload.sessionId);
      const addr = session.collected_information?.shipping_details?.address || session.customer_details?.address;
      if (addr?.city && addr.country) {
        location = `${addr.city}, ${COUNTRY_NAME[addr.country] ?? addr.country}`;
      } else if (addr?.country) {
        location = COUNTRY_NAME[addr.country] ?? addr.country;
      }
    } catch {}

    let image: string | undefined;
    if (photo && photo.size > 0) {
      const ext = photo.type === "image/png" ? "png" : photo.type === "image/webp" ? "webp" : "jpg";
      const filename = `${payload.sessionId}-${Date.now()}.${ext}`;
      const base64 = Buffer.from(await photo.arrayBuffer()).toString("base64");
      image = await uploadImageToDir("images/reviews/customer-submitted", filename, base64);
    }

    const entry: PendingReview = {
      id:          `${payload.sessionId}-${Date.now()}`,
      sessionId:   payload.sessionId,
      category:    payload.category,
      productName: payload.productName,
      name,
      location,
      rating,
      headline,
      text,
      image,
      submittedAt: new Date().toISOString(),
    };

    const { reviews, sha } = await getPendingReviews();
    reviews.push(entry);
    await savePendingReviews(reviews, sha, `New pending review from ${name} (${payload.category})`);

    const FROM = process.env.RESEND_FROM_EMAIL;
    if (FROM) {
      await resend.emails.send({
        from:    `Bodystrands <${FROM}>`,
        to:      "storenavaria@gmail.com",
        subject: `New review awaiting approval — ${payload.category}`,
        html: `
          <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#2C2220;">
            <h2 style="font-weight:300;letter-spacing:0.05em;border-bottom:1px solid #E8B4A8;padding-bottom:12px;">New Review Submitted</h2>
            <p style="font-size:13px;"><strong>${name}</strong> (${location}) — ${rating}/5 stars</p>
            <p style="font-size:13px;font-weight:bold;">${headline}</p>
            <p style="font-size:13px;color:#5C4E47;">${text}</p>
            ${image ? `<img src="https://www.bodystrands.com${image}" width="200" style="width:200px;margin-top:12px;" />` : ""}
            <p style="font-size:12px;color:#8C7B6E;margin-top:24px;padding-top:16px;border-top:1px solid #E8B4A8;">
              Review it at <a href="https://www.bodystrands.com/admin/reviews" style="color:#A0622A;">bodystrands.com/admin/reviews</a>
            </p>
          </div>
        `,
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
