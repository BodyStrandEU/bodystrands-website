"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Remember the last browsing page (not /saved itself) so the Saved Pieces page
  // can offer a "Back to Shopping" link straight to where the customer was.
  useEffect(() => {
    if (pathname === "/saved") return;
    try { sessionStorage.setItem("bs_last_browse_path", pathname); } catch {}
  }, [pathname]);

  // key change forces remount → CSS animation replays on every navigation
  return (
    <div key={pathname} className="animate-page-in">
      {children}
    </div>
  );
}
