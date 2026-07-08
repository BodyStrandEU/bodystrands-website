"use client";

const WHATSAPP_NUMBER = "351935483918"; // +351 935 483 918 — Bodystrands Business
const WHATSAPP_MESSAGE = "Hi! I have a question about a Bodystrands piece.";

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.5 11.5a8.5 8.5 0 1 1-3.8-7.1" />
      <path d="M20.5 11.5c0 4.7-3.8 8.5-8.5 8.5a8.44 8.44 0 0 1-4.3-1.17L3 20l1.2-4.5A8.44 8.44 0 0 1 3.5 11.5 8.5 8.5 0 0 1 12 3" />
      <path d="M8.5 9.3c0-.4.4-.8.9-.8h.7c.3 0 .6.2.7.5l.5 1.3c.1.3 0 .6-.2.8l-.5.5c.4.9 1.1 1.6 2 2l.5-.5c.2-.2.5-.3.8-.2l1.3.5c.3.1.5.4.5.7v.7c0 .5-.4.9-.8.9-3 0-6-3-6-6z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function FloatingDMButton() {
  return (
    <div className="fixed bottom-6 right-5 z-40 flex flex-col items-end gap-2">
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Message us on WhatsApp"
        className="flex items-center gap-2.5 bg-[#2C2220] text-[#FDF9F7] pl-3.5 pr-4 py-2.5 shadow-lg hover:bg-[#A0622A] transition-colors duration-300"
      >
        <WhatsAppIcon />
        <span className="text-[0.55rem] tracking-[0.2em] uppercase font-light">Message Us</span>
      </a>
      <a
        href="https://ig.me/m/bodystrands"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Message us on Instagram"
        className="flex items-center gap-2 bg-[#FDF9F7] text-[#2C2220] border border-[#E8B4A8]/50 pl-3 pr-3.5 py-2 shadow-md hover:border-[#2C2220] transition-colors duration-300"
      >
        <InstagramIcon />
        <span className="text-[0.5rem] tracking-[0.18em] uppercase font-light">DM</span>
      </a>
    </div>
  );
}
