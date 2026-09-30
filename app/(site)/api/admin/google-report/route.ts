export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { isValidToken, COOKIE_NAME } from "@/lib/auth";
import { ga4Client } from "@/lib/ga4";
import { gscClient, pickSite } from "@/lib/gsc";

// Admin-only, read-only passthrough for ad-hoc GA4 / Search Console reports
// (traffic investigations, blog reviews) without adding a dashboard view per question.
// POST { "api": "ga4", "body": <runReport body> }
// POST { "api": "gsc", "body": <searchAnalytics.query body> }
function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return !!token && isValidToken(token);
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const propertyId = process.env.GA4_PROPERTY_ID;
  const creds = process.env.GA4_SERVICE_ACCOUNT_JSON;
  if (!propertyId || !creds) return NextResponse.json({ error: "Google APIs are not configured" }, { status: 500 });

  const { api, body } = (await request.json()) as { api?: string; body?: Record<string, unknown> };
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
