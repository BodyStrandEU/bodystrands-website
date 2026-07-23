import fs from "fs";
import path from "path";
import Image from "next/image";
import Link from "next/link";
import NewPiecesRow from "@/components/NewPiecesRow";
import StatCounter from "@/components/StatCounter";
import ScrollReveal from "@/components/ScrollReveal";
import HeroCarousel from "@/components/HeroCarousel";
import StatementReveal from "@/components/StatementReveal";
import RippleImage from "@/components/RippleImage";
import ReviewsMarquee from "@/components/ReviewsMarquee";
import LifestyleSlider from "@/components/LifestyleSlider";
import BrandVideo from "@/components/BrandVideo";
import UGCGallery from "@/components/UGCGallery";
import InstagramSection from "@/components/InstagramSection";
import { TrustBadgesStrip } from "@/components/TrustBadges";
import { products } from "@/lib/products";

const MARQUEE_TAGS = [
  "HANDMADE",
  "STAINLESS STEEL",
  "SHIPS IN 1–2 DAYS",
  "MADE IN PORTUGAL & CANADA",
  "TARNISH RESISTANT",
  "ADJUSTABLE FIT",
  "WATERPROOF",
  "DAINTY DESIGNS",
];

const STATS = [
  { number: "50+",    label: "Handmade styles"  },
  { number: "3,000+", label: "Happy customers"  },
  { number: "1–2",    label: "Days to dispatch" },
  { number: "100%",   label: "Waterproof"        },
];

const allTiles = [
  { label: "Back Chains",        href: "/shop?category=Back+Chains",         image: "/images/elvan-back-full.jpg"    },
  { label: "Body Chains",        href: "/shop?category=Body+Chains",         image: "/images/category-body.jpg"     },
  { label: "Belly Chains",       href: "/shop?category=Belly+Chains",        image: "/images/category-belly.png"    },
  { label: "Shoulder & Arm Chains",    href: "/shop?category=Shoulder+%26+Arm+Chains",     image: "/images/category-shoulder.jpg" },
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
        <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="absolute bottom-0 left-0 p-3 md:p-4">
          <h3 className="font-heading font-light text-white leading-tight text-base md:text-lg">
            {tile.label}
          </h3>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const lifestyleDir = path.join(process.cwd(), "public/images/lifestyle");
  const lifestyleImages: string[] = fs.existsSync(lifestyleDir)
    ? fs
        .readdirSync(lifestyleDir)
        .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f) && !f.startsWith("."))
        .sort()
        .map((f) => `/images/lifestyle/${f}`)
    : [];

  const instagramDir = path.join(process.cwd(), "public/images/instagram");
  const instagramImages: string[] = fs.existsSync(instagramDir)
    ? fs
        .readdirSync(instagramDir)
        .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f) && !f.startsWith("."))
        .sort()
        .map((f) => `/images/instagram/${f}`)
    : [];

  const heroTile     = allTiles.find((t) => t.label === "Back Chains");
  const gridTiles    = allTiles.filter((t) => t.label !== "Back Chains");
  const featured     = products
    .filter((p) => p.active !== false)
    .slice()
    .sort((a, b) => new Date(b.dateAdded ?? 0).getTime() - new Date(a.dateAdded ?? 0).getTime())
    .slice(0, 10);

  return (
    <>
      {/* ── HERO — image carousel ── */}
      <HeroCarousel />

      {/* ── MARQUEE BELT ── */}
      <div className="bg-[#2C2220] py-4 overflow-hidden select-none">
        <div className="marquee-track flex whitespace-nowrap">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center shrink-0">
              {MARQUEE_TAGS.map((tag) => (
                <span key={tag} className="flex items-center">
                  <span className="text-[0.5rem] tracking-[0.28em] uppercase text-[#E8B4A8]/50 px-6 md:px-8">
                    {tag}
                  </span>
                  <span className="text-[#A0622A]/45 text-[0.55rem]">◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── TRUST BADGES ── */}
      <TrustBadgesStrip />

      {/* ── SHOP BY CATEGORY ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-10 py-16 md:py-24">
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

        <ScrollReveal delay={100}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {heroTile && (
              <div className="col-span-2 md:row-span-2">
                <Link href={heroTile.href} className="group block h-full">
                  <div className="relative overflow-hidden aspect-[3/4] md:aspect-auto md:h-full">
                    <RippleImage src={heroTile.image} alt={heroTile.label} priority />
                    <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/55 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4 md:p-7">
                      <h3 className="font-heading font-light text-white leading-tight text-2xl md:text-3xl">
                        {heroTile.label}
                      </h3>
                    </div>
                  </div>
                </Link>
              </div>
            )}
            {gridTiles.map((tile) => (
              <CategoryTile key={tile.label} tile={tile} />
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ── FEATURED STRIP ── */}
      {featured.length > 0 && (
        <section className="py-16 md:py-24">
          <ScrollReveal>
            <div className="max-w-7xl mx-auto px-6 md:px-10 mb-8 md:mb-12">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[0.6rem] tracking-[0.3em] uppercase text-[#A0622A] mb-3">Just Arrived</p>
                  <h2 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220]">New Pieces</h2>
                </div>
                <Link href="/shop" className="hidden md:block text-[0.6rem] tracking-[0.22em] uppercase text-[#A0622A] hover:underline underline-offset-4">
                  View All →
                </Link>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <NewPiecesRow featured={featured} />
          </ScrollReveal>
        </section>
      )}

      {/* ── STATEMENT ── */}
      <StatementReveal />

      {/* ── STATS ── */}
      <section className="border-y border-[#E8B4A8]/20 py-14 md:py-20">
        <ScrollReveal>
          <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6">
            {STATS.map((stat) => (
              <div key={stat.number} className="flex flex-col items-center text-center gap-2">
                <span className="font-heading text-4xl md:text-5xl font-light text-[#A0622A]">
                  <StatCounter value={stat.number} />
                </span>
                <span className="text-[0.55rem] tracking-[0.22em] uppercase text-[#8C7B6E]">{stat.label}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ── LIFESTYLE SLIDER ── */}
      <ScrollReveal>
        <LifestyleSlider images={lifestyleImages} />
      </ScrollReveal>

      {/* ── BRAND STORY ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
        <ScrollReveal>
          <BrandVideo src="/videos/promo.mp4" />
        </ScrollReveal>
        <ScrollReveal delay={150}>
          <div className="flex flex-col gap-6">
            <p className="text-[0.6rem] tracking-[0.3em] uppercase text-[#A0622A]">Our Philosophy</p>
            <h2 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220] leading-snug">
              Jewelry that moves<br />
              <em className="not-italic text-[#A0622A]">with you</em>
            </h2>
            <p className="text-sm font-light leading-relaxed tracking-wide text-[#8C7B6E]">
              Every piece is handmade. Every chain is high-quality stainless steel. Built to last, built to move — waterproof, tarnish-resistant, and made to be forgotten about in the best way.
            </p>
            <p className="text-sm font-light leading-relaxed tracking-wide text-[#8C7B6E]">
              Put it on. Leave it on.
            </p>
            <Link href="/about" className="btn-primary self-start mt-2">Read Our Story</Link>
          </div>
        </ScrollReveal>
      </section>

      {/* ── REVIEWS ── */}
      <div className="bg-[#FAF7F5]">
        <ScrollReveal>
          <ReviewsMarquee />
        </ScrollReveal>
      </div>

      {/* ── CUSTOMER PHOTOS (UGC) ── */}
      <ScrollReveal>
        <UGCGallery />
      </ScrollReveal>

      {/* ── INSTAGRAM ── */}
      <ScrollReveal>
        <InstagramSection images={instagramImages} />
      </ScrollReveal>

      {/* Diamond divider */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center gap-6">
        <div className="flex-1 h-px bg-[#E8B4A8]/30" />
        <span className="text-[#E8B4A8]/50 text-[0.6rem]">◆</span>
        <div className="flex-1 h-px bg-[#E8B4A8]/30" />
      </div>
    </>
  );
}
