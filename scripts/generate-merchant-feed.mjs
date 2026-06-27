// Generates public/merchant-feed.xml as a static file at build time.
// Run via: node scripts/generate-merchant-feed.mjs
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BASE_URL = "https://www.bodystrands.com";

const INFOGRAPHIC_IMAGES = new Set([
  "/images/products/55110011-2bba-4572-8dcb-5f9d06f99c32.png",
  "/images/products/0acc7259-5314-4c79-a09d-8f0f7c724ecf.jpeg",
  "/images/products/4844a113-f32d-458f-a88c-4edea2ff7c35.jpg",
  "/images/products/2394f642-d0d8-4e4e-af9a-96e01db744ae.png",
  "https://i.etsystatic.com/55122258/r/il/a37305/8138540167/il_fullxfull.8138540167_cp1u.jpg",
  "https://i.etsystatic.com/55122258/r/il/15d2b6/8138543253/il_fullxfull.8138543253_p77g.jpg",
  "https://i.etsystatic.com/55122258/r/il/1aad66/8138545889/il_fullxfull.8138545889_li6b.jpg",
  "https://i.etsystatic.com/55122258/r/il/36e8b2/8138539081/il_fullxfull.8138539081_gral.jpg",
  "https://i.etsystatic.com/55122258/r/il/90c06c/8138546519/il_fullxfull.8138546519_j89t.jpg",
  "https://i.etsystatic.com/55122258/r/il/b78f3a/8138541925/il_fullxfull.8138541925_g6th.jpg",
  "https://i.etsystatic.com/55122258/r/il/d372c8/8138549735/il_fullxfull.8138549735_a729.jpg",
  "https://i.etsystatic.com/55122258/r/il/de39c3/8138549029/il_fullxfull.8138549029_6q5v.jpg",
  "https://i.etsystatic.com/55122258/r/il/ff2c3d/8138547075/il_fullxfull.8138547075_5799.jpg",
]);

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const products = JSON.parse(readFileSync(join(ROOT, "data/products.json"), "utf8"));
const activeProducts = products.filter((p) => p.active !== false);

const items = activeProducts.flatMap((product) => {
  const perProductInfographics = new Set(product.infographicImages ?? []);
  const isInfographic = (src) => INFOGRAPHIC_IMAGES.has(src) || perProductInfographics.has(src);

  const allImages = (
    product.gallery
      ? product.gallery
      : product.variants?.length && product.variantImages
        ? product.variants.flatMap((v) => product.variantImages[v] ?? [])
        : product.images ?? []
  ).filter((src) => !isInfographic(src));

  const mainImage = product.images?.[0] ?? allImages[0];
  const additionalImages = allImages.filter((src) => src !== mainImage).slice(0, 9);
  const productUrl = `${BASE_URL}/shop/${product.id}`;
  const price = `${product.price.toFixed(2)} ${product.currency ?? "EUR"}`;
  const variants = product.variants?.length ? product.variants : [null];

  return variants.map((variant) => {
    const variantId = variant ? `${product.id}-${variant.toLowerCase().replace(/\s+/g, "-")}` : product.id;
    const title = variant ? `${product.name} — ${variant}` : product.name;
    const heroSrc = variant && product.variantHeroes?.[variant] ? product.variantHeroes[variant] : mainImage;
    const absoluteHero = heroSrc?.startsWith("http") ? heroSrc : heroSrc ? `${BASE_URL}${heroSrc}` : null;
    if (!absoluteHero) return null;

    const additionalImageTags = additionalImages
      .filter((src) => src !== heroSrc)
      .slice(0, 8)
      .map((src) => {
        const abs = src.startsWith("http") ? src : `${BASE_URL}${src}`;
        return `      <g:additional_image_link>${escapeXml(abs)}</g:additional_image_link>`;
      })
      .join("\n");

    const colorAttr = variant ? `\n      <g:color>${escapeXml(variant)}</g:color>` : "";

    return `  <item>
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
    <g:google_product_category>201</g:google_product_category>${colorAttr}
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

writeFileSync(join(ROOT, "public/merchant-feed.xml"), xml, "utf8");
console.log(`Generated merchant-feed.xml with ${items.length} items`);
