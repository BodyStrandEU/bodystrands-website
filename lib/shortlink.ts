import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Short links for social bios (bodystrands.com/ig, /tiktok, /yt, /pin, /fb). Each one tags the visit
// with utm params so GA4 shows the platform, and counts the click server-side (a number per
// platform per day in KV, no cookies, no personal data), so the count works even when an EU
// visitor declines the cookie banner.
export const SHORT_LINKS = {
  ig: "instagram",
  tiktok: "tiktok",
  yt: "youtube",
  pin: "pinterest",
  fb: "facebook",
} as const;

export type ShortLink = keyof typeof SHORT_LINKS;

const BOT = /bot|crawler|spider|preview|facebookexternalhit|headless|curl|wget|python|node-fetch/i;

export async function shortLink(request: NextRequest, slug: ShortLink) {
  const ua = request.headers.get("user-agent") ?? "";
  if (!BOT.test(ua)) {
    try {
      const kv = getCloudflareContext().env.WISHLIST_LIKES;
      if (kv) {
        const key = `clicks:${slug}:${new Date().toISOString().slice(0, 10)}`;
        const n = parseInt((await kv.get(key)) ?? "0", 10) || 0;
        await kv.put(key, String(n + 1));
      }
    } catch {
      // Counting must never stop the redirect.
    }
  }
  const dest = new URL("/", request.url);
  dest.searchParams.set("utm_source", SHORT_LINKS[slug]);
  dest.searchParams.set("utm_medium", "social");
  dest.searchParams.set("utm_campaign", "bio");
  return NextResponse.redirect(dest, 307);
}
