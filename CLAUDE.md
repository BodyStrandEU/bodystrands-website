@AGENTS.md

# Bodystrands — Project Rules & Context

## Hosting: Cloudflare Workers — Vercel dropped Sep 25, 2026
The site moved from Vercel to Cloudflare Workers (OpenNext adapter) because Vercel's ISR Writes limit (200K/mo) was exceeded. The Worker was bound to the bodystrands.com custom domain on Sep 12 and the migration merged into `main` on Sep 13; every push to `main` deploys via `.github/workflows/cloudflare-deploy.yml`. On Sep 25, 2026 the Vercel deploy workflow (`deploy.yml`) and `@vercel/analytics` / `@vercel/speed-insights` were removed — those scripts 404 on Cloudflare, so the Vercel Analytics dashboard stopped recording on Sep 12. Visitor analytics = Google Analytics 4 (`G-8ZSFBD94RN`, in `app/layout.tsx`) + Cloudflare Web Analytics (dashboard toggle) + Google Search Console. The Vercel project itself may still exist in the Vercel dashboard, paused as a fallback — deleting it is the user's call. **DNS changes still need explicit user confirmation each time.**

Admin analytics dashboard (`/admin/analytics`) pulls GA4 data via `lib/ga4.ts` — a fetch + Web Crypto client for the GA4 Data REST API. Do NOT reintroduce `@google-analytics/data`: it uses gRPC, which can't run on Workers (it failed silently after the move). Needs Worker secrets `GA4_PROPERTY_ID` (numeric property id, not the G- measurement id) and `GA4_SERVICE_ACCOUNT_JSON` (service account key JSON; the account must be a Viewer on the GA4 property). Connection errors show on the dashboard.

The notes below are from the migration period (Sep 10-13) and are kept for their operational gotchas.

**Done and verified on the deployed Worker** (`https://bodystrands-website.bodystrands-website.workers.dev`):
- Full build/deploy pipeline works (R2 incremental cache, `.assetsignore` for oversized video assets, `experimental: { cpus: 2 }` to cap build parallelism)
- Stripe SDK fixed for Workers runtime — added `httpClient: Stripe.createFetchHttpClient()` to all 7 init sites (6 API routes + checkout route); this was the root cause of checkout hanging/timing out
- Checkout flow confirmed working live (tested twice with real products)
- Stripe webhook confirmed working live (signature verification, line-items lookup, Resend email send all succeed — tested with a signed test event)
- Fixed 4 admin-notification emails that were hardcoded to the personal gmail — now correctly send to `info@bodystrands.com` (see "Admin Notification Emails" section below)

**Still untested** (per explicit user instruction: don't consider migration verified, and don't discuss DNS cutover, until ALL of this is confirmed working):
- Admin panel UI (dashboard, product editor, image upload)
- Review submission flow
- Contact form
- Newsletter signup
- `proxy.ts` Node.js middleware behavior — Cloudflare/OpenNext flags this as experimental/not officially supported for this adapter, worth extra scrutiny

**Known flaky-but-harmless build issues** (root-caused, not real bugs — just retry):
- Transient `ETIMEDOUT` during the "Bundling cache assets" step of `opennextjs-cloudflare build` — happens intermittently, resolved by re-running the same `npm run deploy` command
- Static page generation sometimes logs "took more than 60 seconds, retrying" under system resource contention — self-heals on retry, not a code bug
- `wrangler deploy`'s cache-population step gets stuck in an infinite retry loop — worked around via a **local-only, not-git-committed** patch to `node_modules/@opennextjs/cloudflare/dist/cli/commands/deploy.js` gating `populateCache` behind a `SKIP_CACHE_POPULATE` env var. Always deploy with `SKIP_CACHE_POPULATE=1 npm run deploy`. If `node_modules` ever gets reinstalled fresh, this patch is lost and must be reapplied (grep the file for `SKIP_CACHE_POPULATE` to check if it's still there).

**Machine resource pressure**: Builds on this Mac have been slow/flaky due to low disk space and CPU contention (internal SSD often near-full). `TMPDIR` is redirected to the external HDD via `~/.zshenv` (`/Volumes/jordan 2tb/Vscode  bodystrandseu/claude-tmp/`) to relieve pressure — keep this in place. Check `df -H /System/Volumes/Data` if the user reports slowness; if free space drops critically low again, pause heavy builds and investigate before continuing.

**CRITICAL — secrets get wiped on every `wrangler deploy`**: `wrangler.jsonc` does not declare a `vars`/secrets block, and any env vars that were ever set only via the Cloudflare dashboard UI get silently dropped the next time `wrangler deploy` runs (a full deploy replaces the worker's whole binding set with exactly what's declared/pushed via CLI). This caused a real outage of the contact form mid-session (Sep 10, 2026) — `RESEND_API_KEY` and friends vanished after a routine redeploy. **After every deploy to this Worker, always verify secrets are present** (`npx wrangler secret list` — should show all ~14 keys from `.env.local` except `NEXT_PUBLIC_*`/`ANTHROPIC_API_KEY`) and if empty/incomplete, restore them:
```bash
bash -c '
set -a && source .env.local && set +a
for key in NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY STRIPE_SECRET_KEY ADMIN_PASSWORD GITHUB_TOKEN GITHUB_REPO CF_STREAM_TOKEN CF_ACCOUNT_ID CF_CUSTOMER_SUBDOMAIN RESEND_API_KEY STRIPE_WEBHOOK_SECRET REVIEW_TOKEN_SECRET POSTIZ_API_KEY RESEND_NEWSLETTER_SEGMENT_ID RESEND_CUSTOMER_SEGMENT_ID RESEND_FROM_EMAIL GA4_PROPERTY_ID GA4_SERVICE_ACCOUNT_JSON; do
  val="${!key}"
  [ -n "$val" ] && printf "%s" "$val" | npx wrangler secret put "$key"
done
'
```
(Note: `${!key}` indirect expansion requires real `bash`, not `sh`/`dash` — the Bash tool's default shell can silently be the wrong one, always wrap in `bash -c '...'` for this.)

**Resend sandbox-sender restriction**: `onboarding@resend.dev` (Resend's shared test sender, no domain verification needed) can only send TO the Resend account's own registered/verified email — it 403s on any other recipient. `bodystrands.com` is a verified sending domain on this account, so every outgoing email in this app must use `from: "... <info@bodystrands.com>"` (or `process.env.RESEND_FROM_EMAIL`), never `onboarding@resend.dev`, or it'll break the moment the `to` address isn't the account owner's inbox. Fixed in `app/(site)/api/contact/route.ts` Sep 10, 2026 — grep the codebase for `resend.dev` if this ever resurfaces.

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

### Infographic-style prompts (sizing/feature diagrams) — APPROVED format, confirmed Sep 13, 2026
User's exact words on the layout: *"i love how you made this infographic.. the integrated photo in the image looks high end.. incredible.. save that please"* — layout below is locked. **But** the first version's typography and color read off-brand (generic bold serif, flat muted brown, plain black body text) — every prompt must now spell out the exact brand look in words, since the model can't read hex codes or font names directly:
- Whole image on a soft cream background (`#FDF9F7`-style, warm ivory, not stark white), the product photo bleeding directly into the cream (no hard rectangular photo frame/border — the photo fades/blends into the infographic background at the top)
- Label callouts are rounded-rectangle cream boxes with a thin warm-gold outline, connected to the exact point on the jewelry via a **dotted line ending in a small solid dot** at the jewelry
- **Typography**: an elegant, high-contrast, slightly delicate serif with refined thin-and-thick stroke contrast (like Cormorant Garamond or Didot) for all headings/titles — explicitly NOT a generic bold slab serif, NOT Times New Roman, NOT a heavy/blocky serif
- **Title color**: warm antique gold (like `#A0622A` — a rich warm brownish-gold, not flat muted brown, not orange)
- **Body/description text color**: warm dark brown-black (like `#2C2220`, a warm near-black), never pure flat black
- Label box text: warm-gold elegant serif title (e.g. "MIRROR LINK CHAIN"), a thin gold rule underneath, then 2-line warm dark brown description underneath the rule
- Below the photo: a thin horizontal rule on each side flanking "SIZE GUIDE" in large elegant serif caps (same refined serif, warm gold or warm dark), centered
- Under that: "LENGTH — X cm base" then "ADJUSTABLE RANGE — X–Y cm with extender", centered, normal weight, warm dark brown-black
- Bottom row: 3 evenly-spaced hexagon-outline icons in warm gold (hand+heart for Handmade, droplet for Waterproof & Sweat-Proof, sparkle/stars for Stainless Steel or Tarnish-Resistant Gold), each with a bold caps label underneath in warm dark brown-black, thin vertical divider rules between each icon group
- Always include **"Square format, 1:1 aspect ratio."** — this rule applies to every image type, not just photography prompts
- For single-chain products, use one label; for layered/multi-component products, use one label per chain/element
- Always include the Size Guide block with real product measurements

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

## Images — user handles them, don't block on missing photos (confirmed Sep 14, 2026)
User's exact words: *"i take care of the images always... just push the listing ill add photos and videos."* When the user gives title/description/price/variants for a new product but no images exist yet (shared folder empty, no files handed over), don't wait — add the full product entry to `data/products.json` immediately with `"images": []`, `"gallery": []`, and `"active": false` (so it doesn't render as a broken/empty listing on the live shop, per the `active !== false` gating in `shop/page.tsx` and `page.tsx`). The user will add the actual photos/videos themselves via the admin panel and flip it active — that's their workflow, not something to prompt them for or wait on.

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
- Every save commits directly to GitHub → Cloudflare auto-deploys (a few minutes)
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
- Deployed on Cloudflare Workers via GitHub Actions (BodyStrandEU/bodystrands-website)
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
- Blog auto-generation (revamped Sep 25, 2026 — "fewer, stronger posts that answer search questions"):
  - `scripts/generate-blog-post.mjs` writes at most ONE post every 2 days (~3-4/week), enforced in the script because cron-job.org still triggers the workflow (ID 297904761) 3x/day (job IDs 7854981, 7854984, 7854985) — extra runs just exit. Manual run with the "force" checkbox bypasses the gap.
  - Subject alternates between (1) a newly added live product no post covers yet (`sourceProductId`) — the post targets what people search about that TYPE of piece — and (2) the next in-season entry in `data/blog-queue.json` (fresh `source: "research"` entries first, then the static seasonal calendar; `months` gates seasonality).
  - `scripts/research-blog-keywords.mjs` (workflow `blog-research.yml`, Mondays 06:00 UTC) web-searches trending jewelry/gifting queries and prepends up to 6 new entries to the queue. Add or reorder queries in `blog-queue.json` by hand any time.
  - Model: claude-opus-5 with structured output; quality gate (≥800 words, no banned words, no near-duplicate titles, links only to real product ids) with one retry.
  - Blog commits must NOT use `[skip ci]` — before Sep 25, 2026 they did, so posts only went live when some other push happened to trigger a deploy (Sep 22-24 posts sat unpublished).
  - Post content blocks: `paragraph`, `heading`, `list` (`items: string[]`).
- All 111 products have long-tail `altText` for Google Images SEO
- All 11 category pages have unique meta titles/descriptions
- All product pages have keyword-rich titles via CATEGORY_SUFFIX mapping
- Blog posts auto-link to products + category pages for internal linking

## Social Media Scheduling Rules (Postiz) — ALWAYS follow these

### Platforms & Integration IDs
- Instagram: `cmqlb4q1h01plp40y69rmv5ml`
- Facebook: `cmqmpm92f01uzmm0ysb6fbid0`
- Pinterest: `cmqlao2zv0efwmm0y5cq6miuu`
- TikTok: `cmqlbc5bg0em0mm0ysygo2yvi` — **SUSPENDED, do not schedule until user confirms appeal resolved**

### Daily volume (maximized without flooding)
- **Instagram**: 1 post/day (lowered from 2 on Sep 13, 2026, per user request)
- **Facebook**: 1 post/day (lowered from 2 on Sep 13, 2026, per user request — kept symmetric with Instagram)
- **Pinterest**: 5 pins/day (lowered from 15 on Jul 24, 2026, per user request) — spread across the day, e.g. 08:00, 10:00, 12:00, 14:00, 16:00
- **Total**: 7 posts/day, ~49/week
- **Backlog note:** posts already scheduled before Sep 13, 2026 under the old 2/day IG+FB rule were left as-is (Postiz can't recover an existing post's image to safely reshuffle it — see the known limitation below) — the 1/day rule applies only to newly-scheduled posts from that date forward. Check the live queue before assuming any given day is already at 1/day.

### Platform settings
- IG: `{"post_type":"post"}`
- FB: `{"post_type":"post","url":"<product_url>"}`
- PIN: `{"board":"<board_id>","link":"<product_url>","title":"<pin_title>"}`
- TikTok (when active): `{"privacy_level":"PUBLIC_TO_EVERYONE","duet":true,"stitch":true,"comment":true,"autoAddMusic":"no","brand_content_toggle":false,"brand_organic_toggle":false,"content_posting_method":"DIRECT_POST"}`

### Pinterest board IDs
- Shoulder/Arm: `1122663082051843209`
- Anklet/Barefoot: `1122663082051443454`
- Back/Backdrop: `1122663082051406999`
- Head/Forehead: `1122663082051515031`
- Belly/Waist: `1122663082051406606`
- Body/Bracelet: `1122663082051403313`
- Choker/Necklace: `1122663082051417775`
- Rings: `1122663082052035923`

### New product rule — REVISED Jul 2026, supersedes the old "3-day solo priority window"
**Never cluster the same product together — always mix products within the same day.** User feedback (verbatim): "I feel like my viewers are getting annoyed by seeing the same product several times a day like it's gotta be mixed up... I'm not asking you to change the amount of posting per day, I'm not asking you to change the platform rules. The only thing I'm telling you is the mix and match all the products."
- IG + FB: now 1 post/day each (see Daily volume above) — **never schedule the same product on consecutive days**, since there's only one slot to work with.
- When adding a new product's launch posts, interleave with 2-3 other real catalog products (pull their actual images from `products.json`) across the new days so the rotation reads as a mix, not a dedicated block for the new item.
- Pinterest: spread a new product's pins across multiple different days (2-3/day) mixed with other products' pins that same day — never dump all of a product's pins into one single day/burst.
- **Known limitation:** Postiz's public API (`posts:list`) does not return the media/images attached to an already-scheduled post — only `id`, `content`, `publishDate`, `state`, `integration`. There is no "get single post" or "update date" endpoint, only create/delete. This means the *already-scheduled* backlog cannot be safely reshuffled after the fact (no way to recover what image a past post used without guessing). Apply the mixing rule going forward on every new addition instead of retroactively — don't attempt a full historical reshuffle without flagging this constraint to the user first.

### Rotation
- IG + FB: 2 different product images per day, rotating through full catalogue (~17+ products, full cycle every ~10 days)
- Pinterest: cycle through ALL products and all their images across correct boards
- Use `itertools.cycle()` over flattened product post list

### Schedule horizon
- Build **3 weeks at a time** — never schedule more than 3 weeks out
- When rebuilding: `postiz posts:list --startDate ... --endDate ...` → parse `"id"` fields from JSON → delete all → rebuild fresh

### Caption rule — NO "Handmade in Portugal"
Never include "Handmade in Portugal" or "Made in Portugal" or "🇵🇹" in any social media caption (IG, FB, Pinterest). Ever.

### Caption tone & tags rule (confirmed Aug 30, 2026)
- Basic, plain language. Just call the product what it is — no flowery copy.
- **NEVER** use AI-slop phrasing — "quiet confidence," "effortless elegance," "elevate your look," or any similar generic-influencer-voice filler. Banned outright.
- Use a few tags/hashtags per post — not a wall of them. Keep it light.

### Pinterest — never repeat images in the same campaign
Never schedule the same image more than once within a campaign window. If there aren't enough unique images to fill 15 pins/day, post fewer — one pin per unique image only. Never pad with repeats. User rule: "if i say to post 15 per day and you don't have enough, instead of reposting, post 14."

### NEVER duplicate the same post on the same platform — HARD RULE (confirmed Jul 2026)
The same caption/image must never be scheduled more than once on the *same* platform in the near term. Cross-posting identical content to IG + FB + Pinterest at the same time is fine (that's normal). Reposting the *same* content again on the *same* platform is only acceptable after a multi-month gap — never within the same rotation cycle.
- Found and cleaned up 352 excess duplicate posts (348 Pinterest, 4 Facebook) on Jul 12, 2026 — caused by a rotation script that cycled back to the same caption/image every ~4–16 days, well short of "a few months."
- **Jul 13, 2026 recurrence:** the Jul 12 cleanup only scanned `postiz posts:list` from Jul 12 onward — never checked anything before that date. Turned out Jun 24–Jul 11 had 55 more duplicate groups (some repeated up to 19 times) that had been sitting there the whole time, and the ongoing rotation kept colliding with that untouched backlog as it extended forward. **Always scan the FULL schedule range (query from the earliest date Postiz has, not just "from today" or "from the last known cleanup date") before concluding it's clean.** A partial-range check will look clean while a backlog sits just outside the window.
- Of any duplicates found, split by `state`: `QUEUE` ones are safe to delete immediately (haven't gone out yet, zero risk). `PUBLISHED` ones already went out live on the actual platform — deleting via Postiz only clears Postiz's own record, it does NOT retroactively un-publish a live post, and this has NOT been tested to confirm what it actually does on the platform side. Never bulk-delete published duplicates without asking the user first. **User decision (Jul 13, 2026): leave past/already-published duplicates alone — only fix things going forward.**
- Before scheduling anything new, or when rebuilding a rotation, check for exact-content duplicates per platform (group by `(integration, content)`, flag any group with count > 1) across the *entire* schedule, and refuse to create a post that already exists on that platform.
- User rule, verbatim: "obviously the same post will go on insta and pinterest and facebook but never duplicate the same posts on the same platform... we can maybe in a few months do some reposts but never right away." Follow-up: "only going forward. the past is ok."

### Video posts — no cover image on IG/FB, but Pinterest REQUIRES one
When scheduling a video on Instagram or Facebook, post the video URL alone as media — no cover image, no thumbnail paired with it: `-m "video_url"` only.
**Pinterest is the exception** — its API rejects a video-only pin with `"If posting a video you have to also include a cover image as second media"`. For Pinterest video pins, always pass a cover image as the second media item: `-m "video_url,cover_image_url"`.

### Video audio — always mute unless told otherwise (confirmed Aug 12, 2026)
Any video posted to social (IG, FB, Pinterest, TikTok) must have its audio track muted by default before scheduling — strip/mute the audio (e.g. `ffmpeg -i input.mp4 -an ...` or equivalent) prior to upload. Only post with sound if the user explicitly asks for audio on for that batch/video.

### API rate limiting — CRITICAL
- Always add `time.sleep(0.5)` between every `postiz posts:create` call
- After bulk deletes (100+ posts), wait 2–3 minutes before starting new creates
- 429 ThrottlerException = too many requests too fast; increase sleep to 1s if it persists

### When user says "schedule" — do it immediately
- No confirmation questions, no date checks with the user
- Fill the **next available date slot** in the existing sequence
- If asked to schedule a new product and schedule is empty/fresh: start from tomorrow
- If schedule already has posts: append after the last scheduled date

### Script location
- Schedule script: scratchpad `new_schedule.py` (rebuild each session from the product catalogue below)
- Postiz API key: in `.env.local` as `POSTIZ_API_KEY`

### Automated duplicate check — ALWAYS run this, don't rely on memory of the rules
The no-repeat rules above have been violated multiple times (Jul 12, Jul 13, and again Jul 22/23 — a run of 5-6 consecutive same-product posts slipped through on IG+FB out to Aug 25, undetected until the user found it live). Relying on a session correctly re-implementing the rule from scratch is not reliable enough.
- `scripts/check-social-duplicates.mjs` — scans the **full** upcoming Postiz queue (60 days out, not just the next few days) for same-product-in-a-row posts on IG/FB and repeated content on Pinterest. Run it with `POSTIZ_API_KEY=... node scripts/check-social-duplicates.mjs` after scheduling ANY new batch, before telling the user it's done. Exits non-zero if anything is found.
- `.github/workflows/social-duplicate-check.yml` — runs this script daily (06:00 UTC) and opens a GitHub issue if violations are found, so this is caught automatically even if no one runs it manually.
- If the checker finds violations: delete the repeat posts (state=QUEUE only, never touch PUBLISHED — see the hard rule above) and replace with different products, picked to avoid anything used within ~3 days of the fix window on that platform.

## Admin Notification Emails — confirmed Sep 10, 2026
All internal/owner notification emails (new order, new newsletter subscriber, new contact form message, new review awaiting approval) must send `to: "info@bodystrands.com"` — NOT the personal `storenavaria@gmail.com` address. Fixed across: `app/(site)/api/webhooks/stripe/route.ts` (owner order notification), `app/(site)/api/newsletter/route.ts`, `app/(site)/api/contact/route.ts`, `app/(site)/api/reviews/submit/route.ts`. (`lib/github.ts`'s `storenavaria@gmail.com` fallback is the git committer identity for admin-panel commits, unrelated — leave that one alone.)

## Cloudflare Billing Alert — confirmed Sep 9, 2026
User wants to be proactively alerted (not just told if they ask) as soon as Cloudflare Workers Paid usage-based overage reaches $10/month (total bill approaching ~$15 for that cycle: $5 base + $10 overage). Verbatim: "I do not want surprises." Check current Cloudflare usage against this threshold whenever working in this project during/after the Cloudflare migration, and flag it unprompted if crossed. Also recommend the user set up Cloudflare's own native dashboard billing/usage alert for this same threshold — that's the only truly durable mechanism, since Claude session-based reminders (cron) are session-scoped and expire after 7 days.
