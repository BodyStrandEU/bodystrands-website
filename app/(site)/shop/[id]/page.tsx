import Link from "next/link";
import { products, INFOGRAPHIC_IMAGES } from "@/lib/products";
import { getShippingRate, COUNTRY_GROUPS, ALL_COUNTRIES } from "@/lib/shipping";
import { notFound } from "next/navigation";
import ProductPageClient from "@/components/ProductPageClient";
import CompleteTheLook from "@/components/CompleteTheLook";
import YouMayAlsoLike from "@/components/YouMayAlsoLike";
import RecentlyViewed from "@/components/RecentlyViewed";
import { type Review } from "@/data/category-reviews";
import customerReviewsRaw from "@/data/customer-reviews.json";

const CUSTOMER_REVIEWS = customerReviewsRaw as Record<string, Review[]>;
const ALL_REAL_REVIEWS: Review[] = Object.values(CUSTOMER_REVIEWS).flat();

// Long-tail, occasion/utility-driven suffixes per category. Each pool has AT LEAST as many
// distinct phrases as that category has products — this is load-bearing, not decorative:
// with fewer phrases than products, any hash-based assignment mathematically guarantees
// repeats (pigeonhole principle), which is exactly what caused every category on the site
// to have multiple products sharing an identical SEO title suffix (found via audit, Sep 2026).
// Sharing a suffix means those product pages compete against each other for the same
// long-tail search phrase instead of each owning a distinct one — keyword cannibalization.
// See buildSuffixAssignments() below for the zero-collision assignment logic.
// Mix of two real search styles on purpose: product/occasion phrasing ("belly chain for
// beach vacations") for people searching the item itself, and plain colloquial gift
// phrasing ("gift for girlfriend", "christmas present idea") for people searching by
// recipient/occasion instead of product type — both are genuinely how people type these
// queries, not just one or the other.
const CATEGORY_SUFFIXES: Record<string, string[]> = {
  "Belly Chains": [
    "Belly Chain for Beach Vacations", "Waist Chain for Festival Season", "Belly Chain for Bikini Season",
    "Gift for Beach-Loving Girlfriend", "Belly Chain for Backless Outfits", "Waist Chain for Summer Dresses",
    "Belly Chain for Crop Top Styling", "Waist Chain for Pool Days", "Belly Chain for Beach Weddings",
    "Christmas Gift Idea for Her", "Belly Chain for Spring Break", "Waist Chain for Everyday Layering",
    "Belly Chain for Bachelorette Parties", "Gift for Girlfriend Who Loves the Beach", "Belly Chain for Honeymoon Packing",
    "Waist Chain for Boho Style", "Birthday Gift Idea for Her", "Waist Jewelry for Date Night",
    "Belly Chain for Plus Size Curves", "Waist Chain for Minimalist Style", "Belly Chain for Summer Vacation",
    "Gift for Wife Who Loves the Beach", "Belly Chain for Yoga and Beach Days", "Waist Chain for Layered Looks",
    "Belly Chain for Vacation Photos", "Vacation Gift Idea for Her",
  ],
  "Leg Chains": [
    "Leg Chain for Beach Days", "Thigh Chain for Festival Season",
    "Christmas Gift Idea for Her", "Thigh Chain for Beach Vacations",
  ],
  "Back Chains": [
    "Back Chain for Backless Dresses", "Back Chain for Wedding Guest Looks", "Gift for the Bride to Be",
    "Back Necklace for Bridal Styling", "Back Chain for Prom Night", "Backdrop Necklace for Formal Events",
    "Back Chain for Open-Back Gowns", "Gift for Bridesmaids", "Back Necklace for Date Night",
    "Back Chain for Summer Wedding Guests", "Christmas Gift Idea for Her", "Back Jewelry for Cocktail Parties",
    "Back Chain for Backless Jumpsuits", "Back Necklace for Elegant Evening Wear", "Wedding Guest Gift Idea",
    "Back Jewelry for Reversible Styling",
  ],
  "Body Chains": [
    "Body Chain for Festival Outfits", "Body Jewelry for Beach Vacations", "Body Chain for Going Out Looks",
    "Body Chain for Bikini Season", "Gift for Girlfriend Who Loves the Beach", "Body Chain for Summer Nights Out",
    "Body Jewelry for Plus Size Curves", "Body Chain for Layered Waist Styling", "Bachelorette Party Gift Idea",
    "Body Chain for Resort Wear", "Body Jewelry for Beach Photoshoots", "Body Chain for Date Night Outfits",
    "Christmas Gift Idea for Her", "Body Chain for Festival Season", "Body Jewelry for Y2K Style",
  ],
  "Shoulder & Arm Chains": [
    "Shoulder Chain for Summer Dresses", "Arm Chain for Festival Outfits", "Shoulder Jewelry for Prom Night",
    "Gift for Girlfriend Who Loves Jewelry", "Shoulder Chain for Bridal Styling", "Arm Chain for Beach Vacations",
    "Shoulder Jewelry for Evening Wear", "Christmas Gift Idea for Her", "Shoulder Chain for Wedding Guest Style",
    "Arm Jewelry for Statement Outfits", "Shoulder Harness for Festival Season", "Gift for Wife Who Loves Jewelry",
  ],
  "Anklets": [
    "Anklet for Beach Vacations", "Ankle Bracelet for Summer Outfits", "Dainty Anklet for Everyday Wear",
    "Gift for Beach-Loving Girlfriend", "Ankle Jewelry for Barefoot Sandals", "Anklet Gift for Beach Lovers",
    "Ankle Bracelet for Festival Season", "Anklet for Poolside Styling", "Christmas Gift Idea for Her",
    "Anklet for Boho Style", "Gift for Mom Who Loves the Beach", "Anklet for Layered Ankle Stacks",
    "Ankle Jewelry Gift for Her", "Anklet for Resort Wear", "Birthday Gift Idea for Her",
    "Anklet for Waterproof Beach Days", "Ankle Jewelry for Birthstone Gifting", "Anklet for Zodiac Lovers",
    "Gift for Sister Who Loves the Beach",
  ],
  "Bracelets": [
    "Gift for Mom", "Stacking Bracelet for Everyday Wear", "Christmas Present Idea for Her",
    "Bracelet for Layered Wrist Stacks", "Gift for Girlfriend", "Bracelet for Bridesmaid Gifting",
    "Chain Bracelet for Minimalist Style", "Gift for Wife", "Bracelet Gift for New Moms",
    "Charm Bracelet for Everyday Layering", "Gift for Best Friend", "Bracelet for Graduation Gifts",
    "Chain Bracelet for Festival Style", "Gift for Sister", "Charm Bracelet for Birthstone Gifting",
    "Mother's Day Gift Idea",
  ],
  "Necklaces": [
    "Necklace for Prom Night", "Gift for Girlfriend", "Choker for Everyday Wear",
    "Necklace for Wedding Guest Style", "Gift for Mom", "Choker for Festival Outfits",
    "Necklace for Bridesmaid Gifting", "Christmas Present Idea for Her", "Necklace for Personalized Gifting",
    "Choker for Boho Style", "Gift for Wife", "Choker for Layered Stacking",
    "Necklace for Faith-Based Gifting", "Choker for Minimalist Style", "Gift for Best Friend",
    "Choker for Summer Outfits", "Necklace for Holiday Gifting", "Choker for Statement Styling",
    "Necklace for Everyday Layering", "Choker for Beach Vacations", "Gift for Sister",
    "Choker for Backless Dress Pairing", "Necklace for Initial Gifting", "Choker for Pearl Lovers",
    "Valentine's Day Gift for Girlfriend",
  ],
  "Hand Chains": [
    "Hand Chain for Festival Looks", "Hand Chain for Beach Days", "Gift for Girlfriend",
    "Hand Chain for Boho Outfits", "Finger Bracelet for Festival Season", "Christmas Present Idea for Her",
  ],
  "Head Chains": [
    "Head Chain for Bridal Hair Styling", "Gift for the Bride to Be", "Head Jewelry for Festival Season",
    "Forehead Chain for Boho Style", "Hair Vine for Bridal Accessories",
  ],
  "Eyeglasses Chains": [
    "Eyeglasses Chain for Everyday Wear", "Gift for Mom", "Sunglasses Chain for Summer Days",
    "Eyeglasses Chain for Reading Glasses", "Christmas Present Idea for Mom", "Eyeglasses Chain for Minimalist Style",
  ],
  "Bikini Clip Chains": [
    "Bikini Clip Chain for Beach Days", "Gift for Beach-Loving Girlfriend",
  ],
  "Rings": [
    "Ring for Everyday Stacking", "Gift for Girlfriend", "Christmas Present Idea for Her",
  ],
};

// Deterministic, collision-free assignment: for every category, rank its products by a
// stable hash and assign the pool's phrases in that order — since each pool is sized to
// at least the category's product count, every product gets a distinct phrase (the `%`
// is only a safety net if a category ever outgrows its pool before this file is updated).
function stableHash(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return hash;
}

function buildSuffixAssignments(): Record<string, string> {
  const idsByCategory: Record<string, string[]> = {};
  for (const p of products) {
    (idsByCategory[p.category] ??= []).push(p.id);
  }
  const assignments: Record<string, string> = {};
  for (const [category, ids] of Object.entries(idsByCategory)) {
    const pool = CATEGORY_SUFFIXES[category] ?? ["Handmade Body Jewelry"];
    const ranked = [...ids].sort((a, b) => stableHash(a) - stableHash(b));
    ranked.forEach((id, i) => {
      assignments[id] = pool[i % pool.length];
    });
  }
  return assignments;
}

const SUFFIX_ASSIGNMENTS = buildSuffixAssignments();

function pickSuffix(productId: string): string {
  return SUFFIX_ASSIGNMENTS[productId] ?? "Handmade Body Jewelry";
}

// Google truncates SERP snippets around 155-160 chars. The old version appended a fixed
// 66-char boilerplate sentence to every product's altText, regularly pushing the total to
// 170-190 chars and reading as padding rather than a unique clickable snippet. This keeps
// the per-product altText as the dominant content and appends only a short price+trust tag,
// truncating on a word boundary if the altText alone is already near the limit.
function buildMetaDescription(altText: string | undefined, description: string, priceLabel: string): string {
  const base = (altText ?? description).trim();
  const suffix = ` ${priceLabel} · Waterproof, handmade.`;
  const maxLen = 155;
  const budget = maxLen - suffix.length;
  if (base.length <= budget) return `${base}${suffix}`;
  const cut = base.slice(0, budget);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed = (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trimEnd();
  return `${trimmed}…${suffix}`;
}

export async function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) return {};

  // Best image: first variant's first photo, or fallback to images[]
  const firstImage =
    (product.variants?.[0] && product.variantImages?.[product.variants[0]]?.[0]) ||
    product.images?.[0] ||
    "/images/og-image.jpg";

  const url = `https://www.bodystrands.com/shop/${product.id}`;
  const symbol = product.currency === "EUR" ? "€" : product.currency === "GBP" ? "£" : "$";
  const priceLabel = `${symbol}${product.price.toFixed(2)}`;
  const suffix = pickSuffix(product.id);
  const metaDescription = buildMetaDescription(product.altText, product.description, priceLabel);

  return {
    title: `${product.name} | ${suffix} | Bodystrands`,
    description: metaDescription,
    alternates: { canonical: `/shop/${product.id}` },
    openGraph: {
      title: `${product.name} | ${suffix} — ${priceLabel}`,
      description: metaDescription,
      url,
      type:     "website",
      siteName: "Bodystrands",
      images: [{ url: firstImage, width: 1200, height: 1200, alt: product.altText ?? product.name }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       `${product.name} | ${suffix} — ${priceLabel}`,
      description: metaDescription,
      images:      [firstImage],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) notFound();

  // JSON-LD structured data for Google Shopping rich results
  const perProductInfographics = new Set(product.infographicImages ?? []);
  const isInfographic = (src: string) => INFOGRAPHIC_IMAGES.has(src) || perProductInfographics.has(src);

  const allImages = (
    product.gallery
      ? product.gallery
      : product.variants?.length && product.variantImages
        ? product.variants.flatMap((v) => product.variantImages![v] ?? [])
        : (product.images ?? [])
  ).filter((src) => !isInfographic(src));

  const firstImage = product.images?.[0] || allImages[0] || "/images/og-image.jpg";

  // Merchant listing shipping details — one entry per shipping zone, using the same
  // rate table the checkout route uses (lib/shipping.ts) so this can't drift out of sync.
  const shippingDetails = COUNTRY_GROUPS.map((group) => {
    const rate = getShippingRate(group.countries[0].code, 0); // base (non-free) rate for the zone
    return {
      "@type": "OfferShippingDetails",
      shippingRate: {
        "@type":  "MonetaryAmount",
        value:    (rate.amount / 100).toFixed(2),
        currency: "EUR",
      },
      shippingDestination: {
        "@type":        "DefinedRegion",
        addressCountry: group.countries.map((c) => c.code),
      },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: {
          "@type":   "QuantitativeValue",
          minValue:  1,
          maxValue:  2,
          unitCode:  "DAY",
        },
        transitTime: {
          "@type":  "QuantitativeValue",
          minValue: rate.deliveryMin,
          maxValue: rate.deliveryMax,
          unitCode: "DAY",
        },
      },
    };
  });

  // Only this product's OWN reviews (exact productId match) ever feed rating/review
  // schema — never the "other X in this category" or shop-wide tiers shown on the page,
  // since those aren't genuinely about this product and Google's review-markup
  // guidelines require the review to be about the specific item being marked up.
  const ownReviews = ALL_REAL_REVIEWS.filter((r) => r.productId === product.id);
  const aggregateRating = ownReviews.length > 0 ? {
    "@type":     "AggregateRating",
    ratingValue: (ownReviews.reduce((s, r) => s + r.rating, 0) / ownReviews.length).toFixed(1),
    reviewCount: ownReviews.length,
  } : undefined;
  const reviewSchema = ownReviews.map((r) => ({
    "@type": "Review",
    author: { "@type": "Person", name: r.name },
    datePublished: new Date(r.date).toISOString().slice(0, 10),
    reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
    reviewBody: r.text,
  }));

  const hasMerchantReturnPolicy = {
    "@type":               "MerchantReturnPolicy",
    applicableCountry:     ALL_COUNTRIES,
    returnPolicyCategory:  "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays:    14,
    returnMethod:          "https://schema.org/ReturnByMail",
    returnFees:            "https://schema.org/ReturnShippingFees",
  };

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name:          product.name,
    description:   product.description,
    sku:           product.id,
    image:         allImages.length > 0 ? allImages : [firstImage],
    material:      "Stainless Steel",
    itemCondition: "https://schema.org/NewCondition",
    brand: {
      "@type": "Brand",
      name:    "Bodystrands",
    },
    category:      product.category,
    ...(product.variants?.length ? {
      color: product.variants.join(", "),
    } : {}),
    ...(aggregateRating ? { aggregateRating } : {}),
    ...(reviewSchema.length > 0 ? { review: reviewSchema } : {}),
    offers: {
      "@type":          "Offer",
      url:              `https://www.bodystrands.com/shop/${product.id}`,
      price:            product.price.toFixed(2),
      priceCurrency:    product.currency ?? "EUR",
      availability:     "https://schema.org/InStock",
      itemCondition:    "https://schema.org/NewCondition",
      validFrom:        new Date().toISOString().slice(0, 10),
      priceValidUntil:  new Date(Date.now() + 365 * 86400 * 1000).toISOString().slice(0, 10),
      shippingDetails,
      hasMerchantReturnPolicy,
      seller: {
        "@type": "Organization",
        name:    "Bodystrands",
      },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",  item: "https://www.bodystrands.com" },
      { "@type": "ListItem", position: 2, name: "Shop",  item: "https://www.bodystrands.com/shop" },
      { "@type": "ListItem", position: 3, name: product.name, item: `https://www.bodystrands.com/shop/${product.id}` },
    ],
  };

  return (
    <div className="pt-32 md:pt-36 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="max-w-7xl mx-auto px-6 md:px-10">

        {/* Breadcrumb */}
        <nav className="mb-6 md:mb-12 flex items-center gap-3 text-[0.55rem] tracking-[0.2em] uppercase text-[#8C7B6E]">
          <Link href="/" className="hover:text-[#A0622A] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#A0622A] transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-[#2C2220]">{product.name}</span>
        </nav>

        <ProductPageClient product={product} />
        <CompleteTheLook product={product} />
        <YouMayAlsoLike product={product} />
        <RecentlyViewed excludeId={product.id} />
      </div>
    </div>
  );
}
