"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Order = {
  id: string;
  productName: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  createdAt: number;
  paymentIntent: string | null;
};

type TopProduct = { name: string; count: number; revenue: number };

type AnalyticsData = {
  revenue: { today: number; week: number; month: number; all: number };
  orders:  { today: number; week: number; month: number; all: number };
  recentOrders: Order[];
  topProducts:  TopProduct[];
};

function fmt(amount: number, currency = "EUR") {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency }).format(amount);
}

function timeAgo(unixTs: number) {
  const diff = Math.floor(Date.now() / 1000) - unixTs;
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const s: Record<string, React.CSSProperties> = {
  page:    { minHeight: "100vh", background: "var(--admin-bg)", color: "var(--admin-text)", fontFamily: "Georgia, serif", padding: "2rem 1.5rem" },
  header:  { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" },
  title:   { fontSize: "1.5rem", fontWeight: 300, letterSpacing: "0.05em" },
  nav:     { display: "flex", gap: "1rem" },
  navLink: { fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "var(--admin-text-muted)", textDecoration: "none", cursor: "pointer" },
  grid:    { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" },
  card:    { background: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: "6px", padding: "1.25rem" },
  label:   { fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "var(--admin-text-muted)", marginBottom: "0.4rem" },
  value:   { fontSize: "1.5rem", fontWeight: 300, color: "#A0622A" },
  sub:     { fontSize: "0.65rem", color: "var(--admin-text-muted)", marginTop: "0.2rem" },
  section: { background: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: "6px", marginBottom: "1.5rem", overflow: "hidden" },
  thead:   { background: "var(--admin-bg)", borderBottom: "1px solid var(--admin-border)" },
  th:      { padding: "0.7rem 1rem", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "var(--admin-text-muted)", textAlign: "left" as const },
  td:      { padding: "0.75rem 1rem", fontSize: "0.75rem", borderBottom: "1px solid var(--admin-border2)" },
  sTitle:  { padding: "1rem 1.25rem", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "var(--admin-text-muted)", borderBottom: "1px solid var(--admin-border)" },
};

export default function AnalyticsPage() {
  const [data, setData]       = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => {
        if (r.status === 401) { router.push("/admin/login"); return null; }
        return r.json() as Promise<AnalyticsData & { error?: string }>;
      })
      .then((d) => {
        if (!d) return;
        if ("error" in d) { setError(d.error ?? "Error"); return; }
        setData(d);
      })
      .catch(() => setError("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div style={s.page}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={s.header}>
          <h1 style={s.title}>Analytics</h1>
          <nav style={s.nav}>
            <span style={s.navLink} onClick={() => router.push("/admin/dashboard")}>← Dashboard</span>
            <span style={s.navLink} onClick={() => { setLoading(true); fetch("/api/admin/analytics").then(r => r.json() as Promise<AnalyticsData>).then(setData).finally(() => setLoading(false)); }}>
              Refresh
            </span>
          </nav>
        </div>

        {loading && <p style={{ color: "var(--admin-text-muted)", fontSize: "0.8rem" }}>Loading…</p>}
        {error   && <p style={{ color: "#c0392b",                  fontSize: "0.8rem" }}>{error}</p>}

        {data && (
          <>
            {/* Revenue cards */}
            <div style={s.grid}>
              {[
                { label: "Revenue Today",    value: fmt(data.revenue.today), sub: `${data.orders.today} order${data.orders.today !== 1 ? "s" : ""}` },
                { label: "Revenue This Week", value: fmt(data.revenue.week),  sub: `${data.orders.week} orders` },
                { label: "Revenue This Month",value: fmt(data.revenue.month), sub: `${data.orders.month} orders` },
                { label: "All Time Revenue",  value: fmt(data.revenue.all),   sub: `${data.orders.all} total orders` },
              ].map((item) => (
                <div key={item.label} style={s.card}>
                  <p style={s.label}>{item.label}</p>
                  <p style={s.value}>{item.value}</p>
                  <p style={s.sub}>{item.sub}</p>
                </div>
              ))}
            </div>

            {/* Recent orders */}
            <div style={s.section}>
              <p style={s.sTitle}>Recent Orders</p>
              {data.recentOrders.length === 0 ? (
                <p style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>No orders yet.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={s.thead}>
                    <tr>
                      {["Time", "Product", "Customer", "Amount", ""].map((h) => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((o) => (
                      <tr key={o.id}>
                        <td style={{ ...s.td, color: "var(--admin-text-muted)", whiteSpace: "nowrap" as const }}>{timeAgo(o.createdAt)}</td>
                        <td style={s.td}>{o.productName}</td>
                        <td style={{ ...s.td, color: "var(--admin-text-muted)" }}>
                          <div>{o.customerName}</div>
                          <div style={{ fontSize: "0.65rem" }}>{o.customerEmail}</div>
                        </td>
                        <td style={{ ...s.td, color: "#A0622A", fontWeight: "bold" }}>{fmt(o.amount, o.currency)}</td>
                        <td style={s.td}>
                          {o.paymentIntent && (
                            <a
                              href={`https://dashboard.stripe.com/payments/${o.paymentIntent}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: "0.6rem", color: "#A0622A", letterSpacing: "0.1em", textTransform: "uppercase" as const }}
                            >
                              Stripe →
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Top products */}
            {data.topProducts.length > 0 && (
              <div style={s.section}>
                <p style={s.sTitle}>Top Products (last 90 days)</p>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={s.thead}>
                    <tr>
                      {["Product", "Orders", "Revenue"].map((h) => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.topProducts.map((p) => (
                      <tr key={p.name}>
                        <td style={s.td}>{p.name}</td>
                        <td style={{ ...s.td, color: "var(--admin-text-muted)" }}>{p.count}</td>
                        <td style={{ ...s.td, color: "#A0622A" }}>{fmt(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
