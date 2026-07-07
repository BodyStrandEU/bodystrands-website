"use client";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    fetch("/api/admin/orders")
      .then(r => r.json())
      .then(d => { setOrders(d.orders ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function sendTracking(orderId: string) {
    const num = tracking[orderId]?.trim();
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
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-[0.55rem] tracking-[0.3em] uppercase text-[#A0622A] mb-1">Admin</p>
        <h1 className="text-2xl font-light tracking-wide text-[#2C2220]">Orders</h1>
      </div>

      {loading ? (
        <p className="text-[0.7rem] tracking-wide text-[#8C7B6E]">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="text-[0.7rem] tracking-wide text-[#8C7B6E]">No orders found.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map(order => {
            const date = new Date(order.createdAt * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
            const flag = order.address ? (COUNTRY_FLAG[order.address.country] ?? "🌍") : "—";
            const shipped = !!(order.trackingNumber || sent[order.id]);
            const currentTracking = order.trackingNumber ?? tracking[order.id] ?? "";

            return (
              <div key={order.id} className={`border rounded-none p-5 ${shipped ? "border-[#A0622A]/30 bg-[#A0622A]/5" : "border-[#E8D5CB] bg-white"}`}>
                <div className="flex flex-col md:flex-row md:items-start gap-4">

                  {/* Order info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{flag}</span>
                      <div>
                        <p className="text-[0.8rem] font-medium text-[#2C2220]">{order.customerName}</p>
                        <p className="text-[0.65rem] text-[#8C7B6E]">{order.customerEmail}</p>
                      </div>
                      <span className={`ml-auto text-[0.55rem] tracking-[0.15em] uppercase px-2 py-1 ${shipped ? "bg-[#A0622A]/10 text-[#A0622A]" : "bg-[#E8B4A8]/20 text-[#8C7B6E]"}`}>
                        {shipped ? "Shipped" : "Pending"}
                      </span>
                    </div>

                    <p className="text-[0.75rem] text-[#2C2220] mb-1 truncate">{order.productName}</p>
                    <p className="text-[0.65rem] text-[#8C7B6E] mb-2">{date} · {order.currency} {order.amount.toFixed(2)}</p>

                    {order.address && (
                      <p className="text-[0.65rem] text-[#8C7B6E] leading-relaxed">
                        {[order.address.line1, order.address.line2, order.address.city, order.address.postal_code, order.address.country].filter(Boolean).join(", ")}
                      </p>
                    )}

                    {shipped && order.trackingNumber && (
                      <p className="text-[0.65rem] text-[#A0622A] mt-2 tracking-wide">
                        Tracking sent: <strong>{order.trackingNumber}</strong>
                        {order.trackingSentAt && ` · ${new Date(order.trackingSentAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
                      </p>
                    )}
                  </div>

                  {/* Tracking input */}
                  <div className="flex flex-col gap-2 md:w-64 flex-shrink-0">
                    <input
                      type="text"
                      placeholder="Tracking number"
                      value={shipped ? (order.trackingNumber ?? "") : (tracking[order.id] ?? "")}
                      onChange={e => setTracking(p => ({ ...p, [order.id]: e.target.value }))}
                      disabled={shipped}
                      className="w-full border border-[#2C2220]/20 px-3 py-2 text-[0.7rem] tracking-widest text-[#2C2220] placeholder-[#8C7B6E]/50 focus:outline-none focus:border-[#A0622A] disabled:bg-[#F5F0EC] disabled:text-[#8C7B6E] transition-colors"
                    />
                    {!shipped && (
                      <button
                        onClick={() => sendTracking(order.id)}
                        disabled={sending[order.id] || !tracking[order.id]?.trim()}
                        className="w-full bg-[#2C2220] text-[#FDF9F7] py-2 text-[0.58rem] tracking-[0.22em] uppercase hover:bg-[#A0622A] transition-colors disabled:opacity-40"
                      >
                        {sending[order.id] ? "Sending…" : "Send Tracking Email"}
                      </button>
                    )}
                    {sent[order.id] && !order.trackingNumber && (
                      <p className="text-[0.6rem] text-[#A0622A] tracking-wide">✓ Tracking email sent</p>
                    )}
                    {error[order.id] && (
                      <p className="text-[0.6rem] text-red-400 tracking-wide">{error[order.id]}</p>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
