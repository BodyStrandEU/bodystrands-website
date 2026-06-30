"use client";
import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "bodystrands-wishlist";
const EVENT_NAME = "bodystrands-wishlist-change";

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function useWishlist() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(readIds());
    const onChange = () => setIds(readIds());
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const isSaved = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback((id: string) => {
    const current = readIds();
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    writeIds(next);
  }, []);

  return { ids, isSaved, toggle };
}
