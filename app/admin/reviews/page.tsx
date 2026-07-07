"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PendingReview } from "@/lib/reviews-data";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits]     = useState<Record<string, Partial<PendingReview>>>({});
  const [busy, setBusy]       = useState<Record<string, boolean>>({});
  const [error, setError]     = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/reviews")
      .then(r => {
        if (r.status === 401) { router.push("/admin/login"); return null; }
        return r.json() as Promise<{ reviews?: PendingReview[] }>;
      })
      .then(d => { if (d) setReviews(d.reviews ?? []); })
      .finally(() => setLoading(false));
  }, [router]);

  function fieldValue(r: PendingReview, field: keyof PendingReview) {
    return (edits[r.id]?.[field] as string | number | undefined) ?? r[field];
  }

  function setField(id: string, field: keyof PendingReview, value: string | number) {
    setEdits(p => ({ ...p, [id]: { ...p[id], [field]: value } }));
  }

  async function act(r: PendingReview, action: "approve" | "reject") {
    setBusy(p => ({ ...p, [r.id]: true }));
    setError(p => ({ ...p, [r.id]: "" }));
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: r.id,
          action,
          name:     fieldValue(r, "name"),
          headline: fieldValue(r, "headline"),
          text:     fieldValue(r, "text"),
          rating:   fieldValue(r, "rating"),
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(p => ({ ...p, [r.id]: d.error ?? "Failed" }));
        setBusy(p => ({ ...p, [r.id]: false }));
        return;
      }
      setReviews(prev => prev.filter(x => x.id !== r.id));
    } catch {
      setError(p => ({ ...p, [r.id]: "Network error" }));
      setBusy(p => ({ ...p, [r.id]: false }));
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--admin-bg)" }}>
      <div className="p-6 md:p-10 max-w-3xl mx-auto">
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
            <h1 style={{ fontSize: "1.5rem", fontWeight: 300, letterSpacing: "0.02em", color: "var(--admin-text)" }}>Reviews</h1>
          </div>
        </div>

        {loading ? (
          <p style={{ fontSize: "0.7rem", color: "var(--admin-muted)" }}>Loading…</p>
        ) : reviews.length === 0 ? (
          <p style={{ fontSize: "0.7rem", color: "var(--admin-muted)" }}>No reviews awaiting approval.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map(r => (
              <div key={r.id} className="p-5" style={{ border: "1px solid var(--admin-border)", background: "var(--admin-surface)" }}>
                <div className="flex flex-col md:flex-row gap-4">
                  {r.image && (
                    <img src={r.image} alt={r.name} style={{ width: 120, height: 120, objectFit: "cover", border: "1px solid var(--admin-border2)", flexShrink: 0 }} />
                  )}
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <p style={{ fontSize: "0.65rem", color: "var(--admin-muted)" }}>
                      {r.category} · {r.location} · {new Date(r.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </p>

                    <div className="flex items-center gap-2">
                      <label style={{ fontSize: "0.6rem", color: "var(--admin-muted)" }}>Name</label>
                      <input
                        value={String(fieldValue(r, "name"))}
                        onChange={e => setField(r.id, "name", e.target.value)}
                        style={{ border: "1px solid var(--admin-border2)", background: "var(--admin-surface)", color: "var(--admin-text)", fontSize: "0.7rem", padding: "0.25rem 0.5rem", flex: 1 }}
                      />
                      <label style={{ fontSize: "0.6rem", color: "var(--admin-muted)" }}>Rating</label>
                      <select
                        value={Number(fieldValue(r, "rating"))}
                        onChange={e => setField(r.id, "rating", Number(e.target.value))}
                        style={{ border: "1px solid var(--admin-border2)", background: "var(--admin-surface)", color: "var(--admin-text)", fontSize: "0.7rem", padding: "0.25rem 0.5rem" }}
                      >
                        {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
                      </select>
                    </div>

                    <input
                      value={String(fieldValue(r, "headline"))}
                      onChange={e => setField(r.id, "headline", e.target.value)}
                      style={{ border: "1px solid var(--admin-border2)", background: "var(--admin-surface)", color: "var(--admin-text)", fontSize: "0.75rem", fontWeight: 600, padding: "0.4rem 0.6rem" }}
                    />
                    <textarea
                      value={String(fieldValue(r, "text"))}
                      onChange={e => setField(r.id, "text", e.target.value)}
                      rows={3}
                      style={{ border: "1px solid var(--admin-border2)", background: "var(--admin-surface)", color: "var(--admin-text)", fontSize: "0.72rem", padding: "0.5rem 0.6rem", resize: "vertical" }}
                    />

                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => act(r, "approve")}
                        disabled={busy[r.id]}
                        style={{ background: "#A0622A", color: "#FDF9F7", border: "none", padding: "0.5rem 1.25rem", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}
                      >
                        {busy[r.id] ? "…" : "Approve & Publish"}
                      </button>
                      <button
                        onClick={() => act(r, "reject")}
                        disabled={busy[r.id]}
                        style={{ background: "none", color: "var(--admin-muted)", border: "1px solid var(--admin-border2)", padding: "0.5rem 1.25rem", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}
                      >
                        Reject
                      </button>
                      {error[r.id] && <span style={{ fontSize: "0.6rem", color: "#f87171" }}>{error[r.id]}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
