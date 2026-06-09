import Link from "next/link";
import { products } from "@/lib/products";
import { notFound } from "next/navigation";
import BuyButton from "@/components/BuyButton";

export async function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) return {};
  return {
    title: `${product.name} — Body Strands`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) notFound();

  const symbol = product.currency === "EUR" ? "€" : product.currency === "GBP" ? "£" : "$";

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">

        {/* Breadcrumb */}
        <nav className="mb-12 flex items-center gap-3 text-[0.55rem] tracking-[0.2em] uppercase text-[#8C7B6E]">
          <Link href="/" className="hover:text-[#A0622A] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#A0622A] transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-[#2C2220]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          {/* Image */}
          <div className="bg-[#F2DDD7] aspect-square flex items-center justify-center">
            <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[#A0622A]/50">Image coming soon</p>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6 md:sticky md:top-32">
            <p className="text-[0.55rem] tracking-[0.25em] uppercase text-[#A0622A]">{product.category}</p>
            <h1 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220]">{product.name}</h1>
            <p className="text-2xl font-light text-[#A0622A] tracking-wide">
              {symbol}{product.price.toFixed(2)}
            </p>

            <div className="h-px bg-[#E8B4A8]/40" />

            <p className="text-sm font-light leading-relaxed tracking-wide text-[#8C7B6E]">
              {product.description}
            </p>

            {product.variants && (
              <div>
                <p className="text-[0.55rem] tracking-[0.25em] uppercase text-[#8C7B6E] mb-3">Finish</p>
                <div className="flex gap-3 flex-wrap">
                  {product.variants.map((v) => (
                    <button
                      key={v}
                      className="text-[0.6rem] tracking-[0.18em] uppercase px-4 py-2 border border-[#A0622A]/30 text-[#8C7B6E] hover:border-[#A0622A] hover:text-[#A0622A] transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="h-px bg-[#E8B4A8]/40" />

            <div className="flex flex-col gap-3">
              <BuyButton productId={product.id} />
              <div className="flex gap-3">
                {product.etsy_url && (
                  <a href={product.etsy_url} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1 text-center py-3 text-[0.6rem]">
                    Buy on Etsy
                  </a>
                )}
                {product.amazon_url && (
                  <a href={product.amazon_url} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1 text-center py-3 text-[0.6rem]">
                    Buy on Amazon
                  </a>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              {["Handmade", "Tarnish-resistant stainless steel", "Water-resistant", "Adjustable fit"].map((feat) => (
                <p key={feat} className="text-[0.6rem] tracking-[0.15em] uppercase text-[#8C7B6E] flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#A0622A] inline-block rounded-full" />
                  {feat}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
