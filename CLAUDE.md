@AGENTS.md

# Bodystrands — Project Rules & Context

## Brand
- Site: bodystrands.com — handmade body jewelry, made in Portugal by El & Gio
- Brand name is ONE word: **Bodystrands** (never "Body Strands")
- Fonts: Cormorant Garamond (headings) + Josefin Sans (body) — **Inter is FORBIDDEN**
- Colors: blush `#E8B4A8`, gold `#A0622A`, warm dark `#2C2220`, cream `#FDF9F7`, warm gray `#8C7B6E`

## Image Generation Prompts — MANDATORY RULES (every single time)

Giordano drops the reference jewelry photo directly into the LLM alongside the prompt. The LLM uses it as a visual reference. These rules apply to EVERY prompt, no exceptions:

### What to describe in prompts
- Scene, model, lighting, outfit, environment, camera lens — that is ALL
- **NEVER describe the jewelry itself** — the reference image handles that
- Every prompt ends with: **"Keep the jewelry from the reference image exactly as shown — do not alter, stylize, or reinterpret any part of it."**

### Lighting — non-negotiable
- Always natural daylight
- A subtle natural sun reflection / metallic sheen catching on the chain links — makes it look bright and alive
- **NEVER**: sparkle effects, star bursts, lens flares, artificial studio strobes
- The phrase to use: *"a soft natural highlight catches across the chain links, making the metal appear luminous without any alteration"*

### What a thumbnail prompt looks like (the APPROVED format)
From the session where the user said "very good job, save this to memory" — the successful image had:
- Gray seamless background
- 105mm f/2.8 or 85mm f/1.4 lens spec
- Tight crop from chin to mid-chest — face cropped at jaw/chin, not shown
- Hair swept back so the neck is completely clear
- Jewelry centered and the sharpest element in the entire frame
- Warm olive skin model, dark hair
- Soft natural window light from upper left hitting the necklace directly
- The phrase: *"The jewelry is the only subject"*

### Model realism — no AI plastic skin
Models must look like real humans, not AI-generated mannequins. Always include natural skin texture cues in every prompt:
- Use phrases like: *"natural skin texture, subtle freckles, realistic pores, soft imperfections"*
- Still beautiful editorial models — great bone structure, clean look — just human, not synthetic
- Avoid over-smoothed, waxy, or poreless AI-skin
- Suggested phrase to add to every prompt: *"realistic skin texture with subtle natural imperfections, not AI-smooth — photographed on real film"*

### Aspect ratio — always 1:1
All thumbnail prompts must specify **square format, 1:1 aspect ratio**. Etsy thumbnails are square. Include the line: *"Square format, 1:1 aspect ratio."* in every prompt.

### Always specify camera lens
- **Tight product / thumbnail**: 105mm f/2.8 macro
- **Portrait / editorial**: 85mm f/1.4 or 85mm f/1.2
- **Lifestyle / environmental**: 70–200mm f/2.8 at 135mm (compresses background)

### Prompt set structure (when asked for a full set)
Generate 6 prompts minimum:
1. **Gray background studio** — pure product focus, chin-to-chest crop, 105mm, gray seamless backdrop (always include this one)
2. **Beach / coastal lifestyle** — bright, turquoise water bokeh behind, tight crop
3. **Mediterranean terrace** — white stone, warm sunlight, mid-distance
4. **Garden / nature** — green bokeh, dappled light
5. **Golden hour outdoor** — warm tones, desert/dunes or coastal
6. **Urban / fashion editorial** — rooftop, structured outfit, clean background

Switch up: model skin tone, hair, outfit color, environment — every prompt is a different model and setting.

### Outfit language that avoids nudity filters
- ✅ sleeveless top, ribbed tank, off-shoulder linen, crochet cover-up, strappy sundress, structured blazer, white blouse, halter neck
- ❌ bikini, swimsuit, bare chest, topless, naked, shirtless

### Hard Rules
- **NO Etsy links anywhere on the site** — customers would find cheaper prices. The Buy on Etsy button was intentionally removed and must never come back.
- No Amazon links either.
- No `etsy_url` or `amazon_url` fields on Product type.

## Product Folder Structure

### ALWAYS CHECK THIS SHARED FOLDER FIRST for new listings:
`/Volumes/jordan 2tb/Vscode  bodystrandseu/bodystrandseu/Media Files shared with Claude/Listed products on website/[Product Name]/`
- Giordano prepares each listing here with: photos, SEO copy (text file or screenshot), price, and variant notes
- Read ALL files in the folder before listing — especially any .txt or screenshot showing the Etsy copy
- The SEO copy contains: product title, description, specs/measurements, variant options, price
- Extract variant groups (Size, Attachment, etc.) from the copy and add as `variantGroups`

Raw asset library (not for direct listing — use the shared folder above):
`/Volumes/jordan 2tb/Bodystrands/Bodystrands/Elvan Baby/[Category]/[Product Name]/`

Each product folder contains:
```
Product Name/
├── Gold/                         ← Gold variant photos + gold video (if exists)
├── Silver/                       ← Silver variant photos + silver video (if exists)
├── Apply to Both Variations/     ← Lifestyle + infographic photos shown for BOTH variants
├── Main hero image (main webpage img)/  ← Single hero image for the shop grid card thumbnail
├── Sub hero image/               ← Hero image shown on the product detail page
└── video.mp4 (optional root)     ← If only one video, place at root, applies to both variants
```

## Image Display Logic
- Customer selects **Gold** → Gold/ photos first + Apply to Both Variations/ photos after
- Customer selects **Silver** → Silver/ photos first + Apply to Both Variations/ photos after
- Shop grid card thumbnail → the single photo from Main hero image folder
- **NO hover video on shop card** — replaced with swipeable carousel
- **Video is always inserted as the 2nd item in the product detail gallery** (position index 1)
- Image order in gallery follows exactly the folder order (left to right)

## Shop Card Carousel (ProductCard.tsx)
- Swipeable image carousel — swipe left/right to browse images and video
- Media order: [first image, video at position 2, remaining images]
- Swipe uses non-passive native touchstart+touchmove DOM listeners (NOT React synthetic events)
  — this is critical: React handlers fire AFTER native, so direction must be detected natively
  to call preventDefault() on the very first touchmove before browser commits to scrolling
- Video: preload="metadata" on render + preload="auto" + v.load() when on adjacent slide
  (pre-buffers so video plays instantly when user swipes to it)
- Default images: first variant's full image set (not just hero thumbnail)
- Dot indicators at bottom, desktop prev/next arrows on hover
- Variant swatches on desktop hover, positioned above dots

## Gallery & Swipe Rules (ALWAYS apply to every product)
- ProductGallery (detail page) always supports touch swipe — same non-passive native listener pattern
- Dot indicators shown on mobile at bottom of main image
- Arrow buttons shown on desktop
- Video thumbnail in strip shows a dark background with ▶ play icon
- Video autoplays (muted, loop) when it becomes the active item
- object-cover on all gallery images (NOT object-contain — that causes letterboxing)

## Product Data Modes — ALWAYS use one of these three, never mix incorrectly

### Mode 1 — Per-variant images (different photo sets per finish, e.g. most belly/back chains)
```json
{ "variants": ["Gold Tone", "Silver Tone"],
  "variantImages": { "Gold Tone": [...], "Silver Tone": [...] },
  "variantVideos": { "Gold Tone": "url", "Silver Tone": "url" },
  "images": ["first-gold-hero.jpg"] }
```

### Mode 2 — Unified gallery + hero selector (shared images, per-finish hero, e.g. layered-arm-chain)
```json
{ "variants": ["Gold Tone", "Silver Plated", "Stainless Steel"],
  "variantHeroes": { "Gold Tone": "img-gold.png", "Silver Plated": "img-silver.png", "Stainless Steel": "img-stainless.png" },
  "variantVideos": { "Gold Tone": "url", "Silver Plated": "url", "Stainless Steel": "url" },
  "gallery": ["img-gold.png", "img-silver.png", "img-stainless.png", "img-info.jpg"],
  "images": ["img-gold.png"] }
```
- `variants` = hero badge buttons in admin + drives activeVariant
- `variantHeroes` = which gallery image becomes the main hero per finish
- `variantVideos` = same URL repeated for all (admin writes all at once via single dropzone)
- NO root `"video"` field in this mode

### Mode 3 — No variants, single video (simple product)
```json
{ "gallery": [...], "video": "url", "images": ["hero.jpg"] }
```

### CRITICAL — never set `gallery` + no `variants` + root `video`
That combination shows TWO video slots in admin. Admin bug is permanently patched (`!form.gallery` guard on no-variant section), but still follow the correct mode above.

### When variantGroups covers the same options as variants (e.g. Finish dropdown + optionPrices):
- Keep `variants` for admin hero selector
- Keep `variantGroups[Finish]` for pricing via `optionPrices`
- ProductPageClient auto-suppresses duplicate swatch buttons and syncs activeVariant from the dropdown — no extra setup needed

## Video Rules
- Per-variant mode: use `variantVideos` keyed by variant name
- Unified gallery mode: use `variantVideos` with the same URL for every variant key (NOT root `video`)
- Simple / no-variant: use root `video` field only
- Accepted formats: .mp4 only (convert .mov with: `avconvert -s input.mov -o output.mp4 -p PresetMediumQuality --replace`)

## Mobile-First Rules (80% of customers are on mobile)
- Gallery is full-bleed on mobile (no horizontal padding): wrap in `-mx-6 md:mx-0`
- Touch swipe must work on the main gallery image
- Shop page: category filter stacks ABOVE the product grid on mobile (flex-col on mobile, flex-row on lg+)
- Product page: `pt-20 md:pt-32` (not pt-32 alone)
- All tap targets minimum 44px tall (buttons, swatches, variant selectors)
- Test mobile layout before shipping any product page changes

## Product Readiness Signal
- A product is **READY TO LIST** when its folder exists in the shared Claude folder (see above)
- Always read the SEO copy file/screenshot to extract: title, price, description, measurements, variant options
- Use the copy's description verbatim (lightly adapted for tone) — do NOT invent specs or measurements
- If a Size variant group is listed in the copy, add it as a `variantGroup` (mandatory selector, same as Attachment)

## Etsy Description Format — ALWAYS use this structure, no exceptions

The correct format (confirmed by user Jul 2026). Never invent a different structure.

```
[Bold hook line — short, punchy, 1–2 lines max]

[Product paragraph — evocative, first-person warmth, describes the piece + occasion/feeling + material benefit naturally woven in. NO "solid gold" language — always "gold-tone" or "gold-tone stainless steel".]

Product Details
Material: [material]
[other specs as labeled lines]
Closure: [closure type]
Waterproof & Sweat-Proof: Yes — safe for water, sun, and everyday wear

Size Guide
[size table or list]

Fit Note: [how to measure + sizing guidance]

Custom Sizing: Need a specific measurement? Message me before ordering and I'll make it to your exact size at no extra cost.

Care Instructions
Wipe gently with a soft cloth after each wear.
Store in an airtight container when not in use.

Shipping: Dispatches within 1–2 business days.

Please note that as each piece is handcrafted, no two pieces are identical and slight variations may occur.

Check out more jewellery in our shop: bodystrandseu.etsy.com

Thanks for looking! Feel free to message me if you have any questions.
```

### Key rules for the opening:
- Bold hook line = short, striking, unexpected angle on the product
- Product paragraph = warm, personal, first-person ("I made this...")
- Never say "gold" as if it's solid gold — always "gold-tone finish" or "gold-tone stainless steel"
- Describe the feeling + occasion naturally, don't list features in the paragraph

## Master Listing Procedure (apply to every new product)
1. Read product folder structure (Gold/, Silver/, Apply to Both Variations/, hero folders)
2. Map images to variantImages: Gold first, then Silver, "Apply to Both" appended to BOTH variants
3. Convert any .mov videos to .mp4
4. Video goes at variantVideos (or root `video` if single)
5. `images` field = [main hero image] (shop card thumbnail)
6. Insert video as 2nd item automatically in gallery (buildMedia handles this)
7. ProductGallery + swipe is always present — no extra setup needed per product
8. activeCategories auto-updates navbar/homepage tiles when product is added

## Categories (11 total — all have products)
Belly Chains, Back Chains, Body Chains, Shoulder Chains, Anklets, Bracelets, Necklaces, Hand Chains, Head Chains, Eyeglasses Chains, Bikini Clip Chains
- All 11 are in CATEGORIES const in lib/products.ts
- All 11 tiles ALWAYS render on homepage — no activeCategories filter (was hiding tiles when ScrollReveal didn't fire)
- Category tile images: category-belly.png, elvan-back-full.jpg (Back Chains), category-body.jpg, category-shoulder.jpg, lifestyle-anklet.jpg (Anklets), category-necklace.jpg, category-bracelet.jpg, category-hand.jpg, category-head.jpg, category-glasses.jpg, category-bikini.jpg

## Homepage Layout
- Hero: full-screen /images/hero-back-chain.jpg
- Category grid: Back Chains = col-span-2 md:row-span-2 portrait hero anchor, all others = aspect-[3/4] portrait, grid-cols-2 mobile / grid-cols-4 desktop, NO ScrollReveal on tiles
- Lifestyle slider: reads all files from public/images/lifestyle/ folder sorted alphabetically (7 files: 01–07)
- Brand Story: /images/elvan-back-cross.jpg
- Page transitions: PageTransition component in layout.tsx, key={pathname}, animate-page-in CSS keyframe

## Shop Page
- "All Pieces" view: grouped by category with gold dividers in CATEGORIES order
- Filtered view: flat grid
- Grid: grid-cols-2 md:grid-cols-3 xl:grid-cols-4

## Product Detail Page Extras
- Sticky mobile CTA (md:hidden): IntersectionObserver on Buy button div, slides up with animate-slide-up when Buy button scrolls off screen
- "You May Also Like": same category, first 4, below the main product content (YouMayAlsoLike.tsx server component)

## Admin Panel
- URL: bodystrands.com/admin (password protected)
- Every save commits directly to GitHub → Vercel auto-deploys in ~1 min
- Image uploads go directly to `public/images/products/` via GitHub API
- Drag-to-reorder images in the product editor
- Dashboard: products grouped by category with red ✕ delete button (top-left of thumbnail, requires confirm)
- Site Images page: 6 sections clearly labeled with WHERE each photo appears on the live site:
  1. Homepage — Hero
  2. Homepage — Category Tiles (11 slots)
  3. Homepage — Lifestyle Slider (7 slots → images/lifestyle/XX-name.jpg)
  4. Homepage — Brand Story
  5. About Page (single slot: lifestyle-pearl-back.jpg)
  6. Logo

## Key Files
- `data/products.json` — single source of truth for all product data
- `lib/products.ts` — imports products.json, exports Product type, CATEGORIES, activeCategories
- `app/(site)/page.tsx` — homepage (category grid, lifestyle slider, brand story)
- `app/(site)/shop/page.tsx` — shop page with category filter + grouped "All Pieces" view
- `app/(site)/shop/[id]/page.tsx` — product detail page
- `components/ProductCard.tsx` — shop grid card with swipeable carousel
- `components/ProductGallery.tsx` — detail page gallery (swipe, video at pos 2, thumbnails)
- `components/ProductPageClient.tsx` — client wrapper with sticky CTA logic
- `components/YouMayAlsoLike.tsx` — "You May Also Like" server component
- `components/PageTransition.tsx` — page transition animation wrapper
- `components/Navbar.tsx` — scroll-aware navbar with Shop dropdown
- `components/LifestyleSlider.tsx` — reads images/ lifestyle/ folder dynamically
- `app/admin/dashboard/page.tsx` — admin product grid with delete
- `app/admin/site-images/page.tsx` — admin image upload with 6 labeled sections
- `app/(site)/api/admin/site-images/route.ts` — handles image upload to GitHub (supports subdirs like images/lifestyle/)
- `app/globals.css` — CSS keyframes: page-in, slide-up, reveal-hidden/reveal-visible
- `app/icon.png`, `app/favicon.ico`, `app/apple-icon.png` — generated from logo-pink.png
- `public/images/products/` — all product images served from here
- `public/images/lifestyle/` — lifestyle slider images (01-07, sorted alphabetically)
- `proxy.ts` — Next.js 16 middleware (NOT middleware.ts — that's a breaking change in v16)

## Tech Stack
- Next.js 16 (App Router) — params and searchParams are Promises, must be awaited
- **Next.js 16 uses `proxy.ts` for middleware, NOT `middleware.ts`** — this is a breaking change
- Tailwind CSS v4 — uses `@import "tailwindcss"` and `@theme inline {}` syntax
- TypeScript strict
- Deployed on Vercel via GitHub (BodyStrandEU/bodystrands-website)
- Stripe checkout in `/api/checkout` — secret key in `.env.local` only, never commit

## New Product Listing Checklist (MANDATORY — do this every time)

When adding any new product, always do the following WITHOUT being asked:

### 1. Generate Alt Text — ONLY manual SEO step
After adding product to `data/products.json`, run:
```
ANTHROPIC_API_KEY=<key> node scripts/generate-alt-text.mjs
```
This writes a long-tail SEO `altText` field to every product in products.json.
The Anthropic API key is NOT in .env.local — ask the user to paste it (or create a new key at console.anthropic.com). Model: claude-haiku-4-5-20251001.

### 2–6. Everything else is AUTOMATIC
- **SEO title**: `CATEGORY_SUFFIX` map in `app/(site)/shop/[id]/page.tsx` — format: `Name | Category Suffix | Bodystrands`
- **Meta description**: uses `product.altText` automatically in `generateMetadata`
- **Sitemap**: `app/sitemap.ts` reads `data/products.json` automatically
- **Blog links**: `scripts/generate-blog-post.mjs` reads `data/products.json` on every run
- **Category metadata**: `CATEGORY_META` in `app/(site)/shop/page.tsx` covers all 11 categories

## SEO Infrastructure (set up June 2026)
- Google Search Console: verified, sitemap submitted (113+ pages indexed)
- Bing Webmaster Tools: set up via GSC import
- Blog auto-generation: 3x/day via cron-job.org → GitHub Actions (workflow ID: 297904761)
  - Trigger times: 7:00, 12:00, 17:00 UTC (8am, 1pm, 6pm Portugal)
  - cron-job.org job IDs: 7854981 (7am), 7854984 (12pm), 7854985 (5pm)
- All 111 products have long-tail `altText` for Google Images SEO
- All 11 category pages have unique meta titles/descriptions
- All product pages have keyword-rich titles via CATEGORY_SUFFIX mapping
- Blog posts auto-link to products + category pages for internal linking
- `unoptimized: true` in next.config.ts is a TEMPORARY fix for Vercel free tier image quota — revert when upgrading to Vercel Pro
