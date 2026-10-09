"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CATEGORIES, type Category, type Product } from "@/lib/products";

function SortableProductCard({ product }: { product: Product }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: product.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };

  const thumb = product.images?.[0] ?? product.gallery?.[0] ?? "";
  const displaySrc = thumb.startsWith("http") ? `/_next/image?url=${encodeURIComponent(thumb)}&w=256&q=75` : thumb;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        border: "1px solid var(--admin-border)",
        borderRadius: 6,
        overflow: "hidden",
        background: "var(--admin-surface)",
      }}
      {...attributes}
      {...listeners}
    >
      <div style={{ aspectRatio: "4/5", background: "var(--admin-surface2)", position: "relative" }}>
        {displaySrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displaySrc}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            draggable={false}
          />
        )}
      </div>
      <div style={{ padding: "0.5rem 0.65rem" }}>
        <p
          style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            color: "var(--admin-text)",
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {product.name}
        </p>
        <p style={{ fontSize: "0.65rem", color: "var(--admin-muted)", margin: "0.15rem 0 0" }}>
          €{product.price.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

export default function ProductOrderPage() {
  const router = useRouter();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
        if (data) setAllProducts(data);
      })
      .catch(() => setError("Failed to load products"))
      .finally(() => setLoading(false));
  }, [router]);

  // Reset the working order whenever the selected category (or fresh data) changes
  useEffect(() => {
    const ids = allProducts
      .filter((p) => p.category === category && p.active !== false)
      .map((p) => p.id);
    setOrderedIds(ids);
    setSaved(true);
  }, [category, allProducts]);

  const byId = new Map(allProducts.map((p) => [p.id, p]));

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setOrderedIds((prev) => {
      const oldIndex = prev.indexOf(String(active.id));
      const newIndex = prev.indexOf(String(over.id));
      return arrayMove(prev, oldIndex, newIndex);
    });
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    try {
      // Splice the reordered items back into their original array slots so every
      // other category's relative order is left completely untouched.
      const slots = allProducts
        .map((p, i) => (p.category === category && p.active !== false ? i : -1))
        .filter((i) => i !== -1);
      const next = [...allProducts];
      orderedIds.forEach((id, i) => {
        const product = byId.get(id);
        if (product) next[slots[i]] = product;
      });

      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (res.ok) {
        setAllProducts(next);
        setSaved(true);
      } else {
        setError("Save failed");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div style={{ minHeight: "100vh", background: "var(--admin-bg)" }} />;
  }

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
            Product Order
          </h1>
          <p
            style={{
              fontSize: "0.65rem",
              color: "var(--admin-muted)",
              margin: "0.25rem 0 0",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Drag to reorder within a category, save — live in ~1 minute
          </p>
        </div>
        <Link href="/admin/dashboard" style={{ fontSize: "0.75rem", color: "var(--admin-muted)", textDecoration: "none" }}>
          ← Back to Dashboard
        </Link>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem" }}>
        {error && <p style={{ color: "#c0392b", fontSize: "0.8rem", marginBottom: "1rem" }}>{error}</p>}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            style={{
              padding: "0.55rem 0.9rem",
              borderRadius: 4,
              border: "1px solid var(--admin-border2)",
              background: "var(--admin-surface)",
              color: "var(--admin-text)",
              fontSize: "0.8rem",
            }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            onClick={save}
            disabled={saving || saved}
            style={{
              padding: "0.55rem 1.4rem",
              borderRadius: 4,
              border: "none",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.05em",
              cursor: saving || saved ? "default" : "pointer",
              background: saved ? "var(--admin-surface2)" : "#A0622A",
              color: saved ? "var(--admin-muted)" : "#fff",
            }}
          >
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save Order"}
          </button>
        </div>

        {orderedIds.length === 0 ? (
          <p style={{ fontSize: "0.8rem", color: "var(--admin-muted)" }}>No active products in this category.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderedIds} strategy={rectSortingStrategy}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.9rem" }}>
                {orderedIds.map((id) => {
                  const product = byId.get(id);
                  if (!product) return null;
                  return <SortableProductCard key={id} product={product} />;
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
