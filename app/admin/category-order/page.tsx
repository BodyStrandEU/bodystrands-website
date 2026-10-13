"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Category ordering was merged into the single Category & Product Order page
// so there's one place for all ordering instead of two separate admin pages.
export default function CategoryOrderRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/product-order");
  }, [router]);
  return <div style={{ minHeight: "100vh", background: "var(--admin-bg)" }} />;
}
