import Link from "next/link";
import SmartImage from "@/components/SmartImage";
import { ugcPhotos } from "@/lib/ugc";
import { products } from "@/lib/products";

export default function UGCGallery() {
  const items = ugcPhotos
    .map((photo) => ({ photo, product: products.find((p) => p.id === photo.productId) }))
    .filter((x): x is { photo: typeof x.photo; product: NonNullable<typeof x.product> } => !!x.product);

  if (items.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-[#FAF7F5]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 mb-8 md:mb-12">
        <p className="text-[0.6rem] tracking-[0.3em] uppercase text-[#A0622A] mb-3">Worn By You</p>
        <h2 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220]">
          Real Customers, Real Pieces
        </h2>
      </div>

      <div className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide px-6 md:px-10 pb-2 snap-x snap-mandatory">
        {items.map(({ photo, product }) => (
          <Link
            key={photo.id}
            href={`/shop/${product.id}`}
            className="group flex-shrink-0 w-[55vw] md:w-[22vw] snap-start"
          >
            <div className="relative overflow-hidden aspect-square bg-[#F5F1EF]">
              <SmartImage
                src={photo.image}
                alt={photo.caption || product.name}
                fill
                sizes="(max-width: 768px) 55vw, 22vw"
                className="object-cover object-center group-hover:scale-[1.04] transition-transform duration-700"
              />
              <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black/45 to-transparent" />
              <div className="absolute bottom-0 left-0 p-3">
                <p className="text-[0.5rem] tracking-[0.15em] uppercase text-white/90">
                  Shop this piece →
                </p>
              </div>
            </div>
            <div className="pt-3 px-0.5">
              <p className="text-[0.72rem] font-light text-[#2C2220] group-hover:text-[#A0622A] transition-colors duration-300 truncate">
                {product.name}
              </p>
            </div>
          </Link>
        ))}
        <div className="flex-shrink-0 w-4 md:hidden" aria-hidden />
      </div>
    </section>
  );
}
