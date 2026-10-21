// Minimal, hand-written augmentation of the CloudflareEnv global interface declared by
// @opennextjs/cloudflare — adds only the WISHLIST_LIKES KV binding (see wrangler.jsonc).
//
// Deliberately NOT using `npm run cf-typegen`'s full generated output here: that file pulls
// in workerd's global runtime types project-wide, which redefines Response.json() to return
// `unknown` instead of `any` — breaking type inference in several pre-existing routes/pages
// that destructure a parsed JSON body without an explicit type assertion. Fixing those is out
// of scope for adding one KV binding, so this file adds just the one property we need instead.
declare global {
  interface CloudflareEnv {
    WISHLIST_LIKES?: KVNamespace;
  }
}

export {};
