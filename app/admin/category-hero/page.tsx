"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CATEGORY_HERO_IMAGES } from "@/lib/categoryHeroImages";
import initialPositions from "@/data/category-hero-positions.json";

type Position = { x: number; y: number };

// Approximate real banner aspect ratios (full-bleed width / fixed height) used on the
// shop page hero — desktop is h-80 over a wide viewport, mobile is h-52 over a narrow one.
const DESKTOP_ASPECT = 4.5;
const MOBILE_ASPECT = 1.9;

function HeroPositionEditor({
  category,
  image,
  initial,
}: {
  category: string;
  image: string;
  initial: Position;
}) {
  const [pos, setPos] = useState<Position>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function updateFromPoint(clientX: number, clientY: number) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    setPos({ x: Math.round(x), y: Math.round(y) });
    setSaved(false);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    dragging.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
    updateFromPoint(e.clientX, e.clientY);
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    updateFromPoint(e.clientX, e.clientY);
  }
  function onPointerUp() {
    dragging.current = false;
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/category-hero-position", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, x: pos.x, y: pos.y }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  const objectPosition = `${pos.x}% ${pos.y}%`;

  return (
    <div
      style={{
        border: "1px solid var(--admin-border)",
        borderRadius: 8,
        padding: "1.25rem",
        marginBottom: "1.5rem",
        background: "var(--admin-surface)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.9rem" }}>
        <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--admin-text)", margin: 0 }}>{category}</p>
        <button
          onClick={save}
          disabled={saving || saved}
          style={{
            padding: "0.45rem 1.1rem",
            borderRadius: 4,
            border: "none",
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
            cursor: saving || saved ? "default" : "pointer",
            background: saved ? "var(--admin-surface2)" : "#A0622A",
            color: saved ? "var(--admin-muted)" : "#fff",
          }}
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save Position"}
        </button>
      </div>

      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "flex-start" }}>
        {/* Full image — drag anywhere to move the focal point */}
        <div>
          <p style={{ fontSize: "0.6rem", color: "var(--admin-muted)", marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Drag to set focal point
          </p>
          <div
            ref={containerRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            style={{
              position: "relative",
              width: 340,
              maxWidth: "100%",
              cursor: "crosshair",
              userSelect: "none",
              touchAction: "none",
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid var(--admin-border)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={category} draggable={false} style={{ width: "100%", display: "block" }} />

            {/* Dashed band showing roughly what the desktop banner crop will include */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                height: `${100 / DESKTOP_ASPECT}%`,
                top: `${Math.min(100 - 100 / DESKTOP_ASPECT, Math.max(0, pos.y - 100 / DESKTOP_ASPECT / 2))}%`,
                border: "1.5px dashed rgba(255,255,255,0.85)",
                boxShadow: "0 0 0 1px rgba(0,0,0,0.35)",
                pointerEvents: "none",
              }}
            />

            {/* Focal point marker */}
            <div
              style={{
                position: "absolute",
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
                width: 22,
                height: 22,
                borderRadius: "50%",
                border: "2px solid white",
                boxShadow: "0 0 0 1.5px #A0622A, 0 2px 6px rgba(0,0,0,0.45)",
                background: "rgba(160,98,42,0.35)",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        {/* Live previews at real crop aspect ratios */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: "0.6rem", color: "var(--admin-muted)", marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Desktop banner
            </p>
            <div style={{ width: 260, height: Math.round(260 / DESKTOP_ASPECT), overflow: "hidden", borderRadius: 4, background: "#000" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition }} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: "0.6rem", color: "var(--admin-muted)", marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Mobile banner
            </p>
            <div style={{ width: 130, height: Math.round(130 / MOBILE_ASPECT), overflow: "hidden", borderRadius: 4, background: "#000" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CategoryHeroPage() {
  const positions = initialPositions as Record<string, Position>;
  const categories = Object.keys(CATEGORY_HERO_IMAGES);

  return (
    <div style={{ minHeight: "100vh", background: "var(--admin-bg)" }}>
      <div
        style={{
          background: "var(--admin-surface)",
          borderBottom: "1px solid var(--admin-border)",
          padding: "1.25rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--admin-text)", margin: 0 }}>
            Category Hero Positioning
          </h1>
          <p style={{ fontSize: "0.65rem", color: "var(--admin-muted)", margin: "0.25rem 0 0", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Drag the focal point, save — live in ~1 minute
          </p>
        </div>
        <Link href="/admin/dashboard" style={{ fontSize: "0.75rem", color: "var(--admin-muted)", textDecoration: "none" }}>
          ← Back to Dashboard
        </Link>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
        <p style={{ fontSize: "0.75rem", color: "var(--admin-muted)", marginBottom: "1.75rem", lineHeight: 1.6 }}>
          This controls where the shop page&apos;s category banner (e.g. bodystrands.com/shop?category=Belly%20Chains) crops
          each photo. Drag the dot onto the part of the image you want visible in the banner — the two previews on the
          right update live and show exactly what customers will see on desktop and mobile.
        </p>

        {categories.map((category) => {
          const image = CATEGORY_HERO_IMAGES[category as keyof typeof CATEGORY_HERO_IMAGES];
          if (!image) return null;
          return (
            <HeroPositionEditor
              key={category}
              category={category}
              image={image}
              initial={positions[category] ?? { x: 50, y: 0 }}
            />
          );
        })}
      </div>
    </div>
  );
}
