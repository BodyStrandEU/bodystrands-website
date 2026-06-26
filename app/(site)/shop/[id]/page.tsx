import Link from "next/link";
import { products, INFOGRAPHIC_IMAGES } from "@/lib/products";
import { notFound } from "next/navigation";
import ProductPageClient from "@/components/ProductPageClient";
import YouMayAlsoLike from "@/components/YouMayAlsoLike";

const CATEGORY_SUFFIX: Record<string, string> = {
  "Belly Chains":       "Handmade Belly Chain Waist Jewelry",
  "Back Chains":        "Back Chain for Backless Dresses",
  "Body Chains":        "Handmade Body Chain Jewelry",
  "Shoulder Chains":    "Bridal Shoulder Body Jewelry",
  "Anklets":            "Handmade Ankle Bracelet",
  "Bracelets":          "Handmade Stainless Steel Bracelet",
  "Necklaces":          "Handmade Chain Necklace",
  "Hand Chains":        "Boho Hand Chain Jewelry",
  "Head Chains":        "Bridal Hair Chain Headpiece",
  "Eyeglasses Chains":  "Stylish Eyeglasses Chain",
  "Bikini Clip Chains": "Beach Bikini Body Jewelry",
};

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
  const suffix = CATEGORY_SUFFIX[product.category] ?? "Handmade Body Jewelry";
  const metaDescription = product.altText
    ? `${product.altText}. Handmade in Portugal from waterproof stainless steel. ${priceLabel}.`
    : product.description;

  return {
    title: `${product.name} | ${suffix} | Bodystrands`,
    description: metaDescription,
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

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name:          product.name,
    description:   product.description,
    sku:           product.id,
    image:         allImages.length > 0 ? allImages : [firstImage],
    material:      "316L Stainless Steel",
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
        <YouMayAlsoLike product={product} />
      </div>
    </div>
  );
}
