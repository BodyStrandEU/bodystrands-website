"use client";

import { useRef, useState } from "react";
import Link from "next/link";

type ImageSlot = {
  label: string;
  path: string; // relative to public/, e.g. "images/hero-back-chain.jpg"
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

  async function handleFile(file: File) {
    setStatus("uploading");
    setErrMsg("");
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

  return (
    <div style={{
      border: "1px solid #E8B4A8",
      padding: "1rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
      background: "#fff",
    }}>
      {/* Preview */}
      <div style={{
        width: "100%",
        aspectRatio: "1",
        background: "#F2DDD7",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/${slot.path}?v=${cacheBust}`}
          alt={slot.label}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
          onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
        />
      </div>

      {/* Label */}
      <p style={{
        fontSize: "0.6rem",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: "#2C2220",
        fontFamily: "var(--font-josefin), 'Josefin Sans', sans-serif",
      }}>
        {slot.label}
      </p>

      <p style={{ fontSize: "0.55rem", color: "#8C7B6E", wordBreak: "break-all" }}>
        {slot.path}
      </p>

      {/* Status */}
      {status === "uploading" && (
        <p style={{ fontSize: "0.6rem", color: "#A0622A" }}>Uploading…</p>
      )}
      {status === "done" && (
        <p style={{ fontSize: "0.6rem", color: "#2a7a2a" }}>✓ Updated — deploys in ~1 min</p>
      )}
      {status === "error" && (
        <p style={{ fontSize: "0.6rem", color: "#c0392b" }}>{errMsg}</p>
      )}

      {/* Upload button */}
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
          background: status === "uploading" ? "#ccc" : "#A0622A",
          color: "#FDF9F7",
          border: "none",
          padding: "0.6rem",
          fontSize: "0.6rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          cursor: status === "uploading" ? "not-allowed" : "pointer",
          fontFamily: "var(--font-josefin), 'Josefin Sans', sans-serif",
        }}
      >
        Replace Image
      </button>
    </div>
  );
}

export default function SiteImagesPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F8F5F3", fontFamily: "var(--font-josefin), 'Josefin Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E8B4A8", padding: "1.25rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.1rem", fontWeight: 400, color: "#2C2220", margin: 0, letterSpacing: "0.05em" }}>
            Site Images
          </h1>
          <p style={{ fontSize: "0.6rem", color: "#8C7B6E", margin: "0.25rem 0 0", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Replace any image — changes go live in ~1 minute
          </p>
        </div>
        <Link href="/admin/dashboard" style={{ fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8C7B6E", textDecoration: "none" }}>
          ← Back to Dashboard
        </Link>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem" }}>
        {SECTIONS.map((section) => (
          <div key={section.title} style={{ marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#A0622A", marginBottom: "1.25rem", fontWeight: 400 }}>
              {section.title}
            </h2>
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
