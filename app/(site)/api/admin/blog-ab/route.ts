export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { isValidToken, COOKIE_NAME } from "@/lib/auth";
import { ga4Client } from "@/lib/ga4";
import blogPosts from "@/data/blog-posts.json";

// Research-model A/B test (started Sep 25, 2026): Monday keyword research runs on
// Opus, Thursday on Sonnet; posts built from that research carry `researchModel`.
// This compares their GA4 traffic since the test started.
// GET /api/admin/blog-ab?start=2026-09-25
function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return !!token && isValidToken(token);
}

type Post = { slug: string; title: string; date: string; source?: string; researchModel?: string };

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const propertyId = process.env.GA4_PROPERTY_ID;
  const creds = process.env.GA4_SERVICE_ACCOUNT_JSON;
  if (!propertyId || !creds) return NextResponse.json({ error: "GA4 is not configured" }, { status: 500 });

  const start = request.nextUrl.searchParams.get("start") ?? "2026-09-25";
  const posts = (blogPosts as Post[]).filter((p) => p.researchModel && p.date >= start);

  try {
    const runReport = await ga4Client(propertyId, creds);
    const report = await runReport({
      dateRanges: [{ startDate: start, endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }, { name: "sessions" }, { name: "userEngagementDuration" }],
      dimensionFilter: { filter: { fieldName: "pagePath", stringFilter: { matchType: "BEGINS_WITH", value: "/blog/" } } },
      limit: "1000",
    });

    const byPath = new Map(
      (report.rows ?? []).map((r) => [
        r.dimensionValues?.[0]?.value ?? "",
        {
          views: parseInt(r.metricValues?.[0]?.value ?? "0"),
          sessions: parseInt(r.metricValues?.[1]?.value ?? "0"),
          engagementSeconds: parseFloat(r.metricValues?.[2]?.value ?? "0"),
        },
      ]),
    );

    const rows = posts.map((p) => {
      const m = byPath.get(`/blog/${p.slug}`) ?? { views: 0, sessions: 0, engagementSeconds: 0 };
      return { model: p.researchModel!, slug: p.slug, title: p.title, date: p.date, ...m };
    });

    const models = [...new Set(rows.map((r) => r.model))].map((model) => {
      const mine = rows.filter((r) => r.model === model);
      const views = mine.reduce((s, r) => s + r.views, 0);
      const engagement = mine.reduce((s, r) => s + r.engagementSeconds, 0);
      return {
        model,
        posts: mine.length,
        totalViews: views,
        viewsPerPost: mine.length ? +(views / mine.length).toFixed(1) : 0,
        engagedSecondsPerView: views ? +(engagement / views).toFixed(1) : 0,
      };
    });

    return NextResponse.json({ start, models, posts: rows.sort((a, b) => b.views - a.views) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
}
