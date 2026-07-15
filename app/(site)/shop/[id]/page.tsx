import Link from "next/link";
import { products, INFOGRAPHIC_IMAGES } from "@/lib/products";
import { getShippingRate, COUNTRY_GROUPS, ALL_COUNTRIES } from "@/lib/shipping";
import { notFound } from "next/navigation";
import ProductPageClient from "@/components/ProductPageClient";
import CompleteTheLook from "@/components/CompleteTheLook";
import YouMayAlsoLike from "@/components/YouMayAlsoLike";
import RecentlyViewed from "@/components/RecentlyViewed";

// Multiple long-tail, occasion/utility-driven suffixes per category — a stable hash of the
// product id picks one, so products in the same category don't all share an identical,
// repetitive suffix (and don't restate a noun the product name already contains).
const CATEGORY_SUFFIXES: Record<string, string[]> = {
  "Belly Chains":          ["Belly Chain for Beach Days", "Waist Chain for Festival Season", "Belly Chain for Bikini Season", "Waist Jewelry Gift for Her"],
  "Leg Chains":            ["Leg Chain for Beach Days", "Thigh Chain for Festival Season", "Leg Jewelry for Summer Outfits"],
  "Back Chains":           ["Back Chain for Backless Dresses", "Back Chain for Wedding Guest Looks", "Back Jewelry for Evening Occasions"],
  "Body Chains":           ["Body Chain for Festival Outfits", "Body Jewelry for Beach Vacations", "Body Chain for Going Out Looks"],
  "Shoulder & Arm Chains": ["Shoulder Chain for Summer Dresses", "Arm Chain for Festival Outfits", "Shoulder Jewelry for Prom Night"],
  "Anklets":               ["Anklet for Beach Vacations", "Ankle Bracelet for Summer Outfits", "Dainty Anklet for Everyday Wear"],
  "Bracelets":             ["Bracelet Gift for Her", "Stacking Bracelet for Everyday Wear", "Bracelet for Birthday Gifting"],
  "Necklaces":             ["Necklace for Prom Night", "Necklace for Dress Up Looks", "Choker for Everyday Wear", "Necklace for Wedding Guest Style", "Layered Necklace Gift for Her"],
  "Hand Chains":           ["Hand Chain for Festival Looks", "Hand Chain for Beach Days", "Hand Jewelry for Wedding Guest Style"],
  "Head Chains":           ["Head Chain for Bridal Hair Styling", "Hair Chain for Wedding Guest Looks", "Head Jewelry for Festival Season"],
  "Eyeglasses Chains":     ["Eyeglasses Chain for Everyday Wear", "Glasses Chain as a Stylish Accessory", "Sunglasses Chain for Summer Days"],
  "Bikini Clip Chains":    ["Bikini Belly Chain for Beach", "Bikini Body Chain for Pool Days", "Bikini Jewelry for Summer Vacation"],
};

function pickSuffix(productId: string, category: string): string {
  const pool = CATEGORY_SUFFIXES[category] ?? ["Handmade Body Jewelry"];
  let hash = 0;
  for (let i = 0; i < productId.length; i++) hash = (hash * 31 + productId.charCodeAt(i)) >>> 0;
  return pool[hash % pool.length];
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
  const suffix = pickSuffix(product.id, product.category);
  const metaDescription = product.altText
    ? `${product.altText}. Handmade in Portugal and Canada from waterproof stainless steel. ${priceLabel}.`
    : product.description;

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
    ...(product.variants?.length ? {
      color: product.variants.join(", "),
    } : {}),
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
