"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Order = {
  id: string;
  productName: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  country: string;
  createdAt: number;
  paymentIntent: string | null;
};

type GA4Data = {
  sessions: number;
  users: number;
  engagementRate: number;
  channels:  { channel: string; sessions: number }[];
  devices:   { device: string; sessions: number }[];
  countries: { country: string; sessions: number }[];
  topPages:  { path: string; views: number }[];
};

type AnalyticsData = {
  revenue:         { today: number; week: number; month: number; all: number };
  orders:          { today: number; week: number; month: number; all: number };
  aov:             number;
  uniqueCustomers: number;
  revenueByDay:    Record<string, number>;
  recentOrders:    Order[];
  topProducts:     { name: string; count: number; revenue: number }[];
  topCountries:    { country: string; count: number }[];
  ga4:             GA4Data | null;
  ga4Ready:        boolean;
};

function fmt(n: number, currency = "EUR") {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency, maximumFractionDigits: 2 }).format(n);
}

function pct(n: number) { return `${(n * 100).toFixed(1)}%`; }

function timeAgo(ts: number) {
  const d = Math.floor(Date.now() / 1000) - ts;
  if (d < 60)    return `${d}s ago`;
  if (d < 3600)  return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return new Date(ts * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function MiniBar({ value, max, color = "#A0622A" }: { value: number; max: number; color?: string }) {
  const w = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return (
    <div style={{ background: "var(--admin-border)", borderRadius: 3, height: 6, flex: 1, overflow: "hidden" }}>
      <div style={{ width: `${w}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.4s ease" }} />
    </div>
  );
}

function RevenueChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(([, v]) => v), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80, padding: "0 4px" }}>
      {entries.map(([label, val]) => {
        const h = Math.max(2, Math.round((val / max) * 72));
        return (
          <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div
              title={`${label}: ${fmt(val)}`}
              style={{ width: "100%", height: h, background: val > 0 ? "#A0622A" : "var(--admin-border)", borderRadius: "2px 2px 0 0", transition: "height 0.3s ease" }}
            />
            {entries.length <= 14 && (
              <span style={{ fontSize: 9, color: "var(--admin-text-muted)", transform: "rotate(-45deg)", transformOrigin: "center", whiteSpace: "nowrap" }}>
                {label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

const card: React.CSSProperties = { background: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: 8, padding: "1.25rem" };
const label: React.CSSProperties = { fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--admin-text-muted)", marginBottom: "0.35rem" };
const bigNum: React.CSSProperties = { fontSize: "1.6rem", fontWeight: 300, color: "#A0622A", lineHeight: 1.1 };
const sub: React.CSSProperties = { fontSize: "0.65rem", color: "var(--admin-text-muted)", marginTop: "0.25rem" };
const sectionWrap: React.CSSProperties = { background: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: 8, overflow: "hidden", marginBottom: "1.25rem" };
const sHead: React.CSSProperties = { padding: "0.85rem 1.25rem", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--admin-text-muted)", borderBottom: "1px solid var(--admin-border)", display: "flex", justifyContent: "space-between", alignItems: "center" };
const th: React.CSSProperties = { padding: "0.6rem 1rem", fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--admin-text-muted)", textAlign: "left", background: "var(--admin-bg)", borderBottom: "1px solid var(--admin-border)" };
const td: React.CSSProperties = { padding: "0.7rem 1rem", fontSize: "0.75rem", borderBottom: "1px solid var(--admin-border2)", verticalAlign: "middle" };

export default function AnalyticsPage() {
  const [data, setData]       = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const router = useRouter();

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/analytics")
      .then((r) => { if (r.status === 401) { router.push("/admin/login"); return null; } return r.json() as Promise<AnalyticsData & { error?: string }>; })
      .then((d) => { if (!d) return; if ("error" in d && d.error) { setError(d.error); return; } setData(d); })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const page: React.CSSProperties = { minHeight: "100vh", background: "var(--admin-bg)", color: "var(--admin-text)", fontFamily: "Georgia, serif", padding: "0" };

  return (
    <div style={page}>
      {/* Header */}
      <div style={{ background: "var(--admin-surface)", borderBottom: "1px solid var(--admin-border)", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600, color: "var(--admin-text)" }}>Analytics</h1>
          <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--admin-text-muted)" }}>Last 90 days • Stripe data{data?.ga4Ready ? " + Google Analytics" : ""}</p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <button onClick={() => router.push("/admin/dashboard")} style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", background: "none", border: "none", cursor: "pointer" }}>← Dashboard</button>
          <button onClick={load} style={{ fontSize: "0.75rem", color: "#A0622A", background: "none", border: "1px solid #A0622A", borderRadius: 4, padding: "0.35rem 0.9rem", cursor: "pointer" }}>Refresh</button>
        </div>
      </div>

      <div style={{ padding: "1.5rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
        {loading && <p style={{ color: "var(--admin-text-muted)", fontSize: "0.8rem", padding: "2rem 0" }}>Loading analytics…</p>}
        {error   && <p style={{ color: "#c0392b", fontSize: "0.8rem" }}>{error}</p>}

        {data && (
          <>
            {/* ── Row 1: Revenue KPIs ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
              {[
                { label: "Today",      value: fmt(data.revenue.today),  sub: `${data.orders.today} order${data.orders.today !== 1 ? "s" : ""}` },
                { label: "This Week",  value: fmt(data.revenue.week),   sub: `${data.orders.week} orders` },
                { label: "This Month", value: fmt(data.revenue.month),  sub: `${data.orders.month} orders` },
                { label: "All Time",   value: fmt(data.revenue.all),    sub: `${data.orders.all} total orders` },
              ].map((item) => (
                <div key={item.label} style={card}>
                  <p style={label}>Revenue {item.label}</p>
                  <p style={bigNum}>{item.value}</p>
                  <p style={sub}>{item.sub}</p>
                </div>
              ))}
            </div>

            {/* ── Row 2: Other KPIs ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.25rem" }}>
              <div style={card}>
                <p style={label}>Avg Order Value</p>
                <p style={bigNum}>{fmt(data.aov)}</p>
                <p style={sub}>per transaction</p>
              </div>
              <div style={card}>
                <p style={label}>Unique Customers</p>
                <p style={bigNum}>{data.uniqueCustomers}</p>
                <p style={sub}>last 90 days</p>
              </div>
              {data.ga4 ? (
                <>
                  <div style={card}>
                    <p style={label}>Visitors (28d)</p>
                    <p style={bigNum}>{data.ga4.users.toLocaleString()}</p>
                    <p style={sub}>{data.ga4.sessions.toLocaleString()} sessions</p>
                  </div>
                  <div style={card}>
                    <p style={label}>Engagement Rate</p>
                    <p style={bigNum}>{pct(data.ga4.engagementRate)}</p>
                    <p style={sub}>last 28 days</p>
                  </div>
                </>
              ) : (
                <div style={{ ...card, gridColumn: "span 2", display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div>
                    <p style={{ ...label, marginBottom: "0.5rem" }}>Visitor Analytics</p>
                    <p style={{ fontSize: "0.72rem", color: "var(--admin-text-muted)", margin: 0, lineHeight: 1.6 }}>
                      Connect Google Analytics to see sessions, traffic sources, devices & top pages.<br />
                      <span style={{ color: "#A0622A", cursor: "pointer" }} onClick={() => document.getElementById("ga4-setup")?.scrollIntoView({ behavior: "smooth" })}>
                        See setup instructions below →
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Revenue Chart ── */}
            <div style={{ ...sectionWrap, marginBottom: "1.25rem" }}>
              <div style={sHead}><span>Revenue — Last 14 Days</span></div>
              <div style={{ padding: "1.25rem 1rem 0.5rem" }}>
                <RevenueChart data={data.revenueByDay} />
              </div>
            </div>

            {/* ── Two column: Top Products + Traffic Sources ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
              {/* Top Products */}
              <div style={sectionWrap}>
                <div style={sHead}><span>Top Products</span><span style={{ fontSize: "0.6rem" }}>by revenue</span></div>
                {data.topProducts.length === 0 ? (
                  <p style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>No sales yet.</p>
                ) : (
                  <div style={{ padding: "0.75rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {data.topProducts.map((p) => (
                      <div key={p.name}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: "0.72rem", color: "var(--admin-text)" }}>{p.name}</span>
                          <span style={{ fontSize: "0.72rem", color: "#A0622A", fontWeight: "bold" }}>{fmt(p.revenue)}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <MiniBar value={p.revenue} max={data.topProducts[0]?.revenue ?? 1} />
                          <span style={{ fontSize: "0.6rem", color: "var(--admin-text-muted)", whiteSpace: "nowrap" }}>{p.count} sold</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Traffic Sources (GA4) or Countries from Stripe */}
              <div style={sectionWrap}>
                {data.ga4 ? (
                  <>
                    <div style={sHead}><span>Traffic Sources</span><span style={{ fontSize: "0.6rem" }}>last 28 days</span></div>
                    <div style={{ padding: "0.75rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {data.ga4.channels.map((c) => (
                        <div key={c.channel}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: "0.72rem", color: "var(--admin-text)", textTransform: "capitalize" }}>{c.channel || "Direct"}</span>
                            <span style={{ fontSize: "0.72rem", color: "var(--admin-text-muted)" }}>{c.sessions.toLocaleString()} sessions</span>
                          </div>
                          <MiniBar value={c.sessions} max={data.ga4!.channels[0]?.sessions ?? 1} color="#6B8E6B" />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={sHead}><span>Customer Countries</span><span style={{ fontSize: "0.6rem" }}>from orders</span></div>
                    {data.topCountries.length === 0 ? (
                      <p style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>No data yet.</p>
                    ) : (
                      <div style={{ padding: "0.75rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {data.topCountries.map((c) => (
                          <div key={c.country}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                              <span style={{ fontSize: "0.72rem", color: "var(--admin-text)" }}>{c.country}</span>
                              <span style={{ fontSize: "0.72rem", color: "var(--admin-text-muted)" }}>{c.count} order{c.count !== 1 ? "s" : ""}</span>
                            </div>
                            <MiniBar value={c.count} max={data.topCountries[0]?.count ?? 1} color="#6B8E6B" />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* ── GA4 extended (if connected) ── */}
            {data.ga4 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
                {/* Devices */}
                <div style={sectionWrap}>
                  <div style={sHead}><span>Devices</span></div>
                  <div style={{ padding: "0.75rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {data.ga4.devices.map((d) => {
                      const total = data.ga4!.devices.reduce((a, b) => a + b.sessions, 0);
                      return (
                        <div key={d.device}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: "0.72rem", color: "var(--admin-text)", textTransform: "capitalize" }}>{d.device}</span>
                            <span style={{ fontSize: "0.72rem", color: "var(--admin-text-muted)" }}>{total > 0 ? Math.round(d.sessions / total * 100) : 0}%</span>
                          </div>
                          <MiniBar value={d.sessions} max={data.ga4!.devices[0]?.sessions ?? 1} color="#8B7355" />
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Countries (GA4) */}
                <div style={sectionWrap}>
                  <div style={sHead}><span>Visitor Countries</span></div>
                  <div style={{ padding: "0.75rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {data.ga4.countries.map((c) => (
                      <div key={c.country}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: "0.72rem", color: "var(--admin-text)" }}>{c.country}</span>
                          <span style={{ fontSize: "0.72rem", color: "var(--admin-text-muted)" }}>{c.sessions.toLocaleString()}</span>
                        </div>
                        <MiniBar value={c.sessions} max={data.ga4!.countries[0]?.sessions ?? 1} color="#6B8E6B" />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Top pages */}
                <div style={sectionWrap}>
                  <div style={sHead}><span>Top Pages</span></div>
                  <div style={{ padding: "0.75rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {data.ga4.topPages.map((p) => (
                      <div key={p.path}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: "0.68rem", color: "var(--admin-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>{p.path}</span>
                          <span style={{ fontSize: "0.72rem", color: "var(--admin-text-muted)" }}>{p.views.toLocaleString()}</span>
                        </div>
                        <MiniBar value={p.views} max={data.ga4!.topPages[0]?.views ?? 1} color="#A0622A" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Recent Orders ── */}
            <div style={sectionWrap}>
              <div style={sHead}><span>Recent Orders</span><span style={{ fontSize: "0.6rem" }}>{data.orders.all} total</span></div>
              {data.recentOrders.length === 0 ? (
                <p style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>No orders yet.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Time", "Product", "Customer", "Country", "Amount", ""].map((h) => (
                        <th key={h} style={th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((o) => (
                      <tr key={o.id} style={{ transition: "background 0.15s" }}>
                        <td style={{ ...td, color: "var(--admin-text-muted)", whiteSpace: "nowrap", fontSize: "0.68rem" }}>{timeAgo(o.createdAt)}</td>
                        <td style={{ ...td, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.productName}</td>
                        <td style={{ ...td }}>
                          <div style={{ fontSize: "0.72rem" }}>{o.customerName}</div>
                          <div style={{ fontSize: "0.62rem", color: "var(--admin-text-muted)" }}>{o.customerEmail}</div>
                        </td>
                        <td style={{ ...td, fontSize: "0.68rem", color: "var(--admin-text-muted)" }}>{o.country}</td>
                        <td style={{ ...td, color: "#A0622A", fontWeight: "bold", whiteSpace: "nowrap" }}>{fmt(o.amount, o.currency)}</td>
                        <td style={{ ...td, textAlign: "right" }}>
                          {o.paymentIntent && (
                            <a href={`https://dashboard.stripe.com/payments/${o.paymentIntent}`} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: "0.58rem", color: "#A0622A", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", border: "1px solid #A0622A", borderRadius: 3, padding: "0.2rem 0.5rem" }}>
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

            {/* ── GA4 Setup Instructions (if not connected) ── */}
            {!data.ga4Ready && (
              <div id="ga4-setup" style={{ ...sectionWrap, border: "1px solid #A0622A33" }}>
                <div style={{ ...sHead, color: "#A0622A" }}><span>Connect Google Analytics — Unlock Visitor Data</span></div>
                <div style={{ padding: "1.25rem", fontSize: "0.78rem", lineHeight: 1.8, color: "var(--admin-text-muted)" }}>
                  <p style={{ marginTop: 0 }}>Once connected, this dashboard will also show: <strong style={{ color: "var(--admin-text)" }}>sessions, traffic sources (organic/social/paid/direct), device breakdown (mobile/desktop), visitor countries, and top pages.</strong></p>
                  <p>Follow these steps <strong style={{ color: "var(--admin-text)" }}>once</strong> — takes about 10 minutes:</p>
                  <ol style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <li>Go to <strong>console.cloud.google.com</strong> → create a project (or use an existing one)</li>
                    <li>In the project, search for <strong>Google Analytics Data API</strong> and enable it</li>
                    <li>Go to <strong>IAM &amp; Admin → Service Accounts</strong> → Create Service Account → name it anything → no special roles needed → Done</li>
                    <li>Click the service account → <strong>Keys tab → Add Key → JSON</strong> → download the file</li>
                    <li>In <strong>Google Analytics</strong> (analytics.google.com) → Admin → Property Access Management → add the service account email (ends in <code>@...iam.gserviceaccount.com</code>) as <strong>Viewer</strong></li>
                    <li>In <strong>GA4 Admin → Property Settings</strong> → copy your <strong>Property ID</strong> (a number like 123456789)</li>
                    <li>Send me: the downloaded JSON file contents + the Property ID number → I&apos;ll add them as environment variables and the visitor section will appear automatically</li>
                  </ol>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
