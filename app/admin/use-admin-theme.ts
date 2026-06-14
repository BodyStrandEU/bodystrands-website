"use client";

import { useState, useEffect, useCallback } from "react";

const DARK: Record<string, string> = {
  "--admin-bg":      "#0f172a",
  "--admin-surface": "#1e293b",
  "--admin-surface2":"#111827",
  "--admin-border":  "#334155",
  "--admin-border2": "#475569",
  "--admin-text":    "#f1f5f9",
  "--admin-text2":   "#d1d5db",
  "--admin-muted":   "#94a3b8",
  "--admin-muted2":  "#64748b",
};

const LIGHT: Record<string, string> = {
  "--admin-bg":      "#f9fafb",
  "--admin-surface": "#ffffff",
  "--admin-surface2":"#f3f4f6",
  "--admin-border":  "#e5e7eb",
  "--admin-border2": "#d1d5db",
  "--admin-text":    "#111111",
  "--admin-text2":   "#374151",
  "--admin-muted":   "#6b7280",
  "--admin-muted2":  "#9ca3af",
};

function applyTheme(dark: boolean) {
  const vars = dark ? DARK : LIGHT;
  const root = document.documentElement;
  for (const [prop, val] of Object.entries(vars)) {
    root.style.setProperty(prop, val);
  }
}

export function useAdminTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("admin-dark-mode") === "true";
    setIsDark(stored);
    applyTheme(stored);
  }, []);

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem("admin-dark-mode", String(next));
      applyTheme(next);
      return next;
    });
  }, []);

  return { isDark, toggle };
}
