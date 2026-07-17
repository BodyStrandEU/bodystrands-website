"use client";

import { useEffect, useState, useCallback, use, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CATEGORIES, type Category, type Product } from "@/lib/products";

// ─── Sortable image item ──────────────────────────────────────────────────────

interface HeroBadge {
  label: string;
  active: boolean;
  activeColor: string;
  onClick: () => void;
}

interface SortableImageProps {
  id: string;
  url: string;
  onDelete: (url: string) => void;
  localPreview?: string;
  heroBadges?: HeroBadge[];
}

function SortableImage({ id, url, onDelete, localPreview, heroBadges }: SortableImageProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
    cursor: "grab",
  };

  // localPreview = blob URL kept alive for just-uploaded files (real URL 404s until Vercel deploys)
  // Etsy CDN images use /_next/image proxy (domain is in remotePatterns)
  // Local paths served directly
  const displaySrc = localPreview
    ?? (url.startsWith("http") ? `/_next/image?url=${encodeURIComponent(url)}&w=256&q=75` : url);

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div style={{
        width: "100px",
        height: "100px",
        border: "1px solid var(--admin-border)",
        borderRadius: "4px",
        overflow: "hidden",
        position: "relative",
        background: "var(--admin-surface2)",
      }}>
        {url.endsWith(".mp4") || url.endsWith(".mov") ? (
          <video
            src={url}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            muted
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displaySrc}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            draggable={false}
          />
        )}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(url);
          }}
          style={{
            position: "absolute",
            top: "2px",
            right: "2px",
            width: "20px",
            height: "20px",
            background: "rgba(0,0,0,0.7)",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          ×
        </button>
        {/* Inline hero/main badge buttons — only shown in gallery mode */}
        {heroBadges && heroBadges.length > 0 && (
          <div style={{ position: "absolute", bottom: "2px", left: "2px", display: "flex", gap: "2px" }}>
            {heroBadges.map((badge) => (
              <button
                key={badge.label}
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); badge.onClick(); }}
                title={badge.active ? `Currently set as ${badge.label}` : `Set as ${badge.label}`}
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "3px",
                  border: badge.active ? `1px solid ${badge.activeColor}` : "1px solid rgba(255,255,255,0.3)",
                  background: badge.active ? badge.activeColor : "rgba(0,0,0,0.55)",
                  color: "#fff",
                  fontSize: "9px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                  letterSpacing: 0,
                  transition: "all 0.12s",
                }}
              >
                {badge.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Image section with dnd ───────────────────────────────────────────────────

interface ImageSectionProps {
  title: string;
  images: string[];
  onChange: (images: string[]) => void;
  onUpload: (file: File) => Promise<string>;
}

function ImageSection({ title, images, onChange, onUpload }: ImageSectionProps) {
  const [dragOver, setDragOver] = useState(false);
  // pending: blob preview URLs shown while GitHub upload is in flight
  const [pending, setPending] = useState<{ id: string; previewUrl: string }[]>([]);
  // localPreviews: blob URLs kept alive after upload — real path 404s until Vercel deploys
  const [localPreviews, setLocalPreviews] = useState<Record<string, string>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = images.indexOf(active.id as string);
      const newIndex = images.indexOf(over.id as string);
      onChange(arrayMove(images, oldIndex, newIndex));
    }
  }

  function confirmDelete(url: string) {
    onChange(images.filter((img) => img !== url));
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const items = Array.from(files).map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    // Show blob previews immediately — no waiting for deploy
    setPending((p) => [...p, ...items.map(({ id, previewUrl }) => ({ id, previewUrl }))]);
    const realUrls: string[] = [];
    try {
      for (const item of items) {
        const url = await onUpload(item.file);
        realUrls.push(url);
        // Keep blob alive — real path 404s until Vercel deploys (~1 min)
        setLocalPreviews((prev) => ({ ...prev, [url]: item.previewUrl }));
        setPending((p) => p.filter((x) => x.id !== item.id));
      }
      onChange([...images, ...realUrls]);
    } catch (err) {
      items.forEach((item) => {
        setPending((p) => p.filter((x) => x.id !== item.id));
        URL.revokeObjectURL(item.previewUrl);
      });
      alert(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const isUploading = pending.length > 0;

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.85rem", fontWeight: 600, color: "var(--admin-text2)" }}>
        {title}
      </h4>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={images} strategy={rectSortingStrategy}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
            {images.map((url) => (
              <SortableImage key={url} id={url} url={url} onDelete={confirmDelete} localPreview={localPreviews[url]} />
            ))}
            {/* Uploading previews */}
            {pending.map((p) => (
              <div key={p.id} style={{ width: "100px", height: "100px", border: "1px solid var(--admin-border)", borderRadius: "4px", overflow: "hidden", position: "relative", background: "var(--admin-surface2)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontSize: "0.55rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>Uploading…</span>
                </div>
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Upload zone */}
      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFiles(e.dataTransfer.files);
        }}
        style={{
          display: "block",
          padding: "1rem",
          border: `2px dashed ${dragOver ? "#A0622A" : "var(--admin-border2)"}`,
          borderRadius: "4px",
          textAlign: "center",
          cursor: isUploading ? "wait" : "pointer",
          background: dragOver ? "#fdf6f0" : "var(--admin-bg)",
          transition: "all 0.15s",
        }}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
          multiple
          style={{ display: "none" }}
          onChange={(e) => { void handleFiles(e.target.files); }}
          disabled={isUploading}
        />
        <span style={{ fontSize: "0.78rem", color: "var(--admin-muted)" }}>
          {isUploading ? "Uploading..." : "Drop files here or click to upload (jpg, png, webp, mp4, mov)"}
        </span>
      </label>
    </div>
  );
}

// ─── Gallery section (unified mode) — images with inline hero badges ─────────

const VARIANT_BADGE_COLORS: Record<string, string> = {
  "Gold Tone":       "#C8A84B",
  "Silver Tone":     "#9ca3af",
  "Silver Plated":   "#9ca3af",
  "Stainless Steel": "#6b7280",
};

// Shortest prefix that uniquely identifies this variant among all variants
function variantBadgeLabel(v: string, all: string[]): string {
  for (let len = 1; len <= v.length; len++) {
    const candidate = v.slice(0, len);
    if (all.every((other) => other === v || !other.toLowerCase().startsWith(candidate.toLowerCase()))) {
      return candidate;
    }
  }
  return v.slice(0, 2);
}

interface GallerySectionProps {
  images: string[];
  variants: string[];
  variantHeroes: Record<string, string>;
  onReorder: (imgs: string[]) => void;
  onUpload: (file: File) => Promise<string>;
  onSetHero: (variant: string, img: string) => void;
}

function GallerySection({
  images,
  variants,
  variantHeroes,
  onReorder,
  onUpload,
  onSetHero,
}: GallerySectionProps) {
  const [dragOver, setDragOver] = useState(false);
  const [pending, setPending] = useState<{ id: string; previewUrl: string }[]>([]);
  const [localPreviews, setLocalPreviews] = useState<Record<string, string>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = images.indexOf(active.id as string);
      const newIndex = images.indexOf(over.id as string);
      onReorder(arrayMove(images, oldIndex, newIndex));
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const items = Array.from(files).map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPending((p) => [...p, ...items.map(({ id, previewUrl }) => ({ id, previewUrl }))]);
    try {
      for (const item of items) {
        const url = await onUpload(item.file);
        setLocalPreviews((prev) => ({ ...prev, [url]: item.previewUrl }));
        setPending((p) => p.filter((x) => x.id !== item.id));
        onReorder([...images, url]);
      }
    } catch (err) {
      items.forEach((item) => { setPending((p) => p.filter((x) => x.id !== item.id)); });
      alert(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const isUploading = pending.length > 0;

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <h4 style={{ margin: "0 0 0.4rem", fontSize: "0.85rem", fontWeight: 600, color: "var(--admin-text2)" }}>
        All Images (drag to reorder)
      </h4>
      <p style={{ margin: "0 0 0.75rem", fontSize: "0.72rem", color: "var(--admin-muted)" }}>
        First image = shop card thumbnail. Drag to reorder.
        {variants.length > 0 && <> Click <strong>{variants.map(v => variantBadgeLabel(v, variants)).join(" / ")}</strong> to set the hero shown when a buyer picks that tone.</>}
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={images} strategy={rectSortingStrategy}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
            {images.map((url) => {
              const badges: HeroBadge[] = variants.map((v) => ({
                label: variantBadgeLabel(v, variants),
                active: variantHeroes[v] === url,
                activeColor: VARIANT_BADGE_COLORS[v] ?? "#A0622A",
                onClick: () => onSetHero(v, url),
              }));
              return (
                <SortableImage
                  key={url}
                  id={url}
                  url={url}
                  onDelete={(img) => onReorder(images.filter((x) => x !== img))}
                  localPreview={localPreviews[url]}
                  heroBadges={badges}
                />
              );
            })}
            {pending.map((p) => (
              <div key={p.id} style={{ width: "100px", height: "100px", border: "1px solid var(--admin-border)", borderRadius: "4px", overflow: "hidden", position: "relative", background: "var(--admin-surface2)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontSize: "0.55rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>Uploading…</span>
                </div>
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); void handleFiles(e.dataTransfer.files); }}
        style={{
          display: "block",
          padding: "1rem",
          border: `2px dashed ${dragOver ? "#A0622A" : "var(--admin-border2)"}`,
          borderRadius: "4px",
          textAlign: "center",
          cursor: isUploading ? "wait" : "pointer",
          background: dragOver ? "#fdf6f0" : "var(--admin-bg)",
          transition: "all 0.15s",
        }}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
          multiple
          style={{ display: "none" }}
          onChange={(e) => { void handleFiles(e.target.files); }}
          disabled={isUploading}
        />
        <span style={{ fontSize: "0.78rem", color: "var(--admin-muted)" }}>
          {isUploading ? "Uploading..." : "Drop files here or click to upload (jpg, png, webp, mp4, mov)"}
        </span>
      </label>
    </div>
  );
}

// ─── Video drop zone ─────────────────────────────────────────────────────────

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

async function uploadFileDirect(file: File): Promise<string> {
  const configRes = await fetch("/api/admin/upload-config");
  if (!configRes.ok) throw new Error("Not authorised");
  const { token, repo, branch } = await configRes.json() as { token: string; repo: string; branch: string };

  const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `public/images/products/${filename}`;

  let sha: string | undefined;
  try {
    const check = await fetch(`https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
    });
    if (check.ok) sha = ((await check.json()) as { sha: string }).sha;
  } catch { /* new file */ }

  const base64 = await fileToBase64(file);
  const body: Record<string, string> = { message: `Upload product file: ${filename}`, content: base64, branch };
  if (sha) body.sha = sha;

  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${text.slice(0, 200)}`);
  }
  return `/images/products/${filename}`;
}

interface VideoDropZoneProps {
  value: string;
  onChange: (path: string) => void;
}

function VideoDropZone({ value, onChange }: VideoDropZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [progress, setProgress] = useState("");

  async function handleFile(file: File) {
    setUploadError("");
    setUploading(true);
    try {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      // Step 1: get a one-time direct upload URL from Cloudflare via our API (tiny request, no file bytes)
      setProgress(`Preparing upload (${mb} MB)…`);
      const urlRes = await fetch("/api/admin/stream-upload");
      if (!urlRes.ok) {
        const err = await urlRes.json() as { error?: string };
        throw new Error(err.error ?? "Failed to get upload URL");
      }
      const { uploadURL, streamUrl, uid } = await urlRes.json() as { uploadURL: string; streamUrl: string; uid: string };

      // Step 2: POST file directly to Cloudflare — bypasses Vercel entirely, no size limit
      setProgress(`Uploading ${mb} MB directly to Cloudflare…`);
      const form = new FormData();
      form.append("file", file, file.name);
      const cfRes = await fetch(uploadURL, { method: "POST", body: form });
      if (!cfRes.ok) throw new Error(`Cloudflare rejected upload (${cfRes.status})`);

      // Step 3: Enable MP4 downloads so /downloads/default.mp4 URL works on the product page
      setProgress("Enabling MP4 playback…");
      await fetch("/api/admin/stream-enable-mp4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });

      onChange(streamUrl);
      setProgress("");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
      setProgress("");
    } finally {
      setUploading(false);
    }
  }

  const inputSt: React.CSSProperties = {
    width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--admin-border2)",
    borderRadius: "4px", fontSize: "0.85rem", color: "var(--admin-text)", background: "var(--admin-surface)", boxSizing: "border-box",
  };

  return (
    <div>
      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) void handleFile(file);
        }}
        style={{
          display: "block", padding: "1.25rem",
          border: `2px dashed ${dragOver ? "#A0622A" : "var(--admin-border2)"}`,
          borderRadius: "4px", textAlign: "center",
          cursor: uploading ? "wait" : "pointer",
          background: dragOver ? "#fdf6f0" : "var(--admin-bg)",
          transition: "all 0.15s", marginBottom: "0.5rem",
        }}
      >
        <input
          type="file"
          accept="video/mp4,video/quicktime,.mp4,.mov"
          style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }}
          disabled={uploading}
        />
        <div style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>🎬</div>
        <span style={{ fontSize: "0.78rem", color: uploading ? "#A0622A" : "var(--admin-muted)" }}>
          {progress || (uploading ? "Uploading…" : "Drop video here or click to upload")}
        </span>
        <br />
        <span style={{ fontSize: "0.7rem", color: "var(--admin-muted2)" }}>
          Any size · .mp4 or .mov · uploads directly to Cloudflare Stream
        </span>
      </label>

      {uploadError && (
        <p style={{ fontSize: "0.75rem", color: "#991b1b", margin: "0 0 0.5rem", background: "#fee2e2", padding: "0.5rem 0.75rem", borderRadius: "4px" }}>
          {uploadError}
        </p>
      )}

      <input
        style={inputSt}
        value={value}
        onChange={(e) => { setUploadError(""); onChange(e.target.value); }}
        placeholder="/images/products/my-video.mp4"
      />

      {value && (
        <div style={{ marginTop: "0.5rem", display: "inline-flex", flexDirection: "column", gap: "0.4rem" }}>
          <video
            src={value}
            style={{ width: "100%", maxWidth: "200px", height: "auto", borderRadius: "4px", border: "1px solid var(--admin-border)" }}
            muted
            controls
          />
          <button
            type="button"
            onClick={() => { if (confirm("Remove this video?")) onChange(""); }}
            style={{
              padding: "0.3rem 0.75rem",
              background: "#fee2e2",
              color: "#991b1b",
              border: "1px solid #fca5a5",
              borderRadius: "4px",
              fontSize: "0.75rem",
              cursor: "pointer",
              alignSelf: "flex-start",
            }}
          >
            Remove video
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Size guide image drop zone ───────────────────────────────────────────────

interface SizeGuideDropZoneProps {
  value: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<string>;
}

function SizeGuideDropZone({ value, onChange, onUpload }: SizeGuideDropZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver]   = useState(false);
  const [error, setError]         = useState("");
  const [localPreview, setLocalPreview] = useState("");

  async function handleFile(file: File) {
    setError("");
    setUploading(true);
    setLocalPreview(URL.createObjectURL(file));
    try {
      const url = await onUpload(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setLocalPreview("");
    } finally {
      setUploading(false);
    }
  }

  if (value || localPreview) {
    return (
      <div style={{ display: "inline-flex", flexDirection: "column", gap: "0.5rem" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={localPreview || value}
          alt="Size guide"
          style={{ width: "160px", height: "160px", objectFit: "cover", borderRadius: "4px", border: "1px solid var(--admin-border)" }}
        />
        <button
          type="button"
          onClick={() => { setLocalPreview(""); onChange(""); }}
          style={{ padding: "0.3rem 0.75rem", background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer", alignSelf: "flex-start" }}
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div>
      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) void handleFile(file);
        }}
        style={{
          display: "block", padding: "1.25rem",
          border: `2px dashed ${dragOver ? "#A0622A" : "var(--admin-border2)"}`,
          borderRadius: "4px", textAlign: "center",
          cursor: uploading ? "wait" : "pointer",
          background: dragOver ? "#fdf6f0" : "var(--admin-bg)",
          transition: "all 0.15s",
        }}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }}
          disabled={uploading}
        />
        <span style={{ fontSize: "0.78rem", color: uploading ? "#A0622A" : "var(--admin-muted)" }}>
          {uploading ? "Uploading…" : "Drop sizing image here or click to upload"}
        </span>
      </label>
      {error && (
        <p style={{ fontSize: "0.75rem", color: "#991b1b", margin: "0.5rem 0 0" }}>{error}</p>
      )}
    </div>
  );
}

// ─── Sortable variant block ───────────────────────────────────────────────────

interface SortableVariantBlockProps {
  variant: string;
  images: string[];
  videoValue: string;
  isFirst: boolean;
  onImagesChange: (imgs: string[]) => void;
  onVideoChange: (url: string) => void;
  onRemove: () => void;
  onUpload: (file: File) => Promise<string>;
}

function SortableVariantBlock({
  variant, images, videoValue, isFirst,
  onImagesChange, onVideoChange, onRemove, onUpload,
}: SortableVariantBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: variant });

  const blockStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    border: "1px solid var(--admin-border)",
    borderRadius: "6px",
    padding: "1rem",
    marginBottom: "1rem",
    background: isDragging ? "var(--admin-surface2)" : undefined,
  };

  const handleLabelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "var(--admin-text2)",
    marginBottom: "0.35rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  return (
    <div ref={setNodeRef} style={blockStyle} {...attributes}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          {/* Drag handle — only this triggers drag, not clicks inside the block */}
          <div
            ref={setActivatorNodeRef}
            {...listeners}
            title="Drag to reorder"
            style={{
              cursor: isDragging ? "grabbing" : "grab",
              color: "var(--admin-muted2)",
              fontSize: "1rem",
              lineHeight: 1,
              padding: "0.2rem 0.1rem",
              userSelect: "none",
              touchAction: "none",
            }}
          >
            ⠿
          </div>
          <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: "var(--admin-text2)" }}>
            {variant}
          </h3>
          {isFirst && (
            <span style={{
              fontSize: "0.65rem",
              background: "#fef3c7",
              color: "#92400e",
              padding: "0.1rem 0.45rem",
              borderRadius: "10px",
              fontWeight: 600,
              letterSpacing: "0.03em",
            }}>
              Default
            </span>
          )}
        </div>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onRemove}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--admin-muted2)", fontSize: "0.75rem" }}
        >
          Remove variant
        </button>
      </div>

      <ImageSection
        title={`${variant} — Images (drag to reorder)`}
        images={images}
        onChange={onImagesChange}
        onUpload={onUpload}
      />

      <div>
        <label style={handleLabelStyle}>Video (optional)</label>
        <VideoDropZone value={videoValue} onChange={onVideoChange} />
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

type ProductForm = Omit<Product, "price"> & { price: string };

export default function ProductEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === "new";
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const emptyForm = (): ProductForm => ({
    id: "",
    name: "",
    price: "",
    currency: "EUR",
    category: "Body Chains" as Category,
    description: "",
    fullDescription: "",
    specs: [],
    variantGroups: [],
    images: [],
    gallery: undefined,
    variantImages: {},
    variantHeroes: {},
    video: "",
    variantVideos: {},
    featured: false,
    variants: [],
    active: true,
  });

  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [rawPrices, setRawPrices] = useState<Record<number, string>>({});

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => {
        if (r.status === 401) { router.push("/admin/login"); return null; }
        return r.json() as Promise<Product[]>;
      })
      .then((data) => {
        if (!data) return;
        setAllProducts(data);
        if (!isNew) {
          const found = data.find((p) => p.id === id);
          if (found) {
            setForm({
              ...found,
              price: String(found.price),
              fullDescription: found.fullDescription ?? "",
              video: found.video ?? "",
              gallery: found.gallery,
              variantImages: found.variantImages ?? {},
              variantHeroes: found.variantHeroes ?? {},
              variantVideos: found.variantVideos ?? {},
              variants: found.variants ?? [],
              specs: found.specs ?? [],
              variantGroups: found.variantGroups ?? [],
            });
          } else {
            setError("Product not found");
          }
        }
      })
      .catch(() => setError("Failed to load products"))
      .finally(() => setLoading(false));
  }, [id, isNew, router]);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    return uploadFileDirect(file);
  }, []);

  async function handleSave() {
    setError("");
    setSaving(true);
    setSuccess(false);

    try {
      // Validate
      if (!form.name.trim()) { setError("Name is required"); setSaving(false); return; }
      if (!form.id.trim()) { setError("ID is required"); setSaving(false); return; }
      if (!form.price || isNaN(Number(form.price))) { setError("Valid price is required"); setSaving(false); return; }

      const product: Product = {
        ...form,
        price: Number(form.price),
        dateAdded: form.dateAdded ?? (isNew ? new Date().toISOString() : undefined),
        fullDescription: form.fullDescription || undefined,
        video: form.video || undefined,
        gallery: (form.gallery ?? []).length > 0 ? form.gallery : undefined,
        sizeGuideImage: form.sizeGuideImage || undefined,
        // In gallery mode, first image is always the shop card thumbnail
        images: form.gallery && form.gallery.length > 0 ? [form.gallery[0]] : form.images,
        variantImages: !form.gallery && Object.keys(form.variantImages ?? {}).length > 0 ? form.variantImages : undefined,
        variantHeroes: Object.keys(form.variantHeroes ?? {}).length > 0 ? form.variantHeroes : undefined,
        variantVideos: Object.keys(form.variantVideos ?? {}).length > 0 ? form.variantVideos : undefined,
        variants: (form.variants ?? []).length > 0 ? form.variants : undefined,
        specs: (form.specs ?? []).length > 0 ? form.specs : undefined,
        variantGroups: (form.variantGroups ?? []).length > 0 ? form.variantGroups : undefined,
      };

      let updated: Product[];
      if (isNew) {
        if (allProducts.find((p) => p.id === product.id)) {
          setError("A product with this ID already exists");
          setSaving(false);
          return;
        }
        updated = [...allProducts, product];
      } else {
        updated = allProducts.map((p) => (p.id === product.id ? product : p));
      }

      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Save failed");
      }

      setSuccess(true);
      setAllProducts(updated);
      if (isNew) {
        router.push(`/admin/product/${product.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function updateVariantImages(variant: string, images: string[]) {
    setForm((f) => ({
      ...f,
      variantImages: { ...(f.variantImages ?? {}), [variant]: images },
    }));
  }

  function updateVariantVideo(variant: string, url: string) {
    setForm((f) => ({
      ...f,
      variantVideos: { ...(f.variantVideos ?? {}), [variant]: url },
    }));
  }

  function addVariant() {
    const name = prompt("Variant name (e.g. Gold Tone):");
    if (!name?.trim()) return;
    setForm((f) => ({
      ...f,
      variants: [...(f.variants ?? []), name.trim()],
      variantImages: { ...(f.variantImages ?? {}), [name.trim()]: [] },
    }));
  }

  function removeVariant(name: string) {
    if (!confirm(`Remove variant "${name}"?`)) return;
    setForm((f) => {
      const vi = { ...(f.variantImages ?? {}) };
      const vv = { ...(f.variantVideos ?? {}) };
      delete vi[name];
      delete vv[name];
      return {
        ...f,
        variants: (f.variants ?? []).filter((v) => v !== name),
        variantImages: vi,
        variantVideos: vv,
      };
    });
  }

  const variantSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleVariantDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const variants = form.variants ?? [];
    const oldIndex = variants.indexOf(active.id as string);
    const newIndex = variants.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    const newVariants = arrayMove(variants, oldIndex, newIndex);

    // Rebuild both maps in the new order — Object.values() on the saved JSON must
    // return the first variant's data first, so insertion order matters here.
    const vi = form.variantImages ?? {};
    const vv = form.variantVideos ?? {};
    const newVariantImages: Record<string, string[]> = {};
    const newVariantVideos: Record<string, string> = {};
    for (const v of newVariants) {
      if (vi[v] !== undefined) newVariantImages[v] = vi[v];
      if (vv[v] !== undefined) newVariantVideos[v] = vv[v];
    }

    setForm((f) => ({
      ...f,
      variants: newVariants,
      variantImages: newVariantImages,
      variantVideos: newVariantVideos,
    }));
  }

  function addSpec() {
    setForm((f) => ({ ...f, specs: [...(f.specs ?? []), { label: "", value: "" }] }));
  }

  function updateSpec(index: number, field: "label" | "value", value: string) {
    setForm((f) => {
      const specs = [...(f.specs ?? [])];
      specs[index] = { ...specs[index], [field]: value };
      return { ...f, specs };
    });
  }

  function removeSpec(index: number) {
    setForm((f) => ({ ...f, specs: (f.specs ?? []).filter((_, i) => i !== index) }));
  }

  function addVariantGroup() {
    const typeChoice = prompt("Selector type:\n\n1 = Options (buttons customer clicks)\n2 = Text Box (customer types something)\n\nEnter 1 or 2:");
    const type: "options" | "text" = typeChoice === "2" ? "text" : "options";
    const label = prompt("Selector label (e.g. Size, Engraving Text, Butterfly Color):");
    if (!label?.trim()) return;
    if (type === "text") {
      const placeholder = prompt("Placeholder text shown inside the box (e.g. 'Enter your name'):") ?? "";
      setForm((f) => ({
        ...f,
        variantGroups: [...(f.variantGroups ?? []), { label: label.trim(), type: "text", placeholder }],
      }));
    } else {
      const raw = prompt(`Options for "${label.trim()}" — comma-separated (e.g. Small,Medium,Large):`);
      if (!raw?.trim()) return;
      const options = raw.split(",").map((o) => o.trim()).filter(Boolean);
      if (options.length === 0) return;
      setForm((f) => ({
        ...f,
        variantGroups: [...(f.variantGroups ?? []), { label: label.trim(), type: "options", options }],
      }));
    }
  }

  function removeVariantGroup(index: number) {
    setForm((f) => ({ ...f, variantGroups: (f.variantGroups ?? []).filter((_, i) => i !== index) }));
  }

  function updateVariantGroupOptions(index: number, raw: string) {
    const options = raw.split(",").map((o) => o.trim()).filter(Boolean);
    setForm((f) => {
      const vg = [...(f.variantGroups ?? [])];
      vg[index] = { ...vg[index], options };
      return { ...f, variantGroups: vg };
    });
  }

  function updateVariantGroupPlaceholder(index: number, value: string) {
    setForm((f) => {
      const vg = [...(f.variantGroups ?? [])];
      vg[index] = { ...vg[index], placeholder: value };
      return { ...f, variantGroups: vg };
    });
  }

  // optionPrices stored as "OptionName:price" comma-separated string for easy editing
  function parseOptionPrices(raw: string): Record<string, number> {
    const result: Record<string, number> = {};
    raw.split(",").forEach((pair) => {
      const [name, val] = pair.split(":").map((s) => s.trim());
      const num = parseFloat(val);
      if (name && !isNaN(num) && num > 0) result[name] = num;
    });
    return result;
  }

  function formatOptionPrices(prices?: Record<string, number>): string {
    if (!prices) return "";
    return Object.entries(prices).map(([k, v]) => `${k}:${v}`).join(", ");
  }

  function updateVariantGroupPrices(index: number, raw: string) {
    setForm((f) => {
      const vg = [...(f.variantGroups ?? [])];
      vg[index] = { ...vg[index], optionPrices: raw.trim() ? parseOptionPrices(raw) : undefined };
      return { ...f, variantGroups: vg };
    });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.5rem 0.75rem",
    border: "1px solid var(--admin-border2)",
    borderRadius: "4px",
    fontSize: "0.85rem",
    color: "var(--admin-text)",
    background: "var(--admin-surface)",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "var(--admin-text2)",
    marginBottom: "0.35rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const sectionStyle: React.CSSProperties = {
    background: "var(--admin-surface)",
    border: "1px solid var(--admin-border)",
    borderRadius: "8px",
    padding: "1.5rem",
    marginBottom: "1.25rem",
  };

  if (loading) return (
    <div style={{ padding: "2rem", color: "var(--admin-muted)" }}>Loading...</div>
  );

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
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div>
          <button
            onClick={() => router.push("/admin/dashboard")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--admin-muted)", fontSize: "0.85rem", padding: 0 }}
          >
            ← Dashboard
          </button>
          <h1 style={{ margin: "0.25rem 0 0", fontSize: "1.1rem", fontWeight: 600, color: "var(--admin-text)" }}>
            {isNew ? "New Product" : form.name || "Edit Product"}
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {success && (
            <span style={{ fontSize: "0.8rem", color: "#065f46", background: "#d1fae5", padding: "0.35rem 0.75rem", borderRadius: "4px" }}>
              Saved! Changes will be live in ~1 minute
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
        </div>
      </div>

      <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>

        {/* Basic Info */}
        <div style={sectionStyle}>
          <h2 style={{ margin: "0 0 1.25rem", fontSize: "0.9rem", fontWeight: 700, color: "var(--admin-text)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Basic Info
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={labelStyle}>Product ID</label>
              <input
                style={inputStyle}
                value={form.id}
                onChange={(e) => setForm((f) => ({ ...f, id: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                placeholder="my-product-id"
                disabled={!isNew}
              />
              {isNew && <p style={{ fontSize: "0.7rem", color: "var(--admin-muted)", margin: "0.25rem 0 0" }}>URL-safe, lowercase, hyphens only. Cannot be changed later.</p>}
            </div>
            <div>
              <label style={labelStyle}>Name</label>
              <input
                style={inputStyle}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Product name"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={labelStyle}>Price (EUR)</label>
              <input
                style={inputStyle}
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select
                style={{ ...inputStyle }}
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "0.5rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.82rem", color: "var(--admin-text2)" }}>
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                />
                Featured
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.82rem", color: "var(--admin-text2)" }}>
                <input
                  type="checkbox"
                  checked={form.active ?? true}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                />
                Active (visible on site)
              </label>
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Short Description</label>
            <textarea
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Short teaser shown on product page"
            />
          </div>

          <div>
            <label style={labelStyle}>Full Description (optional)</label>
            <textarea
              style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }}
              value={form.fullDescription ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, fullDescription: e.target.value }))}
              placeholder="Longer copy shown in collapsible details"
            />
          </div>
        </div>

        {/* Specs */}
        <div style={sectionStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "var(--admin-text)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Specs
            </h2>
            <button
              onClick={addSpec}
              style={{
                padding: "0.3rem 0.75rem",
                background: "transparent",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "0.75rem",
                cursor: "pointer",
                color: "var(--admin-text2)",
              }}
            >
              + Add Spec
            </button>
          </div>

          {(form.specs ?? []).map((spec, i) => (
            <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "center" }}>
              <input
                style={{ ...inputStyle, flex: "0 0 180px" }}
                value={spec.label}
                onChange={(e) => updateSpec(i, "label", e.target.value)}
                placeholder="Label"
              />
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={spec.value}
                onChange={(e) => updateSpec(i, "value", e.target.value)}
                placeholder="Value"
              />
              <button
                onClick={() => removeSpec(i)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--admin-muted2)",
                  fontSize: "1.2rem",
                  lineHeight: 1,
                  padding: "0.25rem",
                }}
              >
                ×
              </button>
            </div>
          ))}
          {(form.specs ?? []).length === 0 && (
            <p style={{ fontSize: "0.78rem", color: "var(--admin-muted2)" }}>No specs yet.</p>
          )}
        </div>

        {/* Variant Groups (mandatory customer selectors) */}
        <div style={sectionStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <h2 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "var(--admin-text)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Customer Selectors
            </h2>
            <button
              onClick={addVariantGroup}
              style={{ padding: "0.3rem 0.75rem", background: "transparent", border: "1px solid var(--admin-border2)", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer", color: "var(--admin-text2)" }}
            >
              + Add Selector
            </button>
          </div>
          <p style={{ margin: "0 0 1rem", fontSize: "0.78rem", color: "var(--admin-muted)" }}>
            Mandatory options the buyer must choose before adding to cart (e.g. Size, Butterfly Color, Birthstone).
          </p>
          {(form.variantGroups ?? []).map((group, i) => (
            <div key={i} style={{ background: "var(--admin-bg)", border: "1px solid var(--admin-border)", borderRadius: "6px", padding: "0.75rem 1rem", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--admin-text)" }}>{group.label}</span>
                  <span style={{ fontSize: "0.65rem", background: group.type === "text" ? "#ede9fe" : "#e0f2fe", color: group.type === "text" ? "#6d28d9" : "#0369a1", padding: "0.1rem 0.4rem", borderRadius: "3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {group.type === "text" ? "Text Box" : "Options"}
                  </span>
                </div>
                <button onClick={() => removeVariantGroup(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--admin-muted2)", fontSize: "1.1rem", lineHeight: 1 }}>×</button>
              </div>

              {group.type === "text" ? (
                <>
                  <input
                    style={{ ...inputStyle, fontSize: "0.78rem" }}
                    value={group.placeholder ?? ""}
                    onChange={(e) => updateVariantGroupPlaceholder(i, e.target.value)}
                    placeholder="Placeholder text shown to customer (e.g. Enter your name)"
                  />
                  <p style={{ margin: "0.3rem 0 0", fontSize: "0.72rem", color: "var(--admin-muted2)" }}>
                    Customer must fill this in before they can buy
                  </p>
                </>
              ) : (
                <>
                  <input
                    style={{ ...inputStyle, fontSize: "0.78rem", marginBottom: "0.5rem" }}
                    value={(group.options ?? []).join(", ")}
                    onChange={(e) => updateVariantGroupOptions(i, e.target.value)}
                    placeholder="Option 1, Option 2, Option 3"
                  />
                  <p style={{ margin: "0 0 0.5rem", fontSize: "0.72rem", color: "var(--admin-muted2)" }}>
                    Edit options as comma-separated values
                  </p>
                  <input
                    style={{ ...inputStyle, fontSize: "0.78rem" }}
                    value={i in rawPrices ? rawPrices[i] : formatOptionPrices(group.optionPrices)}
                    onChange={(e) => setRawPrices((prev) => ({ ...prev, [i]: e.target.value }))}
                    onBlur={(e) => {
                      updateVariantGroupPrices(i, e.target.value);
                      setRawPrices((prev) => { const n = { ...prev }; delete n[i]; return n; });
                    }}
                    placeholder="Price add-ons (optional) — e.g. Large:5, XL:10"
                  />
                  <p style={{ margin: "0.3rem 0 0", fontSize: "0.72rem", color: "var(--admin-muted2)" }}>
                    Format: OptionName:amount — leave blank for no price add
                  </p>
                </>
              )}
            </div>
          ))}
          {(form.variantGroups ?? []).length === 0 && (
            <p style={{ fontSize: "0.78rem", color: "var(--admin-muted2)" }}>No customer selectors yet.</p>
          )}
        </div>

        {/* Size Guide — single image shown via a "Size Guide" button on the product page */}
        <div style={sectionStyle}>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", fontWeight: 700, color: "var(--admin-text)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Size Guide
          </h2>
          <p style={{ margin: "0 0 1rem", fontSize: "0.78rem", color: "var(--admin-muted)" }}>
            Optional. Upload a sizing infographic and a &quot;Size Guide&quot; button automatically appears next to the Size selector on this product&apos;s page. Leave empty to hide it.
          </p>
          <SizeGuideDropZone
            value={form.sizeGuideImage ?? ""}
            onChange={(url) => setForm((f) => ({ ...f, sizeGuideImage: url }))}
            onUpload={uploadFile}
          />
        </div>

        {/* Card thumbnail images — only shown when there are no variants,
            otherwise the shop card uses the first variant's images automatically */}
        {(form.variants ?? []).length === 0 && (
          <div style={sectionStyle}>
            <h2 style={{ margin: "0 0 0.75rem", fontSize: "0.9rem", fontWeight: 700, color: "var(--admin-text)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Card Thumbnail Images
            </h2>
            <p style={{ margin: "0 0 1rem", fontSize: "0.78rem", color: "var(--admin-muted)" }}>
              Used on the shop grid. First image is the main thumbnail.
            </p>
            <ImageSection
              title=""
              images={form.images}
              onChange={(imgs) => setForm((f) => ({ ...f, images: imgs }))}
              onUpload={uploadFile}
            />
          </div>
        )}

        {/* Variants & Gallery Images */}
        <div style={sectionStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "var(--admin-text)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Variants &amp; Gallery Images
              </h2>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.78rem", color: "var(--admin-muted)" }}>
                {form.gallery ? "Unified gallery — one image row for all variants." : "Drag ⠿ to reorder variants — first variant is the default shown on shop cards."}
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => {
                  if (form.gallery) {
                    // Switch back to per-variant mode
                    const vi: Record<string, string[]> = {};
                    for (const v of form.variants ?? []) vi[v] = form.gallery ?? [];
                    setForm((f) => ({ ...f, gallery: undefined, variantHeroes: {}, variantImages: vi }));
                  } else {
                    // Switch to gallery mode — merge all variant images
                    const all: string[] = [];
                    for (const v of form.variants ?? []) {
                      for (const img of (form.variantImages ?? {})[v] ?? []) {
                        if (!all.includes(img)) all.push(img);
                      }
                    }
                    const heroes: Record<string, string> = {};
                    for (const v of form.variants ?? []) {
                      const first = (form.variantImages ?? {})[v]?.[0];
                      if (first) heroes[v] = first;
                    }
                    setForm((f) => ({ ...f, gallery: all, variantHeroes: heroes, variantImages: {} }));
                  }
                }}
                style={{
                  padding: "0.3rem 0.75rem",
                  background: form.gallery ? "#e0f2fe" : "transparent",
                  border: `1px solid ${form.gallery ? "#0369a1" : "#d1d5db"}`,
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  color: form.gallery ? "#0369a1" : "var(--admin-text2)",
                  fontWeight: form.gallery ? 600 : 400,
                }}
              >
                {form.gallery ? "✓ Unified Gallery" : "Switch to Unified Gallery"}
              </button>
              {!form.gallery && (
                <button
                  onClick={addVariant}
                  style={{
                    padding: "0.3rem 0.75rem",
                    background: "transparent",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    color: "var(--admin-text2)",
                  }}
                >
                  + Add Variant
                </button>
              )}
            </div>
          </div>

          {/* Unified Gallery Mode */}
          {form.gallery ? (
            <div>
              <GallerySection
                images={form.gallery}
                variants={form.variants ?? []}
                variantHeroes={form.variantHeroes ?? {}}
                onReorder={(imgs) => setForm((f) => ({ ...f, gallery: imgs }))}
                onUpload={uploadFile}
                onSetHero={(variant, img) => setForm((f) => ({
                  ...f,
                  variantHeroes: { ...(f.variantHeroes ?? {}), [variant]: img },
                }))}
              />
              {/* Video section for gallery mode — single unified dropzone */}
              <div style={{ marginTop: "1.5rem" }}>
                <h3 style={{ margin: "0 0 0.75rem", fontSize: "0.85rem", fontWeight: 700, color: "var(--admin-text)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Video
                </h3>
                <VideoDropZone
                  value={(form.variants ?? []).length > 0
                    ? (form.variantVideos ?? {})[(form.variants ?? [])[0]] ?? ""
                    : form.video ?? ""}
                  onChange={(v) => {
                    if ((form.variants ?? []).length > 0) {
                      const vv: Record<string, string> = {};
                      for (const variant of (form.variants ?? [])) vv[variant] = v;
                      setForm((f) => ({ ...f, variantVideos: vv }));
                    } else {
                      setForm((f) => ({ ...f, video: v }));
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            /* Per-Variant Mode (existing behavior) */
            <>
              {(form.variants ?? []).length === 0 && (
                <p style={{ fontSize: "0.78rem", color: "var(--admin-muted2)" }}>No variants. Click "Add Variant" to add one.</p>
              )}
              <DndContext
                sensors={variantSensors}
                collisionDetection={closestCenter}
                onDragEnd={handleVariantDragEnd}
              >
                <SortableContext items={form.variants ?? []} strategy={verticalListSortingStrategy}>
                  {(form.variants ?? []).map((variant, index) => (
                    <SortableVariantBlock
                      key={variant}
                      variant={variant}
                      images={(form.variantImages ?? {})[variant] ?? []}
                      videoValue={(form.variantVideos ?? {})[variant] ?? ""}
                      isFirst={index === 0}
                      onImagesChange={(imgs) => updateVariantImages(variant, imgs)}
                      onVideoChange={(v) => updateVariantVideo(variant, v)}
                      onRemove={() => removeVariant(variant)}
                      onUpload={uploadFile}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </>
          )}
        </div>

        {/* No-variant video — only when not in gallery mode (gallery has its own video slot) */}
        {(form.variants ?? []).length === 0 && !form.gallery && (
          <div style={sectionStyle}>
            <h2 style={{ margin: "0 0 0.75rem", fontSize: "0.9rem", fontWeight: 700, color: "var(--admin-text)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Video (optional)
            </h2>
            <VideoDropZone
              value={form.video ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, video: v }))}
            />
          </div>
        )}

        {/* Bottom save */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", paddingTop: "0.5rem" }}>
          <button
            onClick={() => router.push("/admin/dashboard")}
            style={{
              padding: "0.6rem 1.5rem",
              background: "transparent",
              border: "1px solid var(--admin-border2)",
              borderRadius: "4px",
              fontSize: "0.85rem",
              cursor: "pointer",
              color: "var(--admin-text2)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "0.6rem 1.5rem",
              background: saving ? "#9ca3af" : "#A0622A",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "0.85rem",
              cursor: saving ? "wait" : "pointer",
              fontWeight: 500,
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
}
