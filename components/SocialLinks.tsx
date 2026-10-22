import { INSTAGRAM_HANDLE, INSTAGRAM_URL, FACEBOOK_URL } from "@/lib/social";

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

// Two outlined buttons — "light" for the cream mobile menu, "dark" for the footer.
export default function SocialLinks({ tone }: { tone: "light" | "dark" }) {
  const cls = tone === "light"
    ? "border-[#2C2220]/25 text-[#2C2220] hover:bg-[#2C2220] hover:text-[#FDF9F7]"
    : "border-[#E8B4A8]/40 text-[#E8B4A8] hover:bg-[#E8B4A8] hover:text-[#2C2220]";
  const links = [
    { href: INSTAGRAM_URL, label: "Instagram", sub: `@${INSTAGRAM_HANDLE}`, icon: <InstagramIcon /> },
    { href: FACEBOOK_URL,  label: "Facebook",  sub: "Bodystrands",        icon: <FacebookIcon /> },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Bodystrands on ${l.label}`}
          className={`min-h-[48px] px-3 py-2 border flex items-center justify-center gap-2 transition-colors ${cls}`}
        >
          {l.icon}
          <span className="text-[0.58rem] tracking-[0.18em] uppercase">{l.label}</span>
        </a>
      ))}
    </div>
  );
}
