"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const PERIODS = [
  { key: "today", label: "Today" },
  { key: "7d",    label: "7 Days" },
  { key: "30d",   label: "30 Days" },
  { key: "90d",   label: "90 Days" },
  { key: "all",   label: "All Time" },
] as const;

type PeriodKey = (typeof PERIODS)[number]["key"];

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
  newUsers: number;
  channels:  { channel: string; sessions: number }[];
  sources:   { source: string; medium: string; sessions: number }[];
  devices:   { device: string; sessions: number }[];
  countries: { country: string; sessions: number }[];
  topPages:  { path: string; views: number }[];
  addToCartProducts: { name: string; count: number }[];
  totalAddToCarts: number;
};

type AnalyticsData = {
  period:          string;
  periodLabel:     string;
  chartUnit:       "hour" | "day" | "week";
  revenue:         number;
  orderCount:      number;
  aov:             number;
  uniqueCustomers: number;
  chartData:       Record<string, number>;
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
      <div style={{ width: `${w}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.5s ease" }} />
    </div>
  );
}

function RevenueChart({ data, unit }: { data: Record<string, number>; unit: string }) {
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(([, v]) => v), 1);
  const showLabels = entries.length <= 30;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: entries.length > 30 ? 2 : 4, height: 90, padding: "0 4px" }}>
      {entries.map(([label, val]) => {
        const h = Math.max(2, Math.round((val / max) * 76));
        return (
          <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div
              title={`${label}: ${fmt(val)}`}
              style={{
                width: "100%",
                height: h,
                background: val > 0 ? "#A0622A" : "var(--admin-border)",
                borderRadius: "2px 2px 0 0",
                transition: "height 0.4s ease",
                cursor: "default",
              }}
            />
            {showLabels && (
              <span style={{ fontSize: 8, color: "var(--admin-text-muted)", transform: unit === "hour" ? "none" : "rotate(-45deg)", transformOrigin: "center", whiteSpace: "nowrap", lineHeight: 1 }}>
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
const lbl: React.CSSProperties  = { fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--admin-text-muted)", marginBottom: "0.35rem" };
const big: React.CSSProperties  = { fontSize: "1.6rem", fontWeight: 300, color: "#A0622A", lineHeight: 1.1 };
const sub: React.CSSProperties  = { fontSize: "0.63rem", color: "var(--admin-text-muted)", marginTop: "0.25rem" };
const sec: React.CSSProperties  = { background: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: 8, overflow: "hidden", marginBottom: "1.25rem" };
const sh:  React.CSSProperties  = { padding: "0.85rem 1.25rem", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--admin-text-muted)", borderBottom: "1px solid var(--admin-border)", display: "flex", justifyContent: "space-between", alignItems: "center" };
const th:  React.CSSProperties  = { padding: "0.6rem 1rem", fontSize: "0.53rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--admin-text-muted)", textAlign: "left", background: "var(--admin-bg)", borderBottom: "1px solid var(--admin-border)" };
const td:  React.CSSProperties  = { padding: "0.7rem 1rem", fontSize: "0.75rem", borderBottom: "1px solid var(--admin-border2)", verticalAlign: "middle" };

export default function AnalyticsPage() {
  const [data, setData]       = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [period, setPeriod]   = useState<PeriodKey>("30d");
  const router = useRouter();

  const load = useCallback((p: PeriodKey) => {
    setLoading(true);
    setError("");
    fetch(`/api/admin/analytics?period=${p}`)
      .then((r) => { if (r.status === 401) { router.push("/admin/login"); return null; } return r.json() as Promise<AnalyticsData & { error?: string }>; })
      .then((d) => { if (!d) return; if ("error" in d && d.error) { setError(d.error); return; } setData(d); })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => { load(period); }, [load, period]);

  function switchPeriod(p: PeriodKey) {
    setPeriod(p);
    setData(null);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--admin-bg)", color: "var(--admin-text)", fontFamily: "Georgia, serif" }}>

      {/* Header */}
      <div style={{ background: "var(--admin-surface)", borderBottom: "1px solid var(--admin-border)", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600, color: "var(--admin-text)" }}>Analytics</h1>
          <p style={{ margin: 0, fontSize: "0.68rem", color: "var(--admin-text-muted)" }}>
            {data ? data.periodLabel : "Loading…"}{data?.ga4Ready ? " • Stripe + Google Analytics" : " • Stripe data"}
          </p>
        </div>

        {/* Period selector */}
        <div style={{ display: "flex", gap: 4, background: "var(--admin-bg)", borderRadius: 8, padding: 4, border: "1px solid var(--admin-border)" }}>
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => switchPeriod(p.key)}
              style={{
                padding: "0.35rem 0.85rem",
                fontSize: "0.68rem",
                letterSpacing: "0.08em",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                background:  period === p.key ? "#A0622A" : "transparent",
                color:       period === p.key ? "#fff" : "var(--admin-text-muted)",
                fontWeight:  period === p.key ? 600 : 400,
                transition:  "all 0.15s",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button onClick={() => router.push("/admin/dashboard")} style={{ fontSize: "0.73rem", color: "var(--admin-text-muted)", background: "none", border: "none", cursor: "pointer" }}>← Dashboard</button>
          <button onClick={() => load(period)} style={{ fontSize: "0.73rem", color: "#A0622A", background: "none", border: "1px solid #A0622A", borderRadius: 4, padding: "0.35rem 0.9rem", cursor: "pointer" }}>
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>

      <div style={{ padding: "1.5rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
        {error && <p style={{ color: "#c0392b", fontSize: "0.8rem" }}>{error}</p>}

        {/* Skeleton while loading */}
        {loading && !data && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ ...card, height: 90, opacity: 0.4, background: "var(--admin-border)" }} />
            ))}
          </div>
        )}

        {data && (
          <>
            {/* ── Revenue KPIs ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
              <div style={card}>
                <p style={lbl}>Revenue</p>
                <p style={big}>{fmt(data.revenue)}</p>
                <p style={sub}>{data.periodLabel}</p>
              </div>
              <div style={card}>
                <p style={lbl}>Orders</p>
                <p style={big}>{data.orderCount}</p>
                <p style={sub}>{data.periodLabel}</p>
              </div>
              <div style={card}>
                <p style={lbl}>Avg Order Value</p>
                <p style={big}>{fmt(data.aov)}</p>
                <p style={sub}>per transaction</p>
              </div>
              <div style={card}>
                <p style={lbl}>Unique Customers</p>
                <p style={big}>{data.uniqueCustomers}</p>
                <p style={sub}>{data.periodLabel}</p>
              </div>
            </div>

            {/* ── GA4 KPIs (if connected) ── */}
            {data.ga4 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
                <div style={card}>
                  <p style={lbl}>Sessions</p>
                  <p style={big}>{data.ga4.sessions.toLocaleString()}</p>
                  <p style={sub}>{data.periodLabel}</p>
                </div>
                <div style={card}>
                  <p style={lbl}>Visitors</p>
                  <p style={big}>{data.ga4.users.toLocaleString()}</p>
                  <p style={sub}>{data.ga4.newUsers.toLocaleString()} new</p>
                </div>
                <div style={card}>
                  <p style={lbl}>Engagement Rate</p>
                  <p style={big}>{pct(data.ga4.engagementRate)}</p>
                  <p style={sub}>of sessions engaged</p>
                </div>
                <div style={card}>
                  <p style={lbl}>Conversion Rate</p>
                  <p style={big}>{data.ga4.sessions > 0 ? pct(data.orderCount / data.ga4.sessions) : "—"}</p>
                  <p style={sub}>sessions → purchase</p>
                </div>
              </div>
            )}

            {/* ── Revenue Chart ── */}
            <div style={{ ...sec, marginBottom: "1.25rem" }}>
              <div style={sh}>
                <span>Revenue — {data.periodLabel}</span>
                <span style={{ fontSize: "0.6rem" }}>{data.chartUnit === "hour" ? "by hour" : data.chartUnit === "day" ? "by day" : "by week"}</span>
              </div>
              <div style={{ padding: "1.25rem 1rem 0.75rem" }}>
                <RevenueChart data={data.chartData} unit={data.chartUnit} />
              </div>
            </div>

            {/* ── Two-col: Top Products + Traffic Sources ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>

              <div style={sec}>
                <div style={sh}><span>Top Products</span><span>by revenue</span></div>
                {data.topProducts.length === 0 ? (
                  <p style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>No sales in this period.</p>
                ) : (
                  <div style={{ padding: "0.75rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
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

              <div style={sec}>
                {data.ga4 ? (
                  <>
                    <div style={sh}><span>Traffic Sources</span><span>{data.periodLabel}</span></div>
                    <div style={{ padding: "0.75rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
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

                    {data.ga4.sources.length > 0 && (
                      <>
                        <div style={{ ...sh, borderTop: "1px solid var(--admin-border)", fontSize: "0.62rem" }}>
                          <span>Exact Source / Medium</span>
                        </div>
                        <div style={{ padding: "0.75rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                          {data.ga4.sources.map((s, i) => (
                            <div key={`${s.source}-${s.medium}-${i}`} style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ fontSize: "0.68rem", color: "var(--admin-text)" }}>
                                {s.source || "(direct)"} <span style={{ color: "var(--admin-text-muted)" }}>/ {s.medium || "(none)"}</span>
                              </span>
                              <span style={{ fontSize: "0.68rem", color: "var(--admin-text-muted)" }}>{s.sessions.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div style={sh}><span>Customer Countries</span><span>from orders</span></div>
                    {data.topCountries.length === 0 ? (
                      <p style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>No data in this period.</p>
                    ) : (
                      <div style={{ padding: "0.75rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
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

            {/* ── GA4 extended row ── */}
            {data.ga4 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
                <div style={sec}>
                  <div style={sh}><span>Devices</span></div>
                  <div style={{ padding: "0.75rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
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
                <div style={sec}>
                  <div style={sh}><span>Visitor Countries</span></div>
                  <div style={{ padding: "0.75rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
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
                <div style={sec}>
                  <div style={sh}><span>Top Pages</span></div>
                  <div style={{ padding: "0.75rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                    {data.ga4.topPages.map((p) => (
                      <div key={p.path}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: "0.68rem", color: "var(--admin-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }} title={p.path}>{p.path}</span>
                          <span style={{ fontSize: "0.72rem", color: "var(--admin-text-muted)" }}>{p.views.toLocaleString()}</span>
                        </div>
                        <MiniBar value={p.views} max={data.ga4!.topPages[0]?.views ?? 1} color="#A0622A" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Add to Cart ── */}
            {data.ga4 && (
              <div style={{ ...sec, marginBottom: "1.25rem" }}>
                <div style={sh}>
                  <span>Add to Cart</span>
                  <span>{data.ga4.totalAddToCarts} total in {data.periodLabel}</span>
                </div>
                {data.ga4.addToCartProducts.length === 0 ? (
                  <p style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>No add-to-cart events yet. Data will appear after customers start adding products.</p>
                ) : (
                  <div style={{ padding: "0.75rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                    {data.ga4.addToCartProducts.map((p) => (
                      <div key={p.name}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: "0.72rem", color: "var(--admin-text)" }}>{p.name}</span>
                          <span style={{ fontSize: "0.72rem", color: "#A0622A", fontWeight: "bold" }}>{p.count}×</span>
                        </div>
                        <MiniBar value={p.count} max={data.ga4!.addToCartProducts[0]?.count ?? 1} color="#E8B4A8" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Recent Orders ── */}
            <div style={sec}>
              <div style={sh}><span>Recent Orders</span><span>{data.orderCount} in {data.periodLabel}</span></div>
              {data.recentOrders.length === 0 ? (
                <p style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>No orders in this period.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>{["Time", "Product", "Customer", "Country", "Amount", ""].map((h) => <th key={h} style={th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((o) => (
                      <tr key={o.id}>
                        <td style={{ ...td, color: "var(--admin-text-muted)", whiteSpace: "nowrap", fontSize: "0.68rem" }}>{timeAgo(o.createdAt)}</td>
                        <td style={{ ...td, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.productName}</td>
                        <td style={td}>
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

            {/* ── GA4 setup prompt ── */}
            {!data.ga4Ready && (
              <div id="ga4-setup" style={{ ...sec, border: "1px solid #A0622A33" }}>
                <div style={{ ...sh, color: "#A0622A" }}><span>Connect Google Analytics — Unlock Visitor Data</span></div>
                <div style={{ padding: "1.25rem", fontSize: "0.78rem", lineHeight: 1.8, color: "var(--admin-text-muted)" }}>
                  <p style={{ marginTop: 0 }}>Once connected you&apos;ll see: <strong style={{ color: "var(--admin-text)" }}>sessions, traffic sources, devices, visitor countries, top pages,</strong> and conversion rate — all filtered by the same time period.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
