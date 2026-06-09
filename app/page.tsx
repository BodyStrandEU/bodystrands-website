import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";

export default function HomePage() {
  const featured = products.filter((p) => p.featured).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center bg-[#E8B4A8]/30">
        <div className="absolute inset-0 bg-gradient-to-b from-[#E8B4A8]/20 to-[#FDF9F7]" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 w-full pt-32 pb-20">
          <div className="max-w-2xl">
            <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-6">
              Handmade Body Jewellery
            </p>
            <h1 className="font-heading text-6xl md:text-8xl font-light text-[#2C2220] leading-[1.05] mb-8">
              Wear it.<br />
              <em className="not-italic text-[#A0622A]">Feel it.</em>
            </h1>
            <p className="text-sm font-light leading-relaxed tracking-wide text-[#8C7B6E] mb-10 max-w-md">
              Dainty, minimal body chains crafted by hand. Tarnish-resistant, water-resistant, and made to move with you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/shop" className="btn-primary-filled text-center">
                Shop Now
              </Link>
              <Link href="/about" className="btn-primary text-center">
                Our Story
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[0.55rem] tracking-[0.25em] uppercase text-[#A0622A]/60">Scroll</span>
          <div className="w-px h-8 bg-[#A0622A]/30" />
        </div>
      </section>

      {/* Brand bar */}
      <section className="bg-[#2C2220] py-5">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-wrap justify-center gap-8 md:gap-16">
          {["Handmade", "Tarnish-Resistant", "Water-Resistant", "Adjustable Fit", "Stainless Steel"].map((tag) => (
            <span key={tag} className="text-[0.55rem] tracking-[0.25em] uppercase text-[#E8B4A8]/60">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[0.6rem] tracking-[0.3em] uppercase text-[#A0622A] mb-3">Collection</p>
            <h2 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220]">
              Featured Pieces
            </h2>
          </div>
          <Link href="/shop" className="hidden md:block text-[0.6rem] tracking-[0.22em] uppercase text-[#A0622A] hover:underline underline-offset-4">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
          <Link href="/shop" className="btn-primary">View All Pieces</Link>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="h-px bg-[#E8B4A8]/30" />
      </div>

      {/* Brand Story Snippet */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="bg-[#F2DDD7] aspect-square flex items-center justify-center">
          <Image
            src="/images/logo-pink.png"
            alt="Body Strands"
            width={400}
            height={400}
            className="w-3/4 h-auto object-contain"
          />
        </div>

        <div className="flex flex-col gap-6">
          <p className="text-[0.6rem] tracking-[0.3em] uppercase text-[#A0622A]">Our Philosophy</p>
          <h2 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220] leading-snug">
            Jewellery that moves<br />
            <em className="not-italic text-[#A0622A]">with you</em>
          </h2>
          <p className="text-sm font-light leading-relaxed tracking-wide text-[#8C7B6E]">
            Every piece in our collection is crafted by hand using premium stainless steel. We believe jewellery should be effortless — something you put on and forget about, because it works with your life, not against it.
          </p>
          <p className="text-sm font-light leading-relaxed tracking-wide text-[#8C7B6E]">
            Water-resistant. Tarnish-resistant. Made for real moments.
          </p>
          <Link href="/about" className="btn-primary self-start mt-2">
            Read Our Story
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-[#E8B4A8]/20 py-20">
        <div className="max-w-xl mx-auto px-6 text-center">
          <p className="text-[0.6rem] tracking-[0.3em] uppercase text-[#A0622A] mb-4">Stay Connected</p>
          <h2 className="font-heading text-3xl md:text-4xl font-light text-[#2C2220] mb-4">
            New drops & exclusive offers
          </h2>
          <p className="text-sm font-light text-[#8C7B6E] tracking-wide mb-8">
            Be the first to know when new pieces arrive.
          </p>
          <form className="flex flex-col sm:flex-row gap-0 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 text-xs tracking-wide font-light border border-[#A0622A]/30 bg-[#FDF9F7] text-[#2C2220] placeholder-[#8C7B6E]/60 outline-none focus:border-[#A0622A] transition-colors"
            />
            <button type="submit" className="btn-primary-filled whitespace-nowrap px-6 py-3 text-[0.65rem]">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
