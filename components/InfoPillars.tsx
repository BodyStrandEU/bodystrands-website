import Link from "next/link";

const PILLARS = [
  {
    title: "Gift Wrapping",
    description: "Add a beautifully wrapped presentation and a handwritten note for €4 at checkout — perfect for gifting.",
    href: "/gifts",
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="8" width="18" height="4" />
        <rect x="5" y="12" width="14" height="9" />
        <path d="M12 8v13" />
        <path d="M12 8c-1.5-3-4.5-3-5.5-1.5S7 8 8.5 8" />
        <path d="M12 8c1.5-3 4.5-3 5.5-1.5S17 8 15.5 8" />
      </svg>
    ),
  },
  {
    title: "Shipping & Returns",
    description: "14 days to return any item in its original condition. Arrived damaged? We'll make it right.",
    href: "/shipping",
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="6" width="14" height="11" />
        <path d="M15 10h4l3 3v4h-7z" />
        <circle cx="6" cy="19" r="2" />
        <circle cx="17.5" cy="19" r="2" />
      </svg>
    ),
  },
  {
    title: "Handmade Craftsmanship",
    description: "Every piece is handmade in Portugal from waterproof, tarnish-resistant stainless steel — built to last.",
    href: "/about",
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21c-4.5-3-8-6.5-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 3.5c0 4-3.5 7.5-8 10.5z" />
      </svg>
    ),
  },
];

export default function InfoPillars() {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {PILLARS.map((pillar) => (
          <div key={pillar.title} className="bg-[#F5EDE8]/60 px-6 py-10 md:py-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#FDF9F7] flex items-center justify-center text-[#2C2220] mb-6">
              {pillar.icon}
            </div>
            <h3 className="font-heading text-lg uppercase tracking-[0.08em] text-[#2C2220] mb-3">
              {pillar.title}
            </h3>
            <p className="text-[0.75rem] font-light leading-relaxed tracking-wide text-[#8C7B6E] mb-5 max-w-[220px]">
              {pillar.description}
            </p>
            <Link
              href={pillar.href}
              className="text-[0.62rem] tracking-[0.18em] uppercase text-[#2C2220] underline underline-offset-4 hover:text-[#A0622A] transition-colors"
            >
              Learn More
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
