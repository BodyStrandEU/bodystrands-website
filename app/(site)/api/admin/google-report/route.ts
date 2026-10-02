export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { isValidToken, COOKIE_NAME } from "@/lib/auth";
import { ga4Client } from "@/lib/ga4";
import { gscClient, pickSite } from "@/lib/gsc";
import { getAccessToken } from "@/lib/ga4";

// Admin-only, read-only passthrough for ad-hoc GA4 / Search Console reports
// (traffic investigations, blog reviews) without adding a dashboard view per question.
// POST { "api": "ga4", "body": <runReport body> }
// POST { "api": "gsc", "body": <searchAnalytics.query body> }
// POST { "api": "merchant", "path": "/products/v1/accounts/5815764017/products", "method"?: "GET"|"POST", "body"?: {...} }
//   (Merchant API, read-only scope; the service account is a Standard user on Merchant Center)
function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return !!token && isValidToken(token);
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const propertyId = process.env.GA4_PROPERTY_ID;
  const creds = process.env.GA4_SERVICE_ACCOUNT_JSON;
  if (!propertyId || !creds) return NextResponse.json({ error: "Google APIs are not configured" }, { status: 500 });

  const { api, body, path, method } = (await request.json()) as { api?: string; body?: Record<string, unknown>; path?: string; method?: string };
  if (api === "merchant") {
    if (!path || !path.startsWith("/") || path.includes("..")) return NextResponse.json({ error: "Send a Merchant API path" }, { status: 400 });
    try {
      // content scope is required by the Merchant API even for reads; access is limited
      // to what the service account's Merchant Center role (Standard) allows.
      const token = await getAccessToken(creds, "https://www.googleapis.com/auth/content");
      const res = await fetch(`https://merchantapi.googleapis.com${path}`, {
        method: method === "POST" ? "POST" : "GET",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        ...(method === "POST" && body ? { body: JSON.stringify(body) } : {}),
      });
      return NextResponse.json(await res.json(), { status: res.ok ? 200 : 502 });
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 502 });
    }
  }
  if (!body || (api !== "ga4" && api !== "gsc")) {
    return NextResponse.json({ error: 'Send { api: "ga4" | "gsc", body }' }, { status: 400 });
  }

  try {
    if (api === "ga4") {
      const runReport = await ga4Client(propertyId, creds);
      return NextResponse.json(await runReport(body));
    }
    const gsc = await gscClient(creds);
    const site = pickSite(await gsc.sites());
    if (!site) return NextResponse.json({ error: "No Search Console property available" }, { status: 502 });
    return NextResponse.json({ site, rows: await gsc.query(site, body) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
}
