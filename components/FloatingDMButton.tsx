"use client";

export default function FloatingDMButton() {
  return (
    <a
      href="https://ig.me/m/bodystrands"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Message us on Instagram"
      className="fixed bottom-6 right-5 z-40 flex items-center gap-2.5 bg-[#2C2220] text-[#FDF9F7] pl-3.5 pr-4 py-2.5 shadow-lg hover:bg-[#A0622A] transition-colors duration-300 group"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
      </svg>
      <span className="text-[0.55rem] tracking-[0.2em] uppercase font-light">Message Us</span>
    </a>
  );
}
