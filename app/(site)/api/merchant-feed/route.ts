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

// Google product categories (official taxonomy IDs). Until Oct 2, 2026 every item was
// sent as 201, which is "Jewelry > Watches" — so Google matched the whole catalog to
// watch searches.
const GOOGLE_CATEGORY: Record<string, number> = {
  Anklets: 189,
  "Foot Chains": 189, // Google has no separate taxonomy id for foot chains/barefoot sandals
  Bracelets: 191,
  Necklaces: 196,
  Rings: 200,
  "Eyeglasses Chains": 2521, // Health & Beauty > Vision Care > Eyewear Accessories
};
const BODY_JEWELRY = 190; // belly, back, body, shoulder/arm, leg, hand, head, bikini chains

// Variant names are usually finishes ("Gold Tone", "Silver Plated") but can be sizes.
function variantColor(variant: string): string | null {
  const v = variant.toLowerCase();
  if (v.includes("gold")) return "Gold";
  if (v.includes("silver") || v.includes("stainless")) return "Silver";
  if (/^(red|green|white|black|pink|blue|turquoise)$/.test(v)) return variant;
  return null;
}
const isSizeVariant = (variant: string) => /\d\s*(cm|mm|in|")|^(xs|s|m|l|xl|xxl)$/i.test(variant.trim());

// Single-option products: read the finish from the listing text; leave blank if unclear.
function textColor(text: string): string | null {
  const t = text.toLowerCase();
  const gold = t.includes("gold"), silver = t.includes("silver");
  return gold && silver ? "Gold/Silver" : gold ? "Gold" : silver ? "Silver" : null;
}

// Images hosted on bodystrands.com first — older listings point at Etsy's CDN, which
// the shop never links to; Etsy URLs are only kept when a product has no own photos.
const isOwn = (src: string) => !src.startsWith("http") || src.startsWith("https://www.bodystrands.com");

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

    const ownImages = [...new Set([...(product.images ?? []), ...allImages])].filter(isOwn);
    const mainImage = [product.images?.[0], ...allImages].find((src) => src && isOwn(src)) ?? product.images?.[0] ?? allImages[0];
    const additionalImages = (ownImages.length > 1 ? ownImages : allImages).filter((src) => src !== mainImage).slice(0, 9);

    const listingText = `${product.name} ${product.description ?? ""} ${JSON.stringify(product.specs ?? "")}`;
    const gender = /unisex/i.test(`${product.name} ${product.description ?? ""}`) ? "unisex" : "female";
    const category = GOOGLE_CATEGORY[product.category] ?? BODY_JEWELRY;

    const productUrl = `${BASE_URL}/shop/${product.id}`;
    const price = `${product.price.toFixed(2)} ${product.currency ?? "EUR"}`;

    // Build one feed item per variant (Google Shopping prefers separate items per variant)
    const variants = product.variants?.length ? product.variants : [null];

    return variants.map((variant) => {
      const variantId = variant ? `${product.id}-${variant.toLowerCase().replace(/\s+/g, "-")}` : product.id;
      const title = variant ? `${product.name} — ${variant}` : product.name;

      // Hero image for this variant
      const variantHero = variant ? product.variantHeroes?.[variant] ?? product.variantImages?.[variant]?.find(isOwn) : undefined;
      const heroSrc = variantHero && isOwn(variantHero) ? variantHero : mainImage;

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

      const color = (variant && variantColor(variant)) ?? textColor(listingText);
      const colorAttr = color ? `<g:color>${escapeXml(color)}</g:color>` : "";
      const sizeAttr = variant && isSizeVariant(variant) ? `<g:size>${escapeXml(variant)}</g:size>` : "";
      // Variants of one product must share an item group so Google treats them as one product.
      const groupAttr = variants.length > 1 ? `<g:item_group_id>${escapeXml(product.id)}</g:item_group_id>` : "";

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
      <g:google_product_category>${category}</g:google_product_category>
      <g:age_group>adult</g:age_group>
      <g:gender>${gender}</g:gender>
      ${colorAttr}
      ${sizeAttr}
      ${groupAttr}
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
      "Cache-Control": "no-store",
    },
  });
}
