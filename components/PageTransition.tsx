"use client";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // key change forces remount → CSS animation replays on every navigation
  return (
    <div key={pathname} className="animate-page-in">
      {children}
    </div>
  );
}
