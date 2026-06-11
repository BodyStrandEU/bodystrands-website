@AGENTS.md

# Bodystrands — Project Rules & Context

## Brand
- Site: bodystrands.com — handmade body jewelry, made in Portugal by El & Gio
- Brand name is ONE word: **Bodystrands** (never "Body Strands")
- Fonts: Cormorant Garamond (headings) + Josefin Sans (body) — **Inter is FORBIDDEN**
- Colors: blush `#E8B4A8`, gold `#A0622A`, warm dark `#2C2220`, cream `#FDF9F7`, warm gray `#8C7B6E`

## Hard Rules
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
- Hover-to-play video on shop card → gold video if Gold selected, silver video if Silver selected
- **Video is always inserted as the 2nd item in the product detail gallery** (position index 1)
- Image order in gallery follows exactly the folder order (left to right)

## Gallery & Swipe Rules (ALWAYS apply to every product)
- ProductGallery always supports touch swipe on the main image (left/right to navigate)
- Dot indicators shown on mobile at bottom of main image
- Arrow buttons shown on desktop
- Video thumbnail in strip shows a dark background with ▶ play icon
- Video autoplays (muted, loop) when it becomes the active item

## Video Rules
- Gold/ has video AND Silver/ has video → use `variantVideos: { "Gold Tone": "...", "Silver Tone": "..." }`
- Only one video found → apply it to both variants
- Accepted formats: .mp4 only (convert .mov with: `avconvert -s input.mov -o output.mp4 -p PresetMediumQuality --replace`)
- Video goes in the variant folder (Gold/ or Silver/) if variant-specific, or root if shared

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

## Master Listing Procedure (apply to every new product)
1. Read product folder structure (Gold/, Silver/, Apply to Both Variations/, hero folders)
2. Map images to variantImages: Gold first, then Silver, "Apply to Both" appended to BOTH variants
3. Convert any .mov videos to .mp4
4. Video goes at variantVideos (or root `video` if single)
5. `images` field = [main hero image] (shop card thumbnail)
6. Insert video as 2nd item automatically in gallery (buildMedia handles this)
7. ProductGallery + swipe is always present — no extra setup needed per product
8. activeCategories auto-updates navbar/homepage tiles when product is added

## Categories Rule
- **Only show categories that have photos/products ready**
- activeCategories is derived automatically from products array — never hardcode
- 9 defined categories: Back Chains, Body Chains, Shoulder Chains, Anklets, Eyeglasses Chains, Bracelets, Bikini Clip Chains, Belly Chains, Necklaces

## Admin Panel
- URL: bodystrands.com/admin (password protected)
- Every save commits directly to GitHub → Vercel auto-deploys in ~1 min
- Image uploads go directly to `public/images/products/` via GitHub API
- Drag-to-reorder images in the product editor

## Key Files
- `data/products.json` — single source of truth for all product data
- `lib/products.ts` — imports products.json, exports Product type + activeCategories
- `app/(site)/shop/[id]/page.tsx` — product detail page
- `components/ProductCard.tsx` — shop grid card (hover video + variant swatch)
- `components/ProductGallery.tsx` — detail page gallery (swipe, video at pos 2, thumbnails)
- `components/Navbar.tsx` — scroll-aware navbar with Shop dropdown
- `app/(site)/page.tsx` — homepage with category tiles grid
- `public/images/products/` — all product images served from here
- `proxy.ts` — Next.js 16 middleware (NOT middleware.ts — that's a breaking change in v16)

## Tech Stack
- Next.js 16 (App Router) — params and searchParams are Promises, must be awaited
- **Next.js 16 uses `proxy.ts` for middleware, NOT `middleware.ts`** — this is a breaking change
- Tailwind CSS v4 — uses `@import "tailwindcss"` and `@theme inline {}` syntax
- TypeScript strict
- Deployed on Vercel via GitHub (BodyStrandEU/bodystrands-website)
- Stripe checkout in `/api/checkout` — secret key in `.env.local` only, never commit
