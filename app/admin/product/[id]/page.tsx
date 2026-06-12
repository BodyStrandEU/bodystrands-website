"use client";

import { useEffect, useState, useCallback, use } from "react";
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
  useSortable,
} from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CATEGORIES, type Category, type Product } from "@/lib/products";

// ─── Sortable image item ──────────────────────────────────────────────────────

interface SortableImageProps {
  id: string;
  url: string;
  onDelete: (url: string) => void;
}

function SortableImage({ id, url, onDelete }: SortableImageProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div style={{
        width: "100px",
        height: "100px",
        border: "1px solid #e5e7eb",
        borderRadius: "4px",
        overflow: "hidden",
        position: "relative",
        background: "#f3f4f6",
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
            src={url}
            alt=""
            referrerPolicy="no-referrer"
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
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

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
    if (!confirm(`Delete image "${url.split("/").pop()}"?`)) return;
    onChange(images.filter((img) => img !== url));
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await onUpload(file);
        urls.push(url);
      }
      onChange([...images, ...urls]);
    } catch (err) {
      alert(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>
        {title}
      </h4>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={images} strategy={rectSortingStrategy}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
            {images.map((url) => (
              <SortableImage key={url} id={url} url={url} onDelete={confirmDelete} />
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
          border: `2px dashed ${dragOver ? "#A0622A" : "#d1d5db"}`,
          borderRadius: "4px",
          textAlign: "center",
          cursor: uploading ? "wait" : "pointer",
          background: dragOver ? "#fdf6f0" : "#f9fafb",
          transition: "all 0.15s",
        }}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
          multiple
          style={{ display: "none" }}
          onChange={(e) => { void handleFiles(e.target.files); }}
          disabled={uploading}
        />
        <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>
          {uploading ? "Uploading..." : "Drop files here or click to upload (jpg, png, webp, mp4, mov)"}
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

async function uploadVideoDirect(file: File): Promise<string> {
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
  const body: Record<string, string> = { message: `Upload product video: ${filename}`, content: base64, branch };
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
    setProgress("");
    setUploading(true);
    try {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      setProgress(`Uploading ${mb} MB…`);
      const url = await uploadVideoDirect(file);
      onChange(url);
      setProgress("");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
      setProgress("");
    } finally {
      setUploading(false);
    }
  }

  const inputSt: React.CSSProperties = {
    width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #d1d5db",
    borderRadius: "4px", fontSize: "0.85rem", color: "#111", background: "#fff", boxSizing: "border-box",
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
          border: `2px dashed ${dragOver ? "#A0622A" : "#d1d5db"}`,
          borderRadius: "4px", textAlign: "center",
          cursor: uploading ? "wait" : "pointer",
          background: dragOver ? "#fdf6f0" : "#f9fafb",
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
        <span style={{ fontSize: "0.78rem", color: uploading ? "#A0622A" : "#6b7280" }}>
          {progress || (uploading ? "Uploading…" : "Drop .mp4 here or click to upload")}
        </span>
        <br />
        <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
          Any size · H.264 mp4 recommended
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
        <video
          src={value}
          style={{ marginTop: "0.5rem", width: "100%", maxWidth: "200px", height: "auto", borderRadius: "4px", border: "1px solid #e5e7eb" }}
          muted
          controls
        />
      )}
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
    variantImages: {},
    video: "",
    variantVideos: {},
    featured: false,
    variants: [],
    active: true,
  });

  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [allProducts, setAllProducts] = useState<Product[]>([]);

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
              variantImages: found.variantImages ?? {},
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
    const isVideo = file.type.startsWith("video/") || file.name.endsWith(".mp4") || file.name.endsWith(".mov");
    if (file.size > 4 * 1024 * 1024) {
      if (isVideo) {
        throw new Error(
          `Video too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max is 4 MB.\n\n` +
          "Compress it first:\navconvert -s input.mp4 -o output.mp4 -p PresetMediumQuality --replace"
        );
      }
      throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 4 MB.`);
    }
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/images", { method: "POST", body: fd });
    if (!res.ok) {
      const text = await res.text();
      let message = "Upload failed";
      try { message = (JSON.parse(text) as { error?: string }).error ?? message; } catch { message = text.slice(0, 120) || message; }
      throw new Error(message);
    }
    const data = await res.json() as { url: string };
    return data.url;
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
        fullDescription: form.fullDescription || undefined,
        video: form.video || undefined,
        variantImages: Object.keys(form.variantImages ?? {}).length > 0 ? form.variantImages : undefined,
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
    const label = prompt("Selector label (e.g. Size, Butterfly Color, Birthstone):");
    if (!label?.trim()) return;
    const raw = prompt(`Options for "${label.trim()}" — enter comma-separated (e.g. Small,Medium,Large):`);
    if (!raw?.trim()) return;
    const options = raw.split(",").map((o) => o.trim()).filter(Boolean);
    if (options.length === 0) return;
    setForm((f) => ({
      ...f,
      variantGroups: [...(f.variantGroups ?? []), { label: label.trim(), options }],
    }));
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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.5rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    fontSize: "0.85rem",
    color: "#111",
    background: "#fff",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "0.35rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const sectionStyle: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "1.5rem",
    marginBottom: "1.25rem",
  };

  if (loading) return (
    <div style={{ padding: "2rem", color: "#6b7280" }}>Loading...</div>
  );

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
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div>
          <button
            onClick={() => router.push("/admin/dashboard")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: "0.85rem", padding: 0 }}
          >
            ← Dashboard
          </button>
          <h1 style={{ margin: "0.25rem 0 0", fontSize: "1.1rem", fontWeight: 600, color: "#111" }}>
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
          <h2 style={{ margin: "0 0 1.25rem", fontSize: "0.9rem", fontWeight: 700, color: "#111", textTransform: "uppercase", letterSpacing: "0.08em" }}>
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
              {isNew && <p style={{ fontSize: "0.7rem", color: "#6b7280", margin: "0.25rem 0 0" }}>URL-safe, lowercase, hyphens only. Cannot be changed later.</p>}
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
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.82rem", color: "#374151" }}>
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                />
                Featured
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.82rem", color: "#374151" }}>
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
            <h2 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "#111", textTransform: "uppercase", letterSpacing: "0.08em" }}>
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
                color: "#374151",
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
                  color: "#9ca3af",
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
            <p style={{ fontSize: "0.78rem", color: "#9ca3af" }}>No specs yet.</p>
          )}
        </div>

        {/* Variant Groups (mandatory customer selectors) */}
        <div style={sectionStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <h2 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "#111", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Customer Selectors
            </h2>
            <button
              onClick={addVariantGroup}
              style={{ padding: "0.3rem 0.75rem", background: "transparent", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer", color: "#374151" }}
            >
              + Add Selector
            </button>
          </div>
          <p style={{ margin: "0 0 1rem", fontSize: "0.78rem", color: "#6b7280" }}>
            Mandatory options the buyer must choose before adding to cart (e.g. Size, Butterfly Color, Birthstone).
          </p>
          {(form.variantGroups ?? []).map((group, i) => (
            <div key={i} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "0.75rem 1rem", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#111" }}>{group.label}</span>
                <button onClick={() => removeVariantGroup(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "1.1rem", lineHeight: 1 }}>×</button>
              </div>
              <input
                style={{ ...inputStyle, fontSize: "0.78rem" }}
                value={group.options.join(", ")}
                onChange={(e) => updateVariantGroupOptions(i, e.target.value)}
                placeholder="Option 1, Option 2, Option 3"
              />
              <p style={{ margin: "0.3rem 0 0", fontSize: "0.72rem", color: "#9ca3af" }}>
                Edit options as comma-separated values
              </p>
            </div>
          ))}
          {(form.variantGroups ?? []).length === 0 && (
            <p style={{ fontSize: "0.78rem", color: "#9ca3af" }}>No customer selectors yet.</p>
          )}
        </div>

        {/* Card thumbnail images */}
        <div style={sectionStyle}>
          <h2 style={{ margin: "0 0 0.75rem", fontSize: "0.9rem", fontWeight: 700, color: "#111", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Card Thumbnail Images
          </h2>
          <p style={{ margin: "0 0 1rem", fontSize: "0.78rem", color: "#6b7280" }}>
            Used on the shop grid. First image is the main thumbnail.
          </p>
          <ImageSection
            title=""
            images={form.images}
            onChange={(imgs) => setForm((f) => ({ ...f, images: imgs }))}
            onUpload={uploadFile}
          />
        </div>

        {/* Variants & variant images */}
        <div style={sectionStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "#111", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Variants &amp; Gallery Images
              </h2>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.78rem", color: "#6b7280" }}>
                Per-variant image galleries. Drag to reorder. First image = sub-hero.
              </p>
            </div>
            <button
              onClick={addVariant}
              style={{
                padding: "0.3rem 0.75rem",
                background: "transparent",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "0.75rem",
                cursor: "pointer",
                color: "#374151",
              }}
            >
              + Add Variant
            </button>
          </div>

          {(form.variants ?? []).length === 0 && (
            <p style={{ fontSize: "0.78rem", color: "#9ca3af" }}>No variants. Click "Add Variant" to add one.</p>
          )}

          {(form.variants ?? []).map((variant) => (
            <div key={variant} style={{
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              padding: "1rem",
              marginBottom: "1rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>
                  {variant}
                </h3>
                <button
                  onClick={() => removeVariant(variant)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9ca3af",
                    fontSize: "0.75rem",
                  }}
                >
                  Remove variant
                </button>
              </div>

              <ImageSection
                title={`${variant} — Images (drag to reorder)`}
                images={(form.variantImages ?? {})[variant] ?? []}
                onChange={(imgs) => updateVariantImages(variant, imgs)}
                onUpload={uploadFile}
              />

              <div>
                <label style={labelStyle}>Video (optional)</label>
                <VideoDropZone
                  value={(form.variantVideos ?? {})[variant] ?? ""}
                  onChange={(v) => updateVariantVideo(variant, v)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* No-variant video */}
        {(form.variants ?? []).length === 0 && (
          <div style={sectionStyle}>
            <h2 style={{ margin: "0 0 0.75rem", fontSize: "0.9rem", fontWeight: 700, color: "#111", textTransform: "uppercase", letterSpacing: "0.08em" }}>
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
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "0.85rem",
              cursor: "pointer",
              color: "#374151",
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
