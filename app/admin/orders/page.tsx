"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Order = {
  id: string;
  paymentIntent: string | null;
  createdAt: number;
  productName: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  address: { line1: string; line2: string; city: string; postal_code: string; country: string } | null;
  trackingNumber: string | null;
  trackingSentAt: string | null;
};

const COUNTRY_FLAG: Record<string, string> = {
  FR:"🇫🇷",GB:"🇬🇧",DE:"🇩🇪",IT:"🇮🇹",ES:"🇪🇸",NL:"🇳🇱",PT:"🇵🇹",BE:"🇧🇪",PL:"🇵🇱",SE:"🇸🇪",
  NO:"🇳🇴",DK:"🇩🇰",FI:"🇫🇮",IE:"🇮🇪",AT:"🇦🇹",CH:"🇨🇭",US:"🇺🇸",CA:"🇨🇦",AU:"🇦🇺",BR:"🇧🇷",
};

export default function OrdersPage() {
  const [orders, setOrders]           = useState<Order[]>([]);
  const [loading, setLoading]         = useState(true);
  const [tracking, setTracking]       = useState<Record<string, string>>({});
  const [sending, setSending]         = useState<Record<string, boolean>>({});
  const [sent, setSent]               = useState<Record<string, boolean>>({});
  const [error, setError]             = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/orders")
      .then(r => r.json())
      .then(d => { setOrders(d.orders ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function sendTracking(orderId: string, existingNumber: string | null) {
    const num = (tracking[orderId] ?? existingNumber ?? "").trim();
    if (!num) return;
    setSending(p => ({ ...p, [orderId]: true }));
    setError(p => ({ ...p, [orderId]: "" }));
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: orderId, trackingNumber: num }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(p => ({ ...p, [orderId]: d.error ?? "Failed" }));
      } else {
        setSent(p => ({ ...p, [orderId]: true }));
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, trackingNumber: num, trackingSentAt: new Date().toISOString() } : o));
      }
    } catch {
      setError(p => ({ ...p, [orderId]: "Network error" }));
    } finally {
      setSending(p => ({ ...p, [orderId]: false }));
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--admin-bg)" }}>
      <div className="p-6 md:p-10 max-w-5xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/dashboard")}
            aria-label="Back to dashboard"
            style={{ fontSize: "1.1rem", color: "var(--admin-muted)", background: "none", border: "none", cursor: "pointer", lineHeight: 1, padding: "0.25rem" }}
          >
            ←
          </button>
          <div>
            <p style={{ fontSize: "0.55rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#A0622A", marginBottom: "0.25rem" }}>Admin</p>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 300, letterSpacing: "0.02em", color: "var(--admin-text)" }}>Orders</h1>
          </div>
        </div>

        {loading ? (
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.02em", color: "var(--admin-muted)" }}>Loading orders…</p>
        ) : orders.length === 0 ? (
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.02em", color: "var(--admin-muted)" }}>No orders found.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map(order => {
              const date = new Date(order.createdAt * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
              const flag = order.address ? (COUNTRY_FLAG[order.address.country] ?? "🌍") : "—";
              const shipped = !!(order.trackingNumber || sent[order.id]);
              const currentTracking = tracking[order.id] ?? order.trackingNumber ?? "";

              return (
                <div
                  key={order.id}
                  className="p-5"
                  style={{
                    border: `1px solid ${shipped ? "#A0622A4d" : "var(--admin-border)"}`,
                    background: shipped ? "#A0622A0d" : "var(--admin-surface)",
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">

                    {/* Order info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">{flag}</span>
                        <div>
                          <p style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--admin-text)" }}>{order.customerName}</p>
                          <p style={{ fontSize: "0.65rem", color: "var(--admin-muted)" }}>{order.customerEmail}</p>
                        </div>
                        <span
                          className="ml-auto px-2 py-1"
                          style={{
                            fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase",
                            background: shipped ? "#A0622A1a" : "var(--admin-surface2)",
                            color: shipped ? "#A0622A" : "var(--admin-muted)",
                          }}
                        >
                          {shipped ? "Shipped" : "Pending"}
                        </span>
                      </div>

                      <p style={{ fontSize: "0.75rem", color: "var(--admin-text)", marginBottom: "0.25rem" }} className="truncate">{order.productName}</p>
                      <p style={{ fontSize: "0.65rem", color: "var(--admin-muted)", marginBottom: "0.5rem" }}>{date} · {order.currency} {order.amount.toFixed(2)}</p>

                      {order.address && (
                        <p style={{ fontSize: "0.65rem", color: "var(--admin-muted)", lineHeight: 1.6 }}>
                          {[order.address.line1, order.address.line2, order.address.city, order.address.postal_code, order.address.country].filter(Boolean).join(", ")}
                        </p>
                      )}

                      {shipped && order.trackingNumber && (
                        <p style={{ fontSize: "0.65rem", color: "#A0622A", marginTop: "0.5rem", letterSpacing: "0.02em" }}>
                          Tracking sent: <strong>{order.trackingNumber}</strong>
                          {order.trackingSentAt && ` · ${new Date(order.trackingSentAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
                        </p>
                      )}
                    </div>

                    {/* Tracking input — stays editable after shipping so mistakes can be corrected and resent */}
                    <div className="flex flex-col gap-2 md:w-64 flex-shrink-0">
                      <input
                        type="text"
                        placeholder="Tracking number"
                        value={currentTracking}
                        onChange={e => { setTracking(p => ({ ...p, [order.id]: e.target.value })); setSent(p => ({ ...p, [order.id]: false })); }}
                        className="w-full px-3 py-2 transition-colors"
                        style={{
                          border: "1px solid var(--admin-border2)",
                          background: "var(--admin-surface)",
                          fontSize: "0.7rem",
                          letterSpacing: "0.05em",
                          color: "var(--admin-text)",
                        }}
                      />
                      <button
                        onClick={() => sendTracking(order.id, order.trackingNumber)}
                        disabled={sending[order.id] || !currentTracking.trim()}
                        className="w-full py-2 transition-colors disabled:opacity-40"
                        style={{
                          background: "#A0622A",
                          color: "#FDF9F7",
                          fontSize: "0.58rem",
                          letterSpacing: "0.22em",
                          textTransform: "uppercase",
                          border: "none",
                          cursor: sending[order.id] || !currentTracking.trim() ? "default" : "pointer",
                        }}
                      >
                        {sending[order.id] ? "Sending…" : shipped ? "Resend Tracking Email" : "Send Tracking Email"}
                      </button>
                      {sent[order.id] && (
                        <p style={{ fontSize: "0.6rem", color: "#A0622A", letterSpacing: "0.02em" }}>✓ Tracking email sent</p>
                      )}
                      {error[order.id] && (
                        <p style={{ fontSize: "0.6rem", color: "#f87171", letterSpacing: "0.02em" }}>{error[order.id]}</p>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
