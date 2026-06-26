import { NextResponse } from "next/server";
import { products, INFOGRAPHIC_IMAGES } from "@/lib/products";

const BASE_URL = "https://www.bodystrands.com";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const activeProducts = products.filter((p) => p.active !== false);

  const items = activeProducts.flatMap((product) => {
    const perProductInfographics = new Set(product.infographicImages ?? []);
    const isInfographic = (src: string) =>
      INFOGRAPHIC_IMAGES.has(src) || perProductInfographics.has(src);

    // Collect product images (gallery or variantImages), exclude infographics
    const allImages = (
      product.gallery
        ? product.gallery
        : product.variants?.length && product.variantImages
          ? product.variants.flatMap((v) => product.variantImages![v] ?? [])
          : product.images ?? []
    ).filter((src) => !isInfographic(src));

    const mainImage = product.images?.[0] ?? allImages[0];
    const additionalImages = allImages.filter((src) => src !== mainImage).slice(0, 9);

    const productUrl = `${BASE_URL}/shop/${product.id}`;
    const price = `${product.price.toFixed(2)} ${product.currency ?? "EUR"}`;

    // Build one feed item per variant (Google Shopping prefers separate items per variant)
    const variants = product.variants?.length ? product.variants : [null];

    return variants.map((variant) => {
      const variantId = variant ? `${product.id}-${variant.toLowerCase().replace(/\s+/g, "-")}` : product.id;
      const title = variant ? `${product.name} — ${variant}` : product.name;

      // Hero image for this variant
      const heroSrc = variant && product.variantHeroes?.[variant]
        ? product.variantHeroes[variant]
        : mainImage;

      const absoluteHero = heroSrc?.startsWith("http")
        ? heroSrc
        : heroSrc ? `${BASE_URL}${heroSrc}` : null;

      if (!absoluteHero) return null;

      const additionalImageTags = additionalImages
        .filter((src) => src !== heroSrc)
        .slice(0, 8)
        .map((src) => {
          const abs = src.startsWith("http") ? src : `${BASE_URL}${src}`;
          return `<g:additional_image_link>${escapeXml(abs)}</g:additional_image_link>`;
        })
        .join("\n        ");

      const colorAttr = variant ? `<g:color>${escapeXml(variant)}</g:color>` : "";

      return `    <item>
      <g:id>${escapeXml(variantId)}</g:id>
      <g:title>${escapeXml(title)}</g:title>
      <g:description>${escapeXml(product.description)}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(absoluteHero)}</g:image_link>
      ${additionalImageTags}
      <g:price>${escapeXml(price)}</g:price>
      <g:availability>in_stock</g:availability>
      <g:condition>new</g:condition>
      <g:brand>Bodystrands</g:brand>
      <g:mpn>${escapeXml(variantId)}</g:mpn>
      <g:material>Stainless Steel</g:material>
      <g:google_product_category>201</g:google_product_category>
      ${colorAttr}
      <g:identifier_exists>false</g:identifier_exists>
    </item>`;
    }).filter(Boolean);
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Bodystrands</title>
    <link>${BASE_URL}</link>
    <description>Handmade stainless steel body jewelry from Portugal</description>
${items.join("\n")}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
