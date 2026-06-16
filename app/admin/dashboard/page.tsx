"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/products";

const CATEGORY_ORDER = [
  "Belly Chains",
  "Back Chains",
  "Body Chains",
  "Shoulder Chains",
  "Anklets",
  "Bracelets",
  "Necklaces",
  "Hand Chains",
  "Head Chains",
  "Eyeglasses Chains",
  "Bikini Clip Chains",
];

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => {
        if (r.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return r.json() as Promise<Product[]>;
      })
      .then((data) => {
        if (data) setProducts(data);
      })
      .catch(() => setError("Failed to load products"))
      .finally(() => setLoading(false));
  }, [router]);

  // Restore scroll position after returning from product editor
  useEffect(() => {
    if (loading || products.length === 0) return;
    const savedY = sessionStorage.getItem("admin-scroll-y");
    if (savedY) {
      sessionStorage.removeItem("admin-scroll-y");
      window.scrollTo({ top: parseInt(savedY), behavior: "instant" });
    }
  }, [loading, products]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  async function toggleActive(id: string) {
    const updated = products.map((p) =>
      p.id === id ? { ...p, active: !(p.active ?? true) } : p
    );
    setProducts(updated);
    const res = await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (!res.ok) {
      setError("Failed to save changes");
      setProducts(products);
    }
  }

  async function deleteProduct(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    const updated = products.filter((p) => p.id !== id);
    const res = await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (res.ok) {
      setProducts(updated);
    } else {
      setError("Failed to delete product");
    }
    setDeleting(null);
  }

  // Group products by category in defined order
  const grouped: { category: string; items: Product[] }[] = [];
  const seen = new Set<string>();

  for (const cat of CATEGORY_ORDER) {
    const items = products.filter((p) => p.category === cat);
    if (items.length > 0) {
      grouped.push({ category: cat, items });
      seen.add(cat);
    }
  }
  // Catch any category not in the order list
  for (const p of products) {
    if (!seen.has(p.category)) {
      const existing = grouped.find((g) => g.category === p.category);
      if (existing) {
        existing.items.push(p);
      } else {
        grouped.push({ category: p.category, items: [p] });
        seen.add(p.category);
      }
    }
  }

  function ProductCard({ product }: { product: Product }) {
    const isActive = product.active ?? true;
    const isDeleting = deleting === product.id;
    return (
      <div
        style={{
          background: "var(--admin-surface)",
          border: "1px solid var(--admin-border)",
          borderRadius: "8px",
          overflow: "hidden",
          opacity: isActive ? 1 : 0.6,
          position: "relative",
        }}
      >
        {/* Thumbnail */}
        <div style={{
          height: "180px",
          background: "var(--admin-surface2)",
          overflow: "hidden",
          position: "relative",
        }}>
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "var(--admin-muted2)",
              fontSize: "0.75rem",
            }}>
              No image
            </div>
          )}
          {/* Delete X — top left */}
          <button
            onClick={() => deleteProduct(product.id, product.name)}
            disabled={isDeleting}
            title="Delete product"
            style={{
              position: "absolute",
              top: "0.5rem",
              left: "0.5rem",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              border: "none",
              background: isDeleting ? "#fca5a5" : "#ef4444",
              color: "#fff",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: isDeleting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
              opacity: 0.85,
              zIndex: 10,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.85"; }}
          >
            {isDeleting ? "…" : "✕"}
          </button>
          {/* Active badge — top right */}
          <span style={{
            position: "absolute",
            top: "0.5rem",
            right: "0.5rem",
            padding: "0.2rem 0.5rem",
            background: isActive ? "#d1fae5" : "#fee2e2",
            color: isActive ? "#065f46" : "#991b1b",
            borderRadius: "12px",
            fontSize: "0.65rem",
            fontWeight: 600,
          }}>
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Info */}
        <div style={{ padding: "1rem" }}>
          <h3 style={{ margin: "0 0 0.25rem", fontSize: "0.95rem", fontWeight: 600, color: "var(--admin-text)" }}>
            {product.name}
          </h3>
          <p style={{ margin: "0 0 1rem", fontSize: "0.9rem", fontWeight: 500, color: "#A0622A" }}>
            €{product.price.toFixed(2)}
          </p>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => {
                sessionStorage.setItem("admin-scroll-y", String(window.scrollY));
                router.push(`/admin/product/${product.id}`);
              }}
              style={{
                flex: 1,
                padding: "0.4rem",
                background: "#2C2220",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              Edit
            </button>
            <button
              onClick={() => toggleActive(product.id)}
              style={{
                padding: "0.4rem 0.75rem",
                background: "transparent",
                color: "var(--admin-muted)",
                border: "1px solid var(--admin-border2)",
                borderRadius: "4px",
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              {isActive ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--admin-bg)" }}>
      {/* Header */}
      <div style={{
        background: "var(--admin-surface)",
        borderBottom: "1px solid var(--admin-border)",
        padding: "1rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600, color: "var(--admin-text)" }}>
            Bodystrands Admin
          </h1>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--admin-muted)" }}>Product Manager</p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <a
            href="/"
            style={{ fontSize: "0.8rem", color: "var(--admin-muted)", textDecoration: "none" }}
          >
            ← Back to site
          </a>
          <button
            onClick={handleLogout}
            style={{
              padding: "0.4rem 1rem",
              background: "transparent",
              border: "1px solid var(--admin-border2)",
              borderRadius: "4px",
              fontSize: "0.8rem",
              cursor: "pointer",
              color: "var(--admin-text2)",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Actions bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <button
            onClick={() => router.push("/admin/analytics")}
            style={{
              padding: "0.6rem 1.5rem",
              background: "var(--admin-surface)",
              color: "#A0622A",
              border: "1px solid #A0622A",
              borderRadius: "4px",
              fontSize: "0.85rem",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            📊 Analytics
          </button>
          <button
            onClick={() => router.push("/admin/site-images")}
            style={{
              padding: "0.6rem 1.5rem",
              background: "var(--admin-surface)",
              color: "#A0622A",
              border: "1px solid #A0622A",
              borderRadius: "4px",
              fontSize: "0.85rem",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            🖼 Manage Site Images
          </button>
          <button
            onClick={() => router.push("/admin/product/new")}
            style={{
              padding: "0.6rem 1.5rem",
              background: "#A0622A",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "0.85rem",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            + Add New Product
          </button>
        </div>

        {loading && <p style={{ color: "var(--admin-muted)" }}>Loading products...</p>}
        {error && <p style={{ color: "#c0392b" }}>{error}</p>}

        {!loading && !error && products.length === 0 && (
          <p style={{ color: "var(--admin-muted)" }}>No products found.</p>
        )}

        {grouped.map(({ category, items }) => (
          <div key={category} style={{ marginBottom: "2.5rem" }}>
            {/* Category header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}>
              <h2 style={{
                margin: 0,
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--admin-muted)",
              }}>
                {category}
              </h2>
              <span style={{
                fontSize: "0.65rem",
                color: "var(--admin-muted2)",
                background: "var(--admin-surface2)",
                border: "1px solid var(--admin-border)",
                borderRadius: "10px",
                padding: "0.1rem 0.5rem",
              }}>
                {items.length}
              </span>
              <div style={{ flex: 1, height: "1px", background: "var(--admin-border)" }} />
            </div>

            {/* Product grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "1.25rem",
            }}>
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
