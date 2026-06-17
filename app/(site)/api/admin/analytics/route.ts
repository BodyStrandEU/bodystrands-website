import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { isValidToken, COOKIE_NAME } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return !!token && isValidToken(token);
}

function periodToRange(period: string): { gte: number; label: string; chartUnit: "hour" | "day" | "week"; chartPoints: number; ga4Start: string } {
  const now = Math.floor(Date.now() / 1000);
  switch (period) {
    case "today":
      return { gte: Math.floor(new Date(new Date().setHours(0, 0, 0, 0)).getTime() / 1000), label: "Today", chartUnit: "hour", chartPoints: 24, ga4Start: "today" };
    case "7d":
      return { gte: now - 7 * 86400, label: "Last 7 Days", chartUnit: "day", chartPoints: 7, ga4Start: "7daysAgo" };
    case "30d":
      return { gte: now - 30 * 86400, label: "Last 30 Days", chartUnit: "day", chartPoints: 30, ga4Start: "30daysAgo" };
    case "90d":
      return { gte: now - 90 * 86400, label: "Last 90 Days", chartUnit: "week", chartPoints: 13, ga4Start: "90daysAgo" };
    case "all":
      return { gte: 0, label: "All Time", chartUnit: "week", chartPoints: 52, ga4Start: "365daysAgo" };
    default:
      return { gte: now - 30 * 86400, label: "Last 30 Days", chartUnit: "day", chartPoints: 30, ga4Start: "30daysAgo" };
  }
}

function buildChartKeys(unit: "hour" | "day" | "week", points: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = points - 1; i >= 0; i--) {
    if (unit === "hour") {
      const d = new Date(now);
      d.setHours(d.getHours() - i, 0, 0, 0);
      keys.push(`${d.getHours()}:00`);
    } else if (unit === "day") {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      keys.push(`${d.getMonth() + 1}/${d.getDate()}`);
    } else {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      keys.push(`${d.getMonth() + 1}/${d.getDate()}`);
    }
  }
  return keys;
}

function sessionToChartKey(ts: number, unit: "hour" | "day" | "week"): string {
  const d = new Date(ts * 1000);
  if (unit === "hour") return `${d.getHours()}:00`;
  if (unit === "day")  return `${d.getMonth() + 1}/${d.getDate()}`;
  // week — round down to nearest Monday
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return `${monday.getMonth() + 1}/${monday.getDate()}`;
}

async function fetchGA4(propertyId: string, credJson: string, ga4Start: string) {
  const { BetaAnalyticsDataClient } = await import("@google-analytics/data");
  const creds  = JSON.parse(credJson) as Record<string, string>;
  const client = new BetaAnalyticsDataClient({ credentials: creds });
  const property   = `properties/${propertyId}`;
  const dateRanges = [{ startDate: ga4Start, endDate: "today" }];

  const [overview, sources, devices, countries, topPages, addToCartByProduct] = await Promise.all([
    client.runReport({ property, dateRanges, metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "engagementRate" }, { name: "newUsers" }] }),
    client.runReport({ property, dateRanges, dimensions: [{ name: "sessionDefaultChannelGroup" }], metrics: [{ name: "sessions" }], orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: "8" }),
    client.runReport({ property, dateRanges, dimensions: [{ name: "deviceCategory" }], metrics: [{ name: "sessions" }] }),
    client.runReport({ property, dateRanges, dimensions: [{ name: "country" }], metrics: [{ name: "sessions" }], orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: "8" }),
    client.runReport({ property, dateRanges, dimensions: [{ name: "pagePath" }], metrics: [{ name: "screenPageViews" }], orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }], limit: "10" }),
    client.runReport({ property, dateRanges, dimensions: [{ name: "itemName" }], metrics: [{ name: "addToCarts" }], orderBys: [{ metric: { metricName: "addToCarts" }, desc: true }], limit: "10" }),
  ]);

  const row0 = overview[0]?.rows?.[0]?.metricValues ?? [];
  const atcRows = addToCartByProduct[0]?.rows ?? [];
  return {
    sessions:       parseInt(row0[0]?.value ?? "0"),
    users:          parseInt(row0[1]?.value ?? "0"),
    engagementRate: parseFloat(row0[2]?.value ?? "0"),
    newUsers:       parseInt(row0[3]?.value ?? "0"),
    channels:  (sources[0]?.rows  ?? []).map((r) => ({ channel:  r.dimensionValues?.[0]?.value ?? "", sessions: parseInt(r.metricValues?.[0]?.value ?? "0") })),
    devices:   (devices[0]?.rows  ?? []).map((r) => ({ device:   r.dimensionValues?.[0]?.value ?? "", sessions: parseInt(r.metricValues?.[0]?.value ?? "0") })),
    countries: (countries[0]?.rows ?? []).map((r) => ({ country:  r.dimensionValues?.[0]?.value ?? "", sessions: parseInt(r.metricValues?.[0]?.value ?? "0") })),
    topPages:  (topPages[0]?.rows  ?? []).map((r) => ({ path:     r.dimensionValues?.[0]?.value ?? "", views:    parseInt(r.metricValues?.[0]?.value ?? "0") })),
    addToCartProducts: atcRows.map((r) => ({ name: r.dimensionValues?.[0]?.value ?? "", count: parseInt(r.metricValues?.[0]?.value ?? "0") })),
    totalAddToCarts: atcRows.reduce((sum, r) => sum + parseInt(r.metricValues?.[0]?.value ?? "0"), 0),
  };
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const period = request.nextUrl.searchParams.get("period") ?? "30d";
  const { gte, label, chartUnit, chartPoints, ga4Start } = periodToRange(period);

  try {
    const listOpts: Parameters<typeof stripe.checkout.sessions.list>[0] = { limit: 100 };
    if (gte > 0) listOpts.created = { gte };

    const allSessions = await stripe.checkout.sessions.list(listOpts);
    const paid = allSessions.data.filter((s) => s.payment_status === "paid");

    let revenue = 0, orderCount = 0;
    const productMap: Record<string, { count: number; revenue: number }> = {};
    const countryMap: Record<string, number> = {};
    const uniqueEmails = new Set<string>();

    // Build chart
    const chartKeys = buildChartKeys(chartUnit, chartPoints);
    const chartData: Record<string, number> = Object.fromEntries(chartKeys.map((k) => [k, 0]));

    for (const s of paid) {
      const amt     = (s.amount_total ?? 0) / 100;
      const name    = s.metadata?.productName ?? "Unknown";
      const email   = s.customer_details?.email;
      const country = s.customer_details?.address?.country ?? "Unknown";

      revenue += amt;
      orderCount++;
      if (email) uniqueEmails.add(email);
      if (!productMap[name]) productMap[name] = { count: 0, revenue: 0 };
      productMap[name].count++;
      productMap[name].revenue += amt;
      countryMap[country] = (countryMap[country] ?? 0) + 1;

      const key = sessionToChartKey(s.created, chartUnit);
      if (key in chartData) chartData[key] += amt;
    }

    const recentOrders = paid.slice(0, 20).map((s) => ({
      id:            s.id,
      productName:   s.metadata?.productName ?? "Unknown",
      amount:        (s.amount_total ?? 0) / 100,
      currency:      (s.currency ?? "eur").toUpperCase(),
      customerEmail: s.customer_details?.email ?? "—",
      customerName:  s.customer_details?.name ?? "—",
      country:       s.customer_details?.address?.country ?? "—",
      createdAt:     s.created,
      paymentIntent: typeof s.payment_intent === "string" ? s.payment_intent : null,
    }));

    const topProducts = Object.entries(productMap)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10)
      .map(([name, data]) => ({ name, ...data }));

    const topCountries = Object.entries(countryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([country, count]) => ({ country, count }));

    const aov = orderCount > 0 ? revenue / orderCount : 0;

    let ga4: Awaited<ReturnType<typeof fetchGA4>> | null = null;
    const ga4PropertyId = process.env.GA4_PROPERTY_ID;
    const ga4Creds      = process.env.GA4_SERVICE_ACCOUNT_JSON;
    if (ga4PropertyId && ga4Creds) {
      try { ga4 = await fetchGA4(ga4PropertyId, ga4Creds, ga4Start); }
      catch (e) { console.error("GA4 error:", e); }
    }

    return NextResponse.json({
      period,
      periodLabel: label,
      chartUnit,
      revenue,
      orderCount,
      aov,
      uniqueCustomers: uniqueEmails.size,
      chartData,
      recentOrders,
      topProducts,
      topCountries,
      ga4,
      ga4Ready: !!(ga4PropertyId && ga4Creds),
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
