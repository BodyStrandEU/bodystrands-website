export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { isValidToken, COOKIE_NAME } from "@/lib/auth";
import { getPendingReviews, savePendingReviews, getCustomerReviews, saveCustomerReviews } from "@/lib/reviews-data";
import type { Review } from "@/data/category-reviews";

function checkAuth(req: NextRequest): boolean {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return !!token && isValidToken(token);
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { reviews } = await getPendingReviews();
    reviews.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    return NextResponse.json({ reviews });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json() as {
      id: string;
      action: "approve" | "reject";
      // Optional light edits before publishing
      name?: string; headline?: string; text?: string; rating?: number;
    };
    if (!body.id || !body.action) {
      return NextResponse.json({ error: "Missing id or action" }, { status: 400 });
    }

    const { reviews: pending, sha: pendingSha } = await getPendingReviews();
    const idx = pending.findIndex((r) => r.id === body.id);
    if (idx === -1) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    const [entry] = pending.splice(idx, 1);

    if (body.action === "approve") {
      const published: Review = {
        name:      body.name?.trim()     || entry.name,
        location:  entry.location,
        rating:    body.rating           ?? entry.rating,
        date:      new Date(entry.submittedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        headline:  body.headline?.trim() || entry.headline,
        text:      body.text?.trim()     || entry.text,
        sessionId: entry.sessionId, // prevents this order from submitting a second review later
        ...(entry.image ? { image: entry.image } : {}),
      };

      const { data: customerReviews, sha: customerSha } = await getCustomerReviews();
      customerReviews[entry.category] = [...(customerReviews[entry.category] ?? []), published];
      await saveCustomerReviews(customerReviews, customerSha, `Approve review from ${entry.name} (${entry.category})`);
    }

    await savePendingReviews(pending, pendingSha, `${body.action === "approve" ? "Approve" : "Reject"} review from ${entry.name}`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
