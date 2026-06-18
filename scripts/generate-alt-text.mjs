import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRODUCTS_PATH = join(__dirname, "../data/products.json");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CATEGORY_KEYWORDS = {
  "Shoulder Chains": ["shoulder chain", "shoulder jewelry", "shoulder chain for wedding", "bridal shoulder chain", "shoulder body chain", "arm shoulder chain"],
  "Back Chains": ["back chain", "back body chain", "back jewelry", "back chain for backless dress", "back necklace", "back chain for wedding"],
  "Body Chains": ["body chain", "full body chain", "festival body chain", "beach body chain", "body jewelry", "rave body chain"],
  "Belly Chains": ["belly chain", "waist chain", "belly body chain", "beach belly chain", "bikini belly chain", "festival waist chain"],
  "Anklets": ["anklet", "ankle bracelet", "beach anklet", "summer anklet", "dainty anklet", "ankle chain"],
  "Bracelets": ["bracelet", "dainty bracelet", "stainless steel bracelet", "minimalist bracelet", "charm bracelet"],
  "Necklaces": ["necklace", "dainty necklace", "chain necklace", "pendant necklace", "layering necklace"],
  "Hand Chains": ["hand chain", "hand body chain", "hand jewelry", "ring to bracelet chain", "slave bracelet"],
  "Head Chains": ["head chain", "hair chain", "headpiece", "bridal headpiece", "festival head chain"],
  "Eyeglasses Chains": ["glasses chain", "eyeglasses chain", "sunglasses chain", "spectacle chain"],
  "Bikini Clip Chains": ["bikini chain", "bikini clip chain", "beach jewelry", "swimsuit chain", "bikini body chain"],
};

async function generateAltText(product) {
  const categoryKws = CATEGORY_KEYWORDS[product.category] || [];
  const variants = product.variants ? product.variants.join(" / ") : "";
  const material = product.specs?.find(s => s.label === "Material")?.value || "stainless steel";

  const prompt = `You are an SEO expert for a handmade jewelry brand called Bodystrands, based in Portugal.

Generate ONE alt text string for this product image. It must:
- Be 12-18 words max
- Include 2-3 long-tail keywords naturally (not stuffed)
- Include material (stainless steel), finish (gold/silver if applicable), and use case
- Sound natural, not robotic
- NOT start with "image of" or "photo of"
- Use long-tail keywords like: ${categoryKws.slice(0, 3).join(", ")}

Product:
Name: ${product.name}
Category: ${product.category}
Material: ${material}
Variants: ${variants}
Description: ${product.description?.slice(0, 150) || ""}

Return ONLY the alt text string. No quotes, no explanation.`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 100,
    messages: [{ role: "user", content: prompt }],
  });

  return message.content[0].text.trim().replace(/^["']|["']$/g, "");
}

async function main() {
  const products = JSON.parse(readFileSync(PRODUCTS_PATH, "utf8"));
  console.log(`Generating alt text for ${products.length} products...`);

  let updated = 0;
  for (const product of products) {
    try {
      const altText = await generateAltText(product);
      product.altText = altText;
      console.log(`✓ ${product.name}\n  → ${altText}`);
      updated++;
      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.error(`✗ ${product.name}: ${err.message}`);
    }
  }

  writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2));
  console.log(`\nDone. Updated ${updated}/${products.length} products.`);
}

main();
