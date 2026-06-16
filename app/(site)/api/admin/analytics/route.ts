import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { isValidToken, COOKIE_NAME } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return !!token && isValidToken(token);
}

function startOfDay(daysAgo = 0): number {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 1000);
}

function startOf(unit: "week" | "month"): number {
  const now = new Date();
  if (unit === "week") {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return Math.floor(new Date(now.getFullYear(), now.getMonth(), diff).getTime() / 1000);
  }
  return Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);
}

// ---- GA4 Data API (optional — only runs if credentials are configured) ----
async function fetchGA4(propertyId: string, credJson: string) {
  const { BetaAnalyticsDataClient } = await import("@google-analytics/data");
  const creds = JSON.parse(credJson) as Record<string, string>;
  const client = new BetaAnalyticsDataClient({ credentials: creds });
  const property = `properties/${propertyId}`;
  const dateRanges = [{ startDate: "28daysAgo", endDate: "today" }];

  const [sessions, sources, devices, countries, topPages] = await Promise.all([
    // Users + sessions
    client.runReport({ property, dateRanges, metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "engagementRate" }, { name: "conversions" }] }),
    // Traffic channels
    client.runReport({ property, dateRanges, dimensions: [{ name: "sessionDefaultChannelGroup" }], metrics: [{ name: "sessions" }], orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: "8" }),
    // Devices
    client.runReport({ property, dateRanges, dimensions: [{ name: "deviceCategory" }], metrics: [{ name: "sessions" }] }),
    // Countries
    client.runReport({ property, dateRanges, dimensions: [{ name: "country" }], metrics: [{ name: "sessions" }], orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: "8" }),
    // Top pages
    client.runReport({ property, dateRanges, dimensions: [{ name: "pagePath" }], metrics: [{ name: "screenPageViews" }], orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }], limit: "10" }),
  ]);

  const row0 = sessions[0]?.rows?.[0]?.metricValues ?? [];
  return {
    sessions:       parseInt(row0[0]?.value ?? "0"),
    users:          parseInt(row0[1]?.value ?? "0"),
    engagementRate: parseFloat(row0[2]?.value ?? "0"),
    channels: (sources[0]?.rows ?? []).map((r) => ({
      channel: r.dimensionValues?.[0]?.value ?? "",
      sessions: parseInt(r.metricValues?.[0]?.value ?? "0"),
    })),
    devices: (devices[0]?.rows ?? []).map((r) => ({
      device:   r.dimensionValues?.[0]?.value ?? "",
      sessions: parseInt(r.metricValues?.[0]?.value ?? "0"),
    })),
    countries: (countries[0]?.rows ?? []).map((r) => ({
      country:  r.dimensionValues?.[0]?.value ?? "",
      sessions: parseInt(r.metricValues?.[0]?.value ?? "0"),
    })),
    topPages: (topPages[0]?.rows ?? []).map((r) => ({
      path:   r.dimensionValues?.[0]?.value ?? "",
      views:  parseInt(r.metricValues?.[0]?.value ?? "0"),
    })),
  };
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dayStart   = startOfDay(0);
    const weekStart  = startOf("week");
    const monthStart = startOf("month");
    const ninetyDaysAgo = startOfDay(90);

    // Fetch up to 100 paid sessions from last 90 days
    const allSessions = await stripe.checkout.sessions.list({
      limit: 100,
      created: { gte: ninetyDaysAgo },
    });
    const paid = allSessions.data.filter((s) => s.payment_status === "paid");

    let revenueToday = 0, revenueWeek = 0, revenueMonth = 0, revenueAll = 0;
    let ordersToday = 0, ordersWeek = 0, ordersMonth = 0;
    const productMap: Record<string, { count: number; revenue: number }> = {};
    const countryMap: Record<string, number> = {};
    const revenueByDay: Record<string, number> = {};
    const uniqueEmails = new Set<string>();

    // Build last-14-days key map
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      revenueByDay[key] = 0;
    }

    for (const s of paid) {
      const amt    = (s.amount_total ?? 0) / 100;
      const name   = s.metadata?.productName ?? "Unknown";
      const email  = s.customer_details?.email;
      const country = s.customer_details?.address?.country ?? "Unknown";

      revenueAll += amt;
      if (email) uniqueEmails.add(email);
      if (!productMap[name]) productMap[name] = { count: 0, revenue: 0 };
      productMap[name].count++;
      productMap[name].revenue += amt;
      countryMap[country] = (countryMap[country] ?? 0) + 1;

      if (s.created >= monthStart) { revenueMonth += amt; ordersMonth++; }
      if (s.created >= weekStart)  { revenueWeek  += amt; ordersWeek++;  }
      if (s.created >= dayStart)   { revenueToday += amt; ordersToday++; }

      // Revenue by day (last 14 days)
      if (s.created >= startOfDay(13)) {
        const d = new Date(s.created * 1000);
        const key = `${d.getMonth() + 1}/${d.getDate()}`;
        if (key in revenueByDay) revenueByDay[key] += amt;
      }
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

    const aov = paid.length > 0 ? revenueAll / paid.length : 0;

    // GA4 — only if credentials are set
    let ga4: Awaited<ReturnType<typeof fetchGA4>> | null = null;
    const ga4PropertyId = process.env.GA4_PROPERTY_ID;
    const ga4Creds      = process.env.GA4_SERVICE_ACCOUNT_JSON;
    if (ga4PropertyId && ga4Creds) {
      try { ga4 = await fetchGA4(ga4PropertyId, ga4Creds); }
      catch (e) { console.error("GA4 error:", e); }
    }

    return NextResponse.json({
      revenue:    { today: revenueToday, week: revenueWeek, month: revenueMonth, all: revenueAll },
      orders:     { today: ordersToday,  week: ordersWeek,  month: ordersMonth,  all: paid.length },
      aov,
      uniqueCustomers: uniqueEmails.size,
      revenueByDay,
      recentOrders,
      topProducts,
      topCountries,
      ga4,
      ga4Ready: !!(ga4PropertyId && ga4Creds),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
