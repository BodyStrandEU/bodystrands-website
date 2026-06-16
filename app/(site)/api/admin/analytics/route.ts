import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { isValidToken, COOKIE_NAME } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return !!token && isValidToken(token);
}

function startOf(unit: "day" | "week" | "month"): number {
  const now = new Date();
  if (unit === "day") {
    return Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000);
  }
  if (unit === "week") {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return Math.floor(new Date(now.getFullYear(), now.getMonth(), diff).getTime() / 1000);
  }
  return Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const monthStart = startOf("month");
    const weekStart  = startOf("week");
    const dayStart   = startOf("day");

    // Fetch up to 100 paid sessions from the last 90 days for stats
    const ninetyDaysAgo = Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60;
    const allSessions = await stripe.checkout.sessions.list({
      limit: 100,
      created: { gte: ninetyDaysAgo },
    });
    const paid = allSessions.data.filter((s) => s.payment_status === "paid");

    // Revenue + order counts
    let revenueToday = 0, revenueWeek = 0, revenueMonth = 0, revenueAll = 0;
    let ordersToday = 0, ordersWeek = 0, ordersMonth = 0;
    const productMap: Record<string, { count: number; revenue: number }> = {};

    for (const s of paid) {
      const amt  = (s.amount_total ?? 0) / 100;
      const name = s.metadata?.productName ?? "Unknown";
      revenueAll += amt;
      if (!productMap[name]) productMap[name] = { count: 0, revenue: 0 };
      productMap[name].count++;
      productMap[name].revenue += amt;

      if (s.created >= monthStart) { revenueMonth += amt; ordersMonth++; }
      if (s.created >= weekStart)  { revenueWeek  += amt; ordersWeek++;  }
      if (s.created >= dayStart)   { revenueToday += amt; ordersToday++; }
    }

    const recentOrders = paid.slice(0, 15).map((s) => ({
      id:            s.id,
      productName:   s.metadata?.productName ?? "Unknown",
      amount:        (s.amount_total ?? 0) / 100,
      currency:      (s.currency ?? "eur").toUpperCase(),
      customerEmail: s.customer_details?.email ?? "—",
      customerName:  s.customer_details?.name ?? "—",
      createdAt:     s.created,
      paymentIntent: typeof s.payment_intent === "string" ? s.payment_intent : null,
    }));

    const topProducts = Object.entries(productMap)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10)
      .map(([name, data]) => ({ name, ...data }));

    return NextResponse.json({
      revenue: {
        today: revenueToday,
        week:  revenueWeek,
        month: revenueMonth,
        all:   revenueAll,
      },
      orders: {
        today: ordersToday,
        week:  ordersWeek,
        month: ordersMonth,
        all:   paid.length,
      },
      recentOrders,
      topProducts,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
