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
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Category, GiftTag, Product } from "@/lib/products";

// Scopes a category order can be saved for — "global" is the main shop/nav/footer
// order (data/category-order.json); the rest are per-collection-page overrides
// (data/collection-category-order.json), keyed by the same string the pages pass
// to getPageCategoryOrder().
const ORDER_SCOPES: { key: string; label: string; giftTag?: GiftTag }[] = [
  { key: "global", label: "Global (Shop, Nav, Footer)" },
  { key: "bridal", label: "Bridal Page", giftTag: "bridal" },
  { key: "personalized", label: "Personalized Page", giftTag: "personalized" },
];

// ─── Category row (top section — reorders the categories themselves) ─────────

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
    padding: "0.6rem 0.9rem",
    border: "1px solid var(--admin-border)",
    borderRadius: 6,
    background: "var(--admin-surface)",
    marginBottom: "0.4rem",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--admin-text)" }}>
        ⠿ {category}
      </span>
      <span style={{ fontSize: "0.68rem", color: "var(--admin-muted)" }}>
        {count} {count === 1 ? "piece" : "pieces"}
      </span>
    </div>
  );
}

// ─── Product card (bottom section — reorders products within one category) ──

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

  // Category order (top section)
  const [scope, setScope] = useState(ORDER_SCOPES[0].key);
  const [globalOrder, setGlobalOrder] = useState<string[]>([]);
  const [collectionOverrides, setCollectionOverrides] = useState<Record<string, string[]>>({});
  const [workingCategoryOrder, setWorkingCategoryOrder] = useState<string[]>([]);
  const [categorySaving, setCategorySaving] = useState(false);
  const [categorySaved, setCategorySaved] = useState(true);

  // Product order within a category (bottom section) — always global, regardless of scope above
  const [category, setCategory] = useState<Category | "">("");
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [productSaving, setProductSaving] = useState(false);
  const [productSaved, setProductSaved] = useState(true);

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
      fetch("/api/admin/collection-category-order").then((r) => (r.ok ? (r.json() as Promise<Record<string, string[]>>) : {})),
      fetch("/api/admin/products").then((r) => (r.ok ? (r.json() as Promise<Product[]>) : [])),
    ])
      .then(([orderData, overridesData, products]) => {
        if (!orderData) return;
        setGlobalOrder(orderData);
        setCollectionOverrides(overridesData);
        setAllProducts(products);
        setCategory((orderData[0] as Category) ?? "");
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [router]);

  const activeScope = ORDER_SCOPES.find((s) => s.key === scope) ?? ORDER_SCOPES[0];

  // Categories actually present for this scope (all of them for "global"; only the
  // ones with at least one active product carrying the scope's gift tag otherwise),
  // ordered by the saved override (filtered to what's present) then anything left
  // over in global order.
  const scopeCounts: Record<string, number> = {};
  for (const p of allProducts) {
    if (p.active === false) continue;
    if (activeScope.giftTag && !p.giftTags?.includes(activeScope.giftTag)) continue;
    scopeCounts[p.category] = (scopeCounts[p.category] ?? 0) + 1;
  }
  const presentCategories = activeScope.giftTag
    ? globalOrder.filter((c) => (scopeCounts[c] ?? 0) > 0)
    : globalOrder;

  // Recompute the working category order whenever the scope (or underlying data) changes
  useEffect(() => {
    if (globalOrder.length === 0) return;
    if (!activeScope.giftTag) {
      setWorkingCategoryOrder(globalOrder);
    } else {
      const override = collectionOverrides[activeScope.key] ?? [];
      const present = new Set(presentCategories);
      const ordered = [
        ...override.filter((c) => present.has(c)),
        ...globalOrder.filter((c) => present.has(c) && !override.includes(c)),
      ];
      setWorkingCategoryOrder(ordered);
    }
    setCategorySaved(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, globalOrder, collectionOverrides, allProducts]);

  // Reset the working product order whenever the selected category (or fresh data) changes
  useEffect(() => {
    if (!category) return;
    const ids = allProducts
      .filter((p) => p.category === category && p.active !== false)
      .map((p) => p.id);
    setOrderedIds(ids);
    setProductSaved(true);
  }, [category, allProducts]);

  const byId = new Map(allProducts.map((p) => [p.id, p]));
  const globalCounts: Record<string, number> = {};
  for (const p of allProducts) {
    if (p.active === false) continue;
    globalCounts[p.category] = (globalCounts[p.category] ?? 0) + 1;
  }

  function handleCategoryDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setWorkingCategoryOrder((prev) => {
      const oldIndex = prev.indexOf(String(active.id));
      const newIndex = prev.indexOf(String(over.id));
      return arrayMove(prev, oldIndex, newIndex);
    });
    setCategorySaved(false);
  }

  async function saveCategoryOrder() {
    setCategorySaving(true);
    try {
      if (!activeScope.giftTag) {
        const res = await fetch("/api/admin/category-order", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(workingCategoryOrder),
        });
        if (res.ok) {
          setGlobalOrder(workingCategoryOrder);
          setCategorySaved(true);
        } else {
          setError("Category order save failed");
        }
      } else {
        const nextOverrides = { ...collectionOverrides, [activeScope.key]: workingCategoryOrder };
        const res = await fetch("/api/admin/collection-category-order", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nextOverrides),
        });
        if (res.ok) {
          setCollectionOverrides(nextOverrides);
          setCategorySaved(true);
        } else {
          setError("Category order save failed");
        }
      }
    } finally {
      setCategorySaving(false);
    }
  }

  function handleProductDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setOrderedIds((prev) => {
      const oldIndex = prev.indexOf(String(active.id));
      const newIndex = prev.indexOf(String(over.id));
      return arrayMove(prev, oldIndex, newIndex);
    });
    setProductSaved(false);
  }

  async function saveProductOrder() {
    setProductSaving(true);
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
        setProductSaved(true);
      } else {
        setError("Product order save failed");
      }
    } finally {
      setProductSaving(false);
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
            Category &amp; Product Order
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
            One place for all ordering — live in ~1 minute
          </p>
        </div>
        <Link href="/admin/dashboard" style={{ fontSize: "0.75rem", color: "var(--admin-muted)", textDecoration: "none" }}>
          ← Back to Dashboard
        </Link>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem" }}>
        {error && <p style={{ color: "#c0392b", fontSize: "0.8rem", marginBottom: "1.5rem" }}>{error}</p>}

        {/* Category order */}
        <section style={{ marginBottom: "3rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <h2 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--admin-text)", margin: 0 }}>
                Category Order
              </h2>
              <p style={{ fontSize: "0.72rem", color: "var(--admin-muted)", margin: "0.3rem 0 0", maxWidth: 460 }}>
                {activeScope.giftTag
                  ? `Drag to reorder just the category sections on the ${activeScope.label}. Falls back to the global order for any category not reordered here.`
                  : "Drag to reorder. Controls the shop page, nav and footer — and is the fallback order for every collection page below."}
              </p>
            </div>
            <button
              onClick={saveCategoryOrder}
              disabled={categorySaving || categorySaved}
              style={{
                flexShrink: 0,
                padding: "0.55rem 1.4rem",
                borderRadius: 4,
                border: "none",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
                cursor: categorySaving || categorySaved ? "default" : "pointer",
                background: categorySaved ? "var(--admin-surface2)" : "#A0622A",
                color: categorySaved ? "var(--admin-muted)" : "#fff",
              }}
            >
              {categorySaving ? "Saving…" : categorySaved ? "Saved ✓" : "Save Order"}
            </button>
          </div>

          {/* Scope tabs */}
          <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            {ORDER_SCOPES.map((s) => (
              <button
                key={s.key}
                onClick={() => setScope(s.key)}
                style={{
                  padding: "0.4rem 0.85rem",
                  borderRadius: 999,
                  border: `1px solid ${scope === s.key ? "#A0622A" : "var(--admin-border2)"}`,
                  background: scope === s.key ? "#A0622A" : "var(--admin-surface)",
                  color: scope === s.key ? "#fff" : "var(--admin-text2)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div style={{ maxWidth: 560 }}>
            {activeScope.giftTag && presentCategories.length === 0 ? (
              <p style={{ fontSize: "0.8rem", color: "var(--admin-muted)" }}>No active products tagged for this page yet.</p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
                <SortableContext items={workingCategoryOrder} strategy={verticalListSortingStrategy}>
                  {workingCategoryOrder.map((c) => (
                    <SortableCategoryRow key={c} category={c} count={activeScope.giftTag ? (scopeCounts[c] ?? 0) : (globalCounts[c] ?? 0)} />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </section>

        <div style={{ height: 1, background: "var(--admin-border)", marginBottom: "2.5rem" }} />

        {/* Product order within a category */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--admin-text)", margin: 0 }}>
              Product Order
            </h2>
            <button
              onClick={saveProductOrder}
              disabled={productSaving || productSaved}
              style={{
                padding: "0.55rem 1.4rem",
                borderRadius: 4,
                border: "none",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
                cursor: productSaving || productSaved ? "default" : "pointer",
                background: productSaved ? "var(--admin-surface2)" : "#A0622A",
                color: productSaved ? "var(--admin-muted)" : "#fff",
              }}
            >
              {productSaving ? "Saving…" : productSaved ? "Saved ✓" : "Save Order"}
            </button>
          </div>
          <p style={{ fontSize: "0.72rem", color: "var(--admin-muted)", margin: "0 0 1.25rem" }}>
            Drag to reorder within a category. This order is used everywhere that category's
            products are listed, including inside bridal, personalized and other collection pages —
            product order isn&apos;t scoped per page, only the category sections above are.
          </p>

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
              marginBottom: "1.5rem",
            }}
          >
            {globalOrder.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {orderedIds.length === 0 ? (
            <p style={{ fontSize: "0.8rem", color: "var(--admin-muted)" }}>No active products in this category.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleProductDragEnd}>
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
        </section>
      </div>
    </div>
  );
}
