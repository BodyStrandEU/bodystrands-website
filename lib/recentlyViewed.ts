"use client";

const STORAGE_KEY = "bodystrands-recently-viewed";
const MAX_ITEMS = 10;

export function trackRecentlyViewed(id: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const current: string[] = raw ? JSON.parse(raw) : [];
    const next = [id, ...current.filter((x) => x !== id)].slice(0, MAX_ITEMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
}

export function getRecentlyViewed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}
