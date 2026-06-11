"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Invalid password");
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#FDF9F7",
      fontFamily: "var(--font-josefin), 'Josefin Sans', sans-serif",
    }}>
      <div style={{
        background: "#fff",
        border: "1px solid #E8B4A8",
        padding: "3rem 2.5rem",
        width: "100%",
        maxWidth: "400px",
        textAlign: "center",
      }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
            fontSize: "2rem",
            fontWeight: 300,
            color: "#2C2220",
            letterSpacing: "0.08em",
            margin: 0,
          }}>
            Bodystrands
          </h1>
          <p style={{
            fontSize: "0.65rem",
            letterSpacing: "0.3em",
            color: "#8C7B6E",
            textTransform: "uppercase",
            marginTop: "0.5rem",
          }}>
            Admin Panel
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              border: "1px solid #E8B4A8",
              background: "#FDF9F7",
              fontSize: "0.85rem",
              color: "#2C2220",
              fontFamily: "inherit",
              outline: "none",
              marginBottom: "1rem",
              boxSizing: "border-box",
            }}
          />

          {error && (
            <p style={{
              color: "#c0392b",
              fontSize: "0.75rem",
              marginBottom: "1rem",
              letterSpacing: "0.05em",
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "#A0622A",
              color: "#FDF9F7",
              border: "none",
              fontSize: "0.7rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              fontFamily: "inherit",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Entering..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
