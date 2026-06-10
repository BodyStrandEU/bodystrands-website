import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";
import ScrollReveal from "@/components/ScrollReveal";

export default function HomePage() {
  const featured = products.filter((p) => p.featured).slice(0, 3);

  return (
    <>
      {/* Hero — full screen back chain lifestyle */}
      <section className="relative min-h-screen flex flex-col">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-back-chain.jpg"
            alt="Body Strands back chain jewelry"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Gradient overlay — lighter at top (for logo), darker at bottom (for text) */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#2C2220]/50 via-transparent to-[#2C2220]/60" />
        </div>

        {/* Spacer to push text to bottom */}
        <div className="flex-1" />

        {/* Hero text — bottom center */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 pb-20 md:pb-28">
          <p className="text-[0.6rem] tracking-[0.4em] uppercase text-[#E8B4A8] mb-5">
            Handmade Body Jewelry
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-white leading-[1.05] mb-8 drop-shadow-md">
            Wear it.<br />
            <em className="not-italic text-[#E8B4A8]">Feel it.</em>
          </h1>
          <p className="text-sm font-light leading-relaxed tracking-wide text-white/80 mb-10 max-w-sm">
            Dainty, minimal body chains crafted by hand. Made to move with you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/shop" className="btn-primary-filled text-center">
              Shop Now
            </Link>
            <Link
              href="/about"
              className="text-[0.65rem] tracking-[0.22em] uppercase border border-white/50 text-white hover:bg-white/10 transition-colors px-8 py-3 text-center"
            >
              Our Story
            </Link>
          </div>
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
        <ScrollReveal>
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
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
          {featured.map((product, i) => (
            <ScrollReveal key={product.id} delay={i * 100}>
              <ProductCard product={product} />
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
          <Link href="/shop" className="btn-primary">View All Pieces</Link>
        </div>
      </section>

      {/* Lifestyle photo strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-1 px-1">
        {[
          { src: "/images/elvan-back-full.jpg", alt: "Back body chain silver dress" },
          { src: "/images/elvan-back-medium.jpg", alt: "Back body chain elegant view" },
          { src: "/images/elvan-choker-front.jpg", alt: "Delicate choker chain" },
          { src: "/images/elvan-choker-side.jpg", alt: "Choker chain side view" },
        ].map((img) => (
          <div key={img.src} className="relative aspect-square overflow-hidden">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover object-center hover:scale-105 transition-transform duration-700"
            />
          </div>
        ))}
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-24">
        <div className="h-px bg-[#E8B4A8]/30" />
      </div>

      {/* Brand Story Snippet */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <ScrollReveal>
          <div className="relative aspect-square overflow-hidden">
            <Image
              src="/images/elvan-back-cross.jpg"
              alt="Body Strands back chain"
              fill
              className="object-cover object-center"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="flex flex-col gap-6">
            <p className="text-[0.6rem] tracking-[0.3em] uppercase text-[#A0622A]">Our Philosophy</p>
            <h2 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220] leading-snug">
              Jewelry that moves<br />
              <em className="not-italic text-[#A0622A]">with you</em>
            </h2>
            <p className="text-sm font-light leading-relaxed tracking-wide text-[#8C7B6E]">
              Every piece is handmade. Every chain is 316L surgical-grade stainless steel. Built to last, built to move — waterproof, tarnish-resistant, and made to be forgotten about in the best way.
            </p>
            <p className="text-sm font-light leading-relaxed tracking-wide text-[#8C7B6E]">
              Put it on. Leave it on.
            </p>
            <Link href="/about" className="btn-primary self-start mt-2">
              Read Our Story
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* Newsletter */}
      <section className="bg-[#E8B4A8]/20 py-20">
        <ScrollReveal>
        <div className="max-w-xl mx-auto px-6 text-center">
          <p className="text-[0.6rem] tracking-[0.3em] uppercase text-[#A0622A] mb-4">Stay Connected</p>
          <h2 className="font-heading text-3xl md:text-4xl font-light text-[#2C2220] mb-4">
            New pieces. First.
          </h2>
          <p className="text-sm font-light text-[#8C7B6E] tracking-wide mb-8">
            Drop your email. We&apos;ll do the rest.
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
        </ScrollReveal>
      </section>
    </>
  );
}
