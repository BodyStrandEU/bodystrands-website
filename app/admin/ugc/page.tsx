"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { products } from "@/lib/products";
import type { UGCPhoto } from "@/lib/ugc";

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function uploadUGCFile(file: File): Promise<string> {
  const configRes = await fetch("/api/admin/upload-config");
  if (!configRes.ok) throw new Error("Not authorised");
  const { token, repo, branch } = await configRes.json() as { token: string; repo: string; branch: string };

  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
  const path = `public/images/ugc/${filename}`;

  const base64 = await fileToBase64(file);
  const body: Record<string, string> = { message: `Upload customer photo: ${filename}`, content: base64, branch };

  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${text.slice(0, 200)}`);
  }
  return `/images/ugc/${filename}`;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.45rem 0.65rem",
  border: "1px solid var(--admin-border2)",
  borderRadius: "4px",
  fontSize: "0.78rem",
  color: "var(--admin-text)",
  background: "var(--admin-surface)",
  boxSizing: "border-box",
};

export default function UGCAdminPage() {
  const router = useRouter();
  const [photos, setPhotos]   = useState<UGCPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    fetch("/api/admin/ugc")
      .then((r) => {
        if (r.status === 401) { router.push("/admin/login"); return null; }
        return r.json() as Promise<UGCPhoto[]>;
      })
      .then((data) => { if (data) setPhotos(data); })
      .catch(() => setError("Failed to load customer photos"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const defaultProductId = products[0]?.id ?? "";
      for (const file of Array.from(files)) {
        const url = await uploadUGCFile(file);
        setPhotos((p) => [...p, { id: Math.random().toString(36).slice(2), image: url, productId: defaultProductId, caption: "" }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function updatePhoto(id: string, patch: Partial<UGCPhoto>) {
    setPhotos((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  function removePhoto(id: string) {
    setPhotos((p) => p.filter((x) => x.id !== id));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/ugc", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(photos),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Save failed");
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: "2rem", color: "var(--admin-muted)" }}>Loading...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "var(--admin-bg)" }}>
      <div style={{
        background: "var(--admin-surface)",
        borderBottom: "1px solid var(--admin-border)",
        padding: "1.25rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div>
          <h1 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--admin-text)", margin: 0 }}>
            Customer Photos
          </h1>
          <p style={{ fontSize: "0.65rem", color: "var(--admin-muted)", margin: "0.25rem 0 0", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Shown in the &quot;Real Customers, Real Pieces&quot; gallery on the homepage
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {success && (
            <span style={{ fontSize: "0.8rem", color: "#065f46", background: "#d1fae5", padding: "0.35rem 0.75rem", borderRadius: "4px" }}>
              Saved! Live in ~1 minute
            </span>
          )}
          {error && (
            <span style={{ fontSize: "0.8rem", color: "#991b1b", background: "#fee2e2", padding: "0.35rem 0.75rem", borderRadius: "4px" }}>
              {error}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "0.5rem 1.5rem",
              background: saving ? "#9ca3af" : "#A0622A",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "0.85rem",
              cursor: saving ? "wait" : "pointer",
              fontWeight: 500,
            }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <Link href="/admin/dashboard" style={{ fontSize: "0.75rem", color: "var(--admin-muted)", textDecoration: "none" }}>
            ← Dashboard
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem" }}>
        <p style={{ fontSize: "0.8rem", color: "var(--admin-muted)", marginBottom: "1.5rem" }}>
          Upload real photos of customers wearing your pieces, then tag which product each one links to. Pull these from your Instagram/TikTok content — same photos you&apos;re already posting.
        </p>

        {/* Upload zone */}
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); void handleFiles(e.dataTransfer.files); }}
          style={{
            display: "block",
            padding: "1.5rem",
            border: `2px dashed ${dragOver ? "#A0622A" : "var(--admin-border2)"}`,
            borderRadius: "6px",
            textAlign: "center",
            cursor: uploading ? "wait" : "pointer",
            background: dragOver ? "#fdf6f0" : "var(--admin-surface)",
            transition: "all 0.15s",
            marginBottom: "2rem",
          }}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            style={{ display: "none" }}
            onChange={(e) => { void handleFiles(e.target.files); }}
            disabled={uploading}
          />
          <span style={{ fontSize: "0.85rem", color: "var(--admin-muted)" }}>
            {uploading ? "Uploading…" : "Drop customer photos here or click to upload"}
          </span>
        </label>

        {photos.length === 0 && (
          <p style={{ fontSize: "0.85rem", color: "var(--admin-muted2)" }}>No customer photos yet.</p>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.25rem" }}>
          {photos.map((photo) => (
            <div key={photo.id} style={{ border: "1px solid var(--admin-border)", borderRadius: "8px", overflow: "hidden", background: "var(--admin-surface)" }}>
              <div style={{ position: "relative", aspectRatio: "1", background: "var(--admin-surface2)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button
                  onClick={() => removePhoto(photo.id)}
                  title="Remove"
                  style={{
                    position: "absolute", top: "0.4rem", right: "0.4rem",
                    width: "22px", height: "22px", borderRadius: "50%",
                    border: "none", background: "rgba(0,0,0,0.7)", color: "#fff",
                    fontSize: "0.7rem", cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center", lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <select
                  style={inputStyle}
                  value={photo.productId}
                  onChange={(e) => updatePhoto(photo.id, { productId: e.target.value })}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <input
                  style={inputStyle}
                  value={photo.caption ?? ""}
                  onChange={(e) => updatePhoto(photo.id, { caption: e.target.value })}
                  placeholder="Caption (optional)"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
