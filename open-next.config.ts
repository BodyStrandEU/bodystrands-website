import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";

export default defineCloudflareConfig({
	// Pages are pre-built and stored in R2. The regional cache keeps a copy at the Cloudflare
	// location nearest each visitor, so pages don't make a round trip to R2 on every visit.
	incrementalCache: withRegionalCache(r2IncrementalCache, { mode: "long-lived" }),
	// Serve already-built pages straight from the cache without starting Next.js first
	enableCacheInterception: true,
});
