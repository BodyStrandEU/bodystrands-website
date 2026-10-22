"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Product } from "@/lib/products";
import { setDiscountedUnits, setUnitPrice } from "@/lib/productSets";

export type CartItem = {
  cartId:      string;   // productId + ":" + (variant ?? "")
  productId:   string;
  productName: string;
  variant?:    string;
  priceAdd:    number;   // display only — real charge is always recomputed server-side from groupSelections
  groupSelections?: Record<string, string>; // raw selected options per variant group — the source of truth checkout uses to validate priceAdd server-side
  unitPrice:   number;   // product.price + priceAdd (display only, see above)
  image?:      string;
  currency:    string;
  quantity:    number;
  measurementNote?: string; // optional customer-entered measurements for a tailored fit (see Product.tailoredFitAvailable)
};

type CartCtx = {
  items:             CartItem[];
  count:             number;
  subtotal:          number;   // after set discounts — what checkout charges for the items
  itemsTotal:        number;   // before set discounts — the free-shipping threshold uses this, so a set discount never costs anyone free shipping
  setSavings:        number;
  lineSetSavings:    Record<string, number>; // cartId → amount saved on that line by the set discount
  shippingCountry:   string;
  setShippingCountry:(code: string) => void;
  add:               (item: Omit<CartItem, "cartId" | "quantity">) => void;
  remove:            (cartId: string) => void;
  updateQty:         (cartId: string, qty: number) => void;
  updateVariant:     (cartId: string, newVariant: string, newImage?: string) => void;
  clear:             () => void;
  // Global cart drawer (navbar cart icon + product card quick-add both control the
  // same drawer instance, rendered once in the site layout — see CartDrawer.tsx).
  drawerOpen:        boolean;
  openDrawer:        () => void;
  closeDrawer:       () => void;
  // When set, the drawer opens in "pick required options" mode for this product
  // instead of showing the cart list — used by ProductCard's quick-add button.
  quickAddProduct:   Product | null;
  openQuickAdd:      (product: Product) => void;
  closeQuickAdd:     () => void;
  // "Shop the Set": step the picker through several products, one after another.
  startSetPicker:    (products: Product[], tone?: "gold" | "silver") => void;
  nextQuickAdd:      () => void;
  pickerStep:        { step: number; total: number } | null;
  pickerTone:        "gold" | "silver" | null; // set picker pre-selects this colour so the set stays one colour
};

const CartContext = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems]                   = useState<CartItem[]>([]);
  const [shippingCountry, _setShippingCountry] = useState("");
  const [hydrated, setHydrated]             = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bs_cart");
      if (stored) setItems(JSON.parse(stored) as CartItem[]);
      const storedCountry = localStorage.getItem("bs_shipping_country");
      if (storedCountry) _setShippingCountry(storedCountry);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("bs_cart", JSON.stringify(items));
  }, [items, hydrated]);

  function setShippingCountry(code: string) {
    _setShippingCountry(code);
    try { localStorage.setItem("bs_shipping_country", code); } catch {}
  }

  function add(item: Omit<CartItem, "cartId" | "quantity">) {
    const cartId = `${item.productId}:${item.variant ?? ""}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.cartId === cartId);
      if (existing) return prev.map((i) => i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, cartId, quantity: 1 }];
    });
  }

  function remove(cartId: string) {
    setItems((prev) => prev.filter((i) => i.cartId !== cartId));
  }

  function updateQty(cartId: string, qty: number) {
    if (qty <= 0) { remove(cartId); return; }
    setItems((prev) => prev.map((i) => i.cartId === cartId ? { ...i, quantity: qty } : i));
  }

  // Switches an existing line's variant (e.g. Gold Tone → Silver Tone) in place —
  // merges into an existing line for that variant if one's already in the cart.
  function updateVariant(cartId: string, newVariant: string, newImage?: string) {
    setItems((prev) => {
      const item = prev.find((i) => i.cartId === cartId);
      if (!item) return prev;
      const newCartId = `${item.productId}:${newVariant}`;
      if (newCartId === cartId) return prev;
      const existing = prev.find((i) => i.cartId === newCartId);
      const without = prev.filter((i) => i.cartId !== cartId && i.cartId !== newCartId);
      const mergedQty = (existing?.quantity ?? 0) + item.quantity;
      return [...without, { ...item, variant: newVariant, image: newImage ?? item.image, cartId: newCartId, quantity: mergedQty }];
    });
  }

  function clear() { setItems([]); }

  const [drawerOpen, setDrawerOpen]           = useState(false);
  const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);

  const [pickerQueue, setPickerQueue]         = useState<Product[]>([]);
  const [pickerStep, setPickerStep]           = useState<{ step: number; total: number } | null>(null);
  const [pickerTone, setPickerTone]           = useState<"gold" | "silver" | null>(null);

  function openDrawer()  { setQuickAddProduct(null); setPickerQueue([]); setPickerStep(null); setPickerTone(null); setDrawerOpen(true); }
  function closeDrawer() { setDrawerOpen(false); setPickerQueue([]); setPickerStep(null); setPickerTone(null); }
  function openQuickAdd(product: Product) { setPickerQueue([]); setPickerStep(null); setPickerTone(null); setQuickAddProduct(product); setDrawerOpen(true); }
  function closeQuickAdd() { setQuickAddProduct(null); setPickerQueue([]); setPickerStep(null); setPickerTone(null); setDrawerOpen(false); }

  function startSetPicker(list: Product[], tone?: "gold" | "silver") {
    if (list.length === 0) { openDrawer(); return; }
    setQuickAddProduct(list[0]);
    setPickerQueue(list.slice(1));
    setPickerStep({ step: 1, total: list.length });
    setPickerTone(tone ?? null);
    setDrawerOpen(true);
  }

  function nextQuickAdd() {
    if (pickerQueue.length === 0) { openDrawer(); return; }
    setQuickAddProduct(pickerQueue[0]);
    setPickerQueue(pickerQueue.slice(1));
    setPickerStep((p) => (p ? { step: p.step + 1, total: p.total } : null));
  }

  const count      = items.reduce((s, i) => s + i.quantity, 0);
  const itemsTotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const setUnits   = setDiscountedUnits(items);
  const lineSetSavings: Record<string, number> = {};
  items.forEach((i, idx) => {
    if (setUnits[idx] > 0) lineSetSavings[i.cartId] = Math.round((i.unitPrice - setUnitPrice(i.unitPrice)) * setUnits[idx] * 100) / 100;
  });
  const setSavings = Object.values(lineSetSavings).reduce((a, b) => a + b, 0);
  const subtotal   = itemsTotal - setSavings;

  return (
    <CartContext.Provider value={{
      items, count, subtotal, itemsTotal, setSavings, lineSetSavings, shippingCountry, setShippingCountry,
      add, remove, updateQty, updateVariant, clear,
      drawerOpen, openDrawer, closeDrawer,
      quickAddProduct, openQuickAdd, closeQuickAdd,
      startSetPicker, nextQuickAdd, pickerStep, pickerTone,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
