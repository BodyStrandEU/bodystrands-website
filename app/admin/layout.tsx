"use client";

import { useAdminTheme } from "./use-admin-theme";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isDark, toggle } = useAdminTheme();

  return (
    <>
      {children}
      <button
        onClick={toggle}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "1px solid var(--admin-border2)",
          background: "var(--admin-surface)",
          color: "var(--admin-text)",
          cursor: "pointer",
          fontSize: "1.1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          zIndex: 9999,
          transition: "background 0.2s, border-color 0.2s",
        }}
      >
        {isDark ? "☀️" : "🌙"}
      </button>
    </>
  );
}
