import Image from "next/image";

const HANDLE = "bodystrands";

function InstagramGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function InstagramSection({ images }: { images: string[] }) {
  if (images.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10 mb-8 md:mb-12 flex items-end justify-between">
        <div>
          <p className="text-[0.6rem] tracking-[0.3em] uppercase text-[#A0622A] mb-3">Follow Along</p>
          <h2 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220]">
            @{HANDLE}
          </h2>
        </div>
        <a
          href={`https://www.instagram.com/${HANDLE}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-2 text-[0.6rem] tracking-[0.22em] uppercase text-[#A0622A] hover:underline underline-offset-4"
        >
          <InstagramGlyph />
          View on Instagram
        </a>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-1 md:gap-2 px-1 md:px-0 max-w-7xl mx-auto md:px-10">
        {images.map((src, i) => (
          <a
            key={src}
            href={`https://www.instagram.com/${HANDLE}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square overflow-hidden block"
          >
            <Image
              src={src}
              alt={`Bodystrands on Instagram ${i + 1}`}
              fill
              sizes="(max-width: 768px) 33vw, 16vw"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.06]"
            />
            <div className="absolute inset-0 bg-[#2C2220]/0 group-hover:bg-[#2C2220]/25 transition-colors duration-300 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
                <InstagramGlyph />
              </span>
            </div>
          </a>
        ))}
      </div>

      <div className="md:hidden flex justify-center mt-6">
        <a
          href={`https://www.instagram.com/${HANDLE}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[0.6rem] tracking-[0.22em] uppercase text-[#A0622A]"
        >
          <InstagramGlyph />
          View on Instagram
        </a>
      </div>
    </section>
  );
}
