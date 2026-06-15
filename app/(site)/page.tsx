import fs from "fs";
import path from "path";
import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import ReviewsMarquee from "@/components/ReviewsMarquee";
import LifestyleSlider from "@/components/LifestyleSlider";

// All possible category tiles — filtered at render time to only show populated categories
const allTiles = [
  { label: "Back Chains",        href: "/shop?category=Back+Chains",         image: "/images/elvan-back-full.jpg"    },
  { label: "Body Chains",        href: "/shop?category=Body+Chains",         image: "/images/category-body.jpg"     },
  { label: "Belly Chains",       href: "/shop?category=Belly+Chains",        image: "/images/category-belly.png"    },
  { label: "Shoulder Chains",    href: "/shop?category=Shoulder+Chains",     image: "/images/category-shoulder.jpg" },
  { label: "Anklets",            href: "/shop?category=Anklets",             image: "/images/lifestyle-anklet.jpg"  },
  { label: "Necklaces",          href: "/shop?category=Necklaces",           image: "/images/category-necklace.jpg" },
  { label: "Bracelets",          href: "/shop?category=Bracelets",           image: "/images/category-bracelet.jpg" },
  { label: "Hand Chains",        href: "/shop?category=Hand+Chains",         image: "/images/category-hand.jpg"     },
  { label: "Head Chains",        href: "/shop?category=Head+Chains",         image: "/images/category-head.jpg"     },
  { label: "Eyeglasses Chains",  href: "/shop?category=Eyeglasses+Chains",  image: "/images/category-glasses.jpg"  },
  { label: "Bikini Clip Chains", href: "/shop?category=Bikini+Clip+Chains", image: "/images/category-bikini.jpg"   },
];

type Tile = typeof allTiles[number];

function CategoryTile({ tile }: { tile: Tile }) {
  return (
    <Link href={tile.href} className="group block">
      <div className="relative overflow-hidden aspect-[3/4]">
        <Image
          src={tile.image}
          alt={tile.label}
          fill
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C2220]/75 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-3 md:p-5">
          <h3 className="font-heading font-light text-white leading-tight text-lg md:text-xl">
            {tile.label}
          </h3>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  // Read lifestyle images dynamically — just drop images in the folder
  const lifestyleDir = path.join(process.cwd(), "public/images/lifestyle");
  const lifestyleImages: string[] = fs.existsSync(lifestyleDir)
    ? fs
        .readdirSync(lifestyleDir)
        .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f) && !f.startsWith("."))
        .sort()
        .map((f) => `/images/lifestyle/${f}`)
    : [];

  const heroTile  = allTiles.find((t) => t.label === "Back Chains");
  const gridTiles = allTiles.filter((t) => t.label !== "Back Chains");

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-back-chain.jpg"
            alt="Bodystrands back chain jewelry"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#2C2220]/50 via-transparent to-[#2C2220]/65" />
        </div>
        <div className="flex-1" />
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
            <Link href="/shop" className="btn-primary-filled text-center">Shop Now</Link>
            <Link href="/about" className="text-[0.65rem] tracking-[0.22em] uppercase border border-white/50 text-white hover:bg-white/10 transition-colors px-8 py-3 text-center">
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Brand bar */}
      <section className="bg-[#2C2220] py-5">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-wrap justify-center gap-6 md:gap-16">
          {["Handmade", "Tarnish-Resistant", "Water-Resistant", "Adjustable Fit", "Stainless Steel"].map((tag) => (
            <span key={tag} className="text-[0.55rem] tracking-[0.25em] uppercase text-[#E8B4A8]/60">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* Shop by Category */}
      <section className="max-w-7xl mx-auto px-4 md:px-10 py-20 md:py-28">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-8 md:mb-10 px-2 md:px-0">
            <div>
              <p className="text-[0.6rem] tracking-[0.3em] uppercase text-[#A0622A] mb-3">Explore</p>
              <h2 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220]">
                Shop by Category
              </h2>
            </div>
            <Link href="/shop" className="hidden md:block text-[0.6rem] tracking-[0.22em] uppercase text-[#A0622A] hover:underline underline-offset-4">
              View All →
            </Link>
          </div>
        </ScrollReveal>

        {/* Unified grid — Back Chains anchors top-left, spans 2 rows on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
          {/* Back Chains: full-width hero on mobile, 2×2 anchor on desktop */}
          {heroTile && (
            <div className="col-span-2 md:row-span-2">
              <Link href={heroTile.href} className="group block h-full">
                <div className="relative overflow-hidden aspect-[3/4] md:aspect-auto md:h-full">
                  <Image
                    src={heroTile.image}
                    alt={heroTile.label}
                    fill
                    priority
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2C2220]/75 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4 md:p-6">
                    <h3 className="font-heading font-light text-white leading-tight text-2xl md:text-3xl">
                      {heroTile.label}
                    </h3>
                  </div>
                </div>
              </Link>
            </div>
          )}
          {/* All 10 other categories — always visible, no animation delay */}
          {gridTiles.map((tile) => (
            <CategoryTile key={tile.label} tile={tile} />
          ))}
        </div>
      </section>

      {/* Lifestyle slider */}
      <LifestyleSlider images={lifestyleImages} />

      {/* Diamond divider */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-20 flex items-center gap-6">
        <div className="flex-1 h-px bg-[#E8B4A8]/30" />
        <span className="text-[#E8B4A8]/50 text-[0.6rem]">◆</span>
        <div className="flex-1 h-px bg-[#E8B4A8]/30" />
      </div>

      {/* Brand Story */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
        <ScrollReveal>
          <div className="relative aspect-square overflow-hidden">
            <Image
              src="/images/elvan-back-cross.jpg"
              alt="Bodystrands back chain"
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
            <Link href="/about" className="btn-primary self-start mt-2">Read Our Story</Link>
          </div>
        </ScrollReveal>
      </section>

      {/* Reviews marquee */}
      <div className="bg-[#FAF7F5]">
        <ReviewsMarquee />
      </div>

      {/* Diamond divider */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center gap-6">
        <div className="flex-1 h-px bg-[#E8B4A8]/30" />
        <span className="text-[#E8B4A8]/50 text-[0.6rem]">◆</span>
        <div className="flex-1 h-px bg-[#E8B4A8]/30" />
      </div>

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
