// Generates a Pinterest posting schedule manifest from the product catalog.
// Hard rule: never selects an image that's already in data/pinterest-posted-images.json —
// that file is the permanent cross-session record of every image ever scheduled.
// Run: node scripts/generate-pinterest-schedule.mjs <startDate:YYYY-MM-DD> <perDay> <days>
import { readFileSync, writeFileSync, existsSync } from "fs";

const [, , startDateArg, perDayArg, daysArg] = process.argv;
if (!startDateArg || !perDayArg || !daysArg) {
  console.error("Usage: node scripts/generate-pinterest-schedule.mjs <startDate:YYYY-MM-DD> <perDay> <days>");
  process.exit(1);
}
const PER_DAY = parseInt(perDayArg, 10);
const TARGET_DAYS = parseInt(daysArg, 10);
const START_DATE = startDateArg;

const products = JSON.parse(readFileSync("data/products.json", "utf8"));

const LEDGER_PATH = "data/pinterest-posted-images.json";
const ledger = existsSync(LEDGER_PATH)
  ? JSON.parse(readFileSync(LEDGER_PATH, "utf8"))
  : { note: "Every image URL ever scheduled to Pinterest. Never remove entries; only append.", lastUpdated: null, images: [] };
const alreadyUsed = new Set(ledger.images);

const INFOGRAPHIC_IMAGES = new Set([
  "/images/products/55110011-2bba-4572-8dcb-5f9d06f99c32.png",
  "/images/products/0acc7259-5314-4c79-a09d-8f0f7c724ecf.jpeg",
  "/images/products/4844a113-f32d-458f-a88c-4edea2ff7c35.jpg",
  "/images/products/2394f642-d0d8-4e4e-af9a-96e01db744ae.png",
]);

const BOARD_BY_CATEGORY = {
  "Shoulder & Arm Chains": "1122663082051843209",
  "Anklets": "1122663082051443454",
  "Leg Chains": "1122663082051443454",
  "Back Chains": "1122663082051406999",
  "Head Chains": "1122663082051515031",
  "Belly Chains": "1122663082051406606",
  "Bikini Clip Chains": "1122663082051406606",
  "Body Chains": "1122663082051403313",
  "Bracelets": "1122663082051403313",
  "Hand Chains": "1122663082051403313",
  "Necklaces": "1122663082051417775",
  "Eyeglasses Chains": "1122663082051417775",
};

const HOOKS = [
  "The detail no one expects.",
  "Made to be worn every day.",
  "Quiet luxury, everyday wear.",
  "The piece that finishes the look.",
  "Small detail, big difference.",
  "Built to last, made to move.",
  "The kind of piece you forget you're wearing.",
  "An everyday staple, elevated.",
  "For the days you want to feel put together.",
  "Handmade, waterproof, made to stay on.",
];

const BASE_URL = "https://www.bodystrands.com";
const PINTEREST_INTEGRATION_ID = "cmqlao2zv0efwmm0y5cq6miuu";

const active = products.filter((p) => p.active !== false);

// Build the pool: unique by image URL GLOBALLY (several products share the same
// lifestyle/variant photo — posting that file under a different product name is
// still a repost), and excluding anything already in the permanent ledger.
const pool = [];
const seenThisRun = new Set();
for (const p of active) {
  const perProductInfo = new Set(p.infographicImages ?? []);
  const isInfo = (src) => INFOGRAPHIC_IMAGES.has(src) || perProductInfo.has(src);
  let allImages;
  if (p.gallery) allImages = p.gallery;
  else if (p.variants?.length && p.variantImages) allImages = p.variants.flatMap((v) => p.variantImages[v] ?? []);
  else allImages = p.images ?? [];
  const unique = [...new Set(allImages.filter((src) => !isInfo(src) && !src.endsWith(".mp4")))];
  for (const img of unique) {
    if (seenThisRun.has(img) || alreadyUsed.has(img)) continue;
    seenThisRun.add(img);
    pool.push({ productId: p.id, name: p.name, category: p.category, image: img });
  }
}

function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function dedupeAdjacentProducts(items, windowSize) {
  const result = [];
  const pending = [...items];
  while (pending.length) {
    const recentProductIds = new Set(result.slice(-(windowSize - 1)).map((x) => x.productId));
    let idx = pending.findIndex((x) => !recentProductIds.has(x.productId));
    if (idx === -1) idx = 0;
    result.push(pending.splice(idx, 1)[0]);
  }
  return result;
}

let shuffled = dedupeAdjacentProducts(seededShuffle(pool, Date.now() & 0x7fffffff), PER_DAY);

const requested = PER_DAY * TARGET_DAYS;
if (shuffled.length < requested) {
  console.warn(`Only ${shuffled.length} fresh unique images available (requested ${requested}). Scheduling fewer posts on later days rather than repeating anything.`);
}
shuffled = shuffled.slice(0, requested);

const TIMES_15 = ["07:00","07:30","08:00","08:30","09:00","09:30","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];
const TIMES = TIMES_15.slice(0, PER_DAY);

function addDays(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const posts = [];
let hookIdx = 0;
for (let dayIdx = 0; dayIdx * PER_DAY < shuffled.length; dayIdx++) {
  const dayItems = shuffled.slice(dayIdx * PER_DAY, dayIdx * PER_DAY + PER_DAY);
  const date = addDays(START_DATE, dayIdx);
  dayItems.forEach((item, i) => {
    const hook = HOOKS[hookIdx % HOOKS.length];
    hookIdx++;
    const board = BOARD_BY_CATEGORY[item.category];
    if (!board) return;
    const title = `${item.name} | ${item.category}`;
    const content = `${hook} ${item.name} | ${item.category} | shop bodystrands.com`;
    const media = item.image.startsWith("http") ? item.image : `${BASE_URL}${item.image}`;
    const link = `${BASE_URL}/shop/${item.productId}`;
    posts.push({
      date: `${date}T${TIMES[i]}:00.000Z`,
      content,
      media,
      integration: PINTEREST_INTEGRATION_ID,
      settings: { board, link, title },
      productId: item.productId,
      category: item.category,
    });
  });
}

writeFileSync("scripts/.pinterest-manifest.json", JSON.stringify(posts, null, 2));

// Append this run's images to the permanent ledger immediately — even before
// the posts are actually created via the API — so a retried/failed run never
// re-selects the same images on the next attempt.
const updatedLedger = {
  note: "Every image URL ever scheduled to Pinterest. Never remove entries; only append.",
  lastUpdated: new Date().toISOString(),
  images: [...new Set([...ledger.images, ...posts.map((p) => p.media)])].sort(),
};
writeFileSync(LEDGER_PATH, JSON.stringify(updatedLedger, null, 2));

console.log("Posts generated:", posts.length, "| Days covered:", Math.ceil(posts.length / PER_DAY));
console.log("Ledger now contains", updatedLedger.images.length, "total historically-scheduled images.");
console.log("Manifest written to scripts/.pinterest-manifest.json");
