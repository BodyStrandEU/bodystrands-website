import Link from "next/link";
import { products, INFOGRAPHIC_IMAGES } from "@/lib/products";
import { notFound } from "next/navigation";
import ProductPageClient from "@/components/ProductPageClient";
import YouMayAlsoLike from "@/components/YouMayAlsoLike";

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

  return {
    title: `${product.name} — Bodystrands`,
    description: product.description,
    openGraph: {
      title: `${product.name} — ${priceLabel}`,
      description: product.description,
      url,
      type:     "website",
      siteName: "Bodystrands",
      images: [{ url: firstImage, width: 1200, height: 1200, alt: product.name }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       `${product.name} — ${priceLabel}`,
      description: product.description,
      images:      [firstImage],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) notFound();

  // JSON-LD structured data for Google Shopping rich results
  const firstImage =
    (product.variants?.[0] && product.variantImages?.[product.variants[0]]?.[0]) ||
    product.images?.[0] ||
    "/images/og-image.jpg";

  const allImages = (
    product.variants?.length && product.variantImages
      ? product.variants.flatMap((v) => product.variantImages![v] ?? [])
      : (product.images ?? [])
  ).filter((src) => !INFOGRAPHIC_IMAGES.has(src) && !(product.infographicImages ?? []).includes(src));

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
