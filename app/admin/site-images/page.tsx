"use client";

import { useRef, useState } from "react";
import Link from "next/link";

type ImageSlot = {
  label: string;
  path: string;
};

type Section = {
  title: string;
  slots: ImageSlot[];
};

const SECTIONS: Section[] = [
  {
    title: "Homepage Hero",
    slots: [
      { label: "Hero Background", path: "images/hero-back-chain.jpg" },
    ],
  },
  {
    title: "Category Tiles",
    slots: [
      { label: "Back Chains", path: "images/elvan-back-full.jpg" },
      { label: "Body Chains", path: "images/hero-back-chain.jpg" },
      { label: "Belly Chains", path: "images/category-belly.png" },
      { label: "Shoulder Chains", path: "images/category-shoulder.jpg" },
      { label: "Anklets", path: "images/lifestyle-anklet.jpg" },
      { label: "Necklaces", path: "images/category-necklace.jpg" },
      { label: "Bracelets", path: "images/category-bracelet.jpg" },
      { label: "Eyeglasses Chains", path: "images/category-glasses.jpg" },
      { label: "Bikini Clip Chains", path: "images/category-bikini.jpg" },
    ],
  },
  {
    title: "About Page",
    slots: [
      { label: "About — Main Photo", path: "images/elvan-back-cross.jpg" },
      { label: "About — Side Photo", path: "images/elvan-back-medium.jpg" },
      { label: "About — Choker Front", path: "images/elvan-choker-front.jpg" },
      { label: "About — Choker Side", path: "images/elvan-choker-side.jpg" },
    ],
  },
  {
    title: "Lifestyle Photos",
    slots: [
      { label: "Lifestyle — Anklet", path: "images/lifestyle-anklet.jpg" },
      { label: "Lifestyle — Butterfly", path: "images/lifestyle-butterfly.jpg" },
      { label: "Lifestyle — Head Chain", path: "images/lifestyle-headchain.jpg" },
      { label: "Lifestyle — Pearl Back", path: "images/lifestyle-pearl-back.jpg" },
    ],
  },
  {
    title: "Logo",
    slots: [
      { label: "Logo (dark background)", path: "images/logo.png" },
      { label: "Logo Pink", path: "images/logo-pink.png" },
    ],
  },
];

function ImageSlotCard({ slot }: { slot: ImageSlot }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const [cacheBust, setCacheBust] = useState(Date.now());
  const [cleared, setCleared] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File) {
    setStatus("uploading");
    setErrMsg("");
    setCleared(false);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("targetPath", slot.path);
      const res = await fetch("/api/admin/site-images", { method: "POST", body: form });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok || !data.success) throw new Error(data.error ?? "Upload failed");
      setCacheBust(Date.now());
      setStatus("done");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Error");
      setStatus("error");
    }
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function onDragLeave() {
    setDragging(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  }

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        border: dragging ? "2px dashed #A0622A" : "1px solid var(--admin-border)",
        borderRadius: "8px",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        background: dragging ? "rgba(160,98,42,0.05)" : "var(--admin-surface)",
        transition: "border 0.15s, background 0.15s",
        position: "relative",
      }}
    >
      {/* Preview area */}
      <div style={{
        width: "100%",
        aspectRatio: "1",
        background: "var(--admin-surface2)",
        borderRadius: "4px",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}>
        {cleared ? (
          <span style={{ fontSize: "0.65rem", color: "var(--admin-muted)", textAlign: "center", padding: "1rem" }}>
            Drop new image here
          </span>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/${slot.path}?v=${cacheBust}`}
              alt={slot.label}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }}
            />
            {/* X button */}
            <button
              onClick={() => setCleared(true)}
              title="Clear preview"
              style={{
                position: "absolute",
                top: "0.4rem",
                right: "0.4rem",
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                border: "none",
                background: "#fee2e2",
                color: "#991b1b",
                fontSize: "0.7rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
                fontWeight: 700,
              }}
            >
              ✕
            </button>
          </>
        )}

        {/* Drag overlay label */}
        {dragging && (
          <div style={{
            position: "absolute",
            inset: 0,
            background: "rgba(160,98,42,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.7rem",
            color: "#A0622A",
            fontWeight: 600,
            letterSpacing: "0.1em",
          }}>
            Drop to upload
          </div>
        )}
      </div>

      {/* Label */}
      <p style={{
        fontSize: "0.6rem",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: "var(--admin-text)",
        margin: 0,
      }}>
        {slot.label}
      </p>

      <p style={{ fontSize: "0.55rem", color: "var(--admin-muted)", wordBreak: "break-all", margin: 0 }}>
        {slot.path}
      </p>

      {/* Status */}
      {status === "uploading" && (
        <p style={{ fontSize: "0.6rem", color: "#A0622A", margin: 0 }}>Uploading…</p>
      )}
      {status === "done" && (
        <p style={{ fontSize: "0.6rem", color: "#2a7a2a", margin: 0 }}>✓ Updated — live in ~1 min</p>
      )}
      {status === "error" && (
        <p style={{ fontSize: "0.6rem", color: "#c0392b", margin: 0 }}>{errMsg}</p>
      )}

      {/* Hidden file input + click-to-upload button */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={status === "uploading"}
        style={{
          background: status === "uploading" ? "var(--admin-surface2)" : "#A0622A",
          color: status === "uploading" ? "var(--admin-muted)" : "#FDF9F7",
          border: "none",
          borderRadius: "4px",
          padding: "0.5rem",
          fontSize: "0.6rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          cursor: status === "uploading" ? "not-allowed" : "pointer",
        }}
      >
        {status === "uploading" ? "Uploading…" : "Browse file"}
      </button>
    </div>
  );
}

export default function SiteImagesPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--admin-bg)" }}>
      {/* Header */}
      <div style={{
        background: "var(--admin-surface)",
        borderBottom: "1px solid var(--admin-border)",
        padding: "1.25rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <h1 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--admin-text)", margin: 0 }}>
            Site Images
          </h1>
          <p style={{ fontSize: "0.65rem", color: "var(--admin-muted)", margin: "0.25rem 0 0", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Drag & drop or browse — live in ~1 minute
          </p>
        </div>
        <Link href="/admin/dashboard" style={{ fontSize: "0.75rem", color: "var(--admin-muted)", textDecoration: "none" }}>
          ← Back to Dashboard
        </Link>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem" }}>
        {SECTIONS.map((section) => (
          <div key={section.title} style={{ marginBottom: "3rem" }}>
            {/* Section header */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <h2 style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--admin-muted)",
                margin: 0,
              }}>
                {section.title}
              </h2>
              <div style={{ flex: 1, height: "1px", background: "var(--admin-border)" }} />
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "1rem",
            }}>
              {section.slots.map((slot) => (
                <ImageSlotCard key={slot.path} slot={slot} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
