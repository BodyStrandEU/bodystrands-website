import Image from "next/image";
import Link from "next/link";
import { CATEGORY_IMAGES } from "@/lib/categoryImages";
import positions from "@/data/category-hero-positions.json";

type Tile = { category: string; count: number; fallback?: string };

// Visual category picker for the top of /shop: 2 columns on phones so every category
// is visible by scrolling down (no hidden sideways swipe), worn-on-body photo per tile.
export default function CategoryTiles({ tiles }: { tiles: Tile[] }) {
  const pos = positions as Record<string, { x: number; y: number }>;
  return (
    <nav aria-label="Shop by category" className="mb-10 md:mb-14">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {tiles.map(({ category, count, fallback }, i) => {
          const src = CATEGORY_IMAGES[category] ?? fallback;
          const p = pos[category];
          return (
            <Link
              key={category}
              href={`/shop?category=${encodeURIComponent(category)}`}
              className="group relative block aspect-[4/5] overflow-hidden bg-[#F3E9E4]"
            >
              {src && (
                <Image
                  src={src}
                  alt={`${category} worn by a model`}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  priority={i < 4}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  style={p ? { objectPosition: `${p.x}% ${p.y}%` } : undefined}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C2220]/65 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 text-white">
                <p className="font-heading text-xl md:text-2xl font-light leading-tight">{category}</p>
                <p className="mt-1 text-[0.5rem] tracking-[0.2em] uppercase opacity-85">
                  {count} {count === 1 ? "piece" : "pieces"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
