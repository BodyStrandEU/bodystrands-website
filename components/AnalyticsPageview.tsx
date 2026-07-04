"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AnalyticsPageview() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    const gtag = (window as unknown as { gtag?: Function }).gtag;
    if (typeof gtag === "function") {
      gtag("event", "page_view", {
        page_path: pathname,
        page_title: document.title,
        page_location: window.location.href,
      });
    }
  }, [pathname]);

  return null;
}
