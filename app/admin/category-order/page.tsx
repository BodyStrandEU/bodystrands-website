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
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Product } from "@/lib/products";

function SortableCategoryRow({ category, count }: { category: string; count: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: category });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.8rem 1rem",
    border: "1px solid var(--admin-border)",
    borderRadius: 6,
    background: "var(--admin-surface)",
    marginBottom: "0.5rem",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--admin-text)" }}>
        ⠿ {category}
      </span>
      <span style={{ fontSize: "0.7rem", color: "var(--admin-muted)" }}>
        {count} {count === 1 ? "piece" : "pieces"}
      </span>
    </div>
  );
}

export default function CategoryOrderPage() {
  const router = useRouter();
  const [order, setOrder] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/category-order").then((r) => {
        if (r.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return r.json() as Promise<string[]>;
      }),
      fetch("/api/admin/products").then((r) => (r.ok ? (r.json() as Promise<Product[]>) : [])),
    ])
      .then(([orderData, products]) => {
        if (!orderData) return;
        setOrder(orderData);
        const c: Record<string, number> = {};
        for (const p of products) {
          if (p.active === false) continue;
          c[p.category] = (c[p.category] ?? 0) + 1;
        }
        setCounts(c);
      })
      .catch(() => setError("Failed to load category order"))
      .finally(() => setLoading(false));
  }, [router]);

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setOrder((prev) => {
      const oldIndex = prev.indexOf(String(active.id));
      const newIndex = prev.indexOf(String(over.id));
      return arrayMove(prev, oldIndex, newIndex);
    });
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/category-order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      if (res.ok) {
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
            Category Order
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
            Drag to reorder, save — controls the shop page, nav, and footer
          </p>
        </div>
        <Link href="/admin/dashboard" style={{ fontSize: "0.75rem", color: "var(--admin-muted)", textDecoration: "none" }}>
          ← Back to Dashboard
        </Link>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "2rem" }}>
        {error && <p style={{ color: "#c0392b", fontSize: "0.8rem", marginBottom: "1rem" }}>{error}</p>}

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.25rem" }}>
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

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={order} strategy={verticalListSortingStrategy}>
            {order.map((category) => (
              <SortableCategoryRow key={category} category={category} count={counts[category] ?? 0} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
