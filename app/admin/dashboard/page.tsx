"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/products";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
      // revert
      setProducts(products);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Header */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        padding: "1rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600, color: "#111" }}>
            Bodystrands Admin
          </h1>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280" }}>Product Manager</p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <a
            href="/"
            style={{ fontSize: "0.8rem", color: "#6b7280", textDecoration: "none" }}
          >
            ← Back to site
          </a>
          <button
            onClick={handleLogout}
            style={{
              padding: "0.4rem 1rem",
              background: "transparent",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "0.8rem",
              cursor: "pointer",
              color: "#374151",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Actions bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <button
            onClick={() => router.push("/admin/site-images")}
            style={{
              padding: "0.6rem 1.5rem",
              background: "#fff",
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

        {loading && <p style={{ color: "#6b7280" }}>Loading products...</p>}
        {error && <p style={{ color: "#c0392b" }}>{error}</p>}

        {!loading && !error && products.length === 0 && (
          <p style={{ color: "#6b7280" }}>No products found.</p>
        )}

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.25rem",
        }}>
          {products.map((product) => {
            const isActive = product.active ?? true;
            return (
              <div
                key={product.id}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  overflow: "hidden",
                  opacity: isActive ? 1 : 0.6,
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  height: "180px",
                  background: "#f3f4f6",
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
                      color: "#9ca3af",
                      fontSize: "0.75rem",
                    }}>
                      No image
                    </div>
                  )}
                  {/* Active badge */}
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
                  <h3 style={{ margin: "0 0 0.25rem", fontSize: "0.95rem", fontWeight: 600, color: "#111" }}>
                    {product.name}
                  </h3>
                  <p style={{ margin: "0 0 0.25rem", fontSize: "0.8rem", color: "#6b7280" }}>
                    {product.category}
                  </p>
                  <p style={{ margin: "0 0 1rem", fontSize: "0.9rem", fontWeight: 500, color: "#A0622A" }}>
                    €{product.price.toFixed(2)}
                  </p>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => router.push(`/admin/product/${product.id}`)}
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
                        color: "#6b7280",
                        border: "1px solid #d1d5db",
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
          })}
        </div>
      </div>
    </div>
  );
}
