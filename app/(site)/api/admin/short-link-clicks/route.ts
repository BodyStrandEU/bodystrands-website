export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isValidToken, COOKIE_NAME } from "@/lib/auth";
import { SHORT_LINKS } from "@/lib/shortlink";

// Clicks on the social short links (/ig, /tiktok, /yt, /pin, /fb), per platform per day.
// ?days=30 (default 30, max 90).
export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token || !isValidToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const kv = getCloudflareContext().env.WISHLIST_LIKES;
  if (!kv) return NextResponse.json({ error: "KV not available" }, { status: 500 });

  const days = Math.min(90, Math.max(1, parseInt(request.nextUrl.searchParams.get("days") ?? "30", 10) || 30));
  const dates: string[] = [];
  for (let i = 0; i < days; i++) dates.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));

  const out: Record<string, { total: number; byDay: Record<string, number> }> = {};
  for (const slug of Object.keys(SHORT_LINKS)) {
    const counts: (string | null)[] = await Promise.all(dates.map((d) => kv.get(`clicks:${slug}:${d}`)));
    const byDay: Record<string, number> = {};
    let total = 0;
    counts.forEach((v: string | null, i: number) => {
      const n = parseInt(v ?? "0", 10) || 0;
      if (n) byDay[dates[i]] = n;
      total += n;
    });
    out[slug] = { total, byDay };
  }
  return NextResponse.json({ days, clicks: out });
}
