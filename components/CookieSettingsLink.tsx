"use client";

// Lets anyone change their cookie choice later — withdrawing consent must be as easy as giving it
export default function CookieSettingsLink({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("bs:open-cookie-settings"))}
      className={className}
    >
      Cookie Settings
    </button>
  );
}
