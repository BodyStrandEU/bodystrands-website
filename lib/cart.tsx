"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type CartItem = {
  cartId:      string;   // productId + ":" + (variant ?? "")
  productId:   string;
  productName: string;
  variant?:    string;
  priceAdd:    number;
  unitPrice:   number;   // product.price + priceAdd
  image?:      string;
  currency:    string;
  quantity:    number;
};

type CartCtx = {
  items:             CartItem[];
  count:             number;
  subtotal:          number;
  shippingCountry:   string;
  setShippingCountry:(code: string) => void;
  add:               (item: Omit<CartItem, "cartId" | "quantity">) => void;
  remove:            (cartId: string) => void;
  updateQty:         (cartId: string, qty: number) => void;
  clear:             () => void;
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

  function clear() { setItems([]); }

  const count    = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, subtotal, shippingCountry, setShippingCountry, add, remove, updateQty, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
