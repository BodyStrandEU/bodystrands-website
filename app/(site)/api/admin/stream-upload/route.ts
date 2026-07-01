import { NextRequest, NextResponse } from "next/server";
import { isValidToken, COOKIE_NAME } from "@/lib/auth";

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return !!token && isValidToken(token);
}

// GET: returns a one-time Cloudflare direct upload URL — browser uploads straight to CF, bypassing Vercel's 4.5MB body limit
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token    = process.env.CF_STREAM_TOKEN;
  const account  = process.env.CF_ACCOUNT_ID;
  const customer = process.env.CF_CUSTOMER_SUBDOMAIN;

  if (!token || !account || !customer) {
    return NextResponse.json({ error: "Cloudflare Stream not configured" }, { status: 500 });
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account}/stream/direct_upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ maxDurationSeconds: 3600 }),
    }
  );

  const data = await res.json() as { success: boolean; result?: { uid: string; uploadURL: string }; errors?: unknown[] };

  if (!data.success || !data.result) {
    return NextResponse.json({ error: "Failed to get upload URL", details: data.errors }, { status: 500 });
  }

  const { uid, uploadURL } = data.result;
  const streamUrl = `https://${customer}.cloudflarestream.com/${uid}/downloads/default.mp4`;

  return NextResponse.json({ uploadURL, streamUrl });
}
