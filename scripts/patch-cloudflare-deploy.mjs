// Patches @opennextjs/cloudflare's deploy command to skip R2 cache population unless
// SKIP_CACHE_POPULATE is unset. Without this, `wrangler deploy`'s cache-population step
// gets stuck in an infinite retry loop on this project (root cause unconfirmed upstream).
//
// The patch lives in node_modules, which npm/CI wipe and recreate on every install — so
// this script re-applies it idempotently. Wired into the `deploy` script and into CI
// (see .github/workflows/cloudflare-deploy.yml) so it never has to be reapplied by hand.
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "node_modules/@opennextjs/cloudflare/dist/cli/commands/deploy.js";
const ORIGINAL = `    await populateCache(buildOpts, config, wranglerConfig, {`;
const PATCHED = `    if (!process.env.SKIP_CACHE_POPULATE) {
        await populateCache(buildOpts, config, wranglerConfig, {`;

const content = readFileSync(FILE, "utf-8");

if (content.includes("SKIP_CACHE_POPULATE")) {
  console.log("patch-cloudflare-deploy: already patched, skipping.");
  process.exit(0);
}

if (!content.includes(ORIGINAL)) {
  console.error(
    "patch-cloudflare-deploy: expected code not found — @opennextjs/cloudflare's deploy.js " +
    "has likely changed shape after a dependency update. Re-check this patch by hand."
  );
  process.exit(1);
}

const patched = content
  .replace(ORIGINAL, PATCHED)
  .replace(
    `    }, envVars);\n    const deploymentMapping`,
    `    }, envVars);
    } else {
        console.log("Skipping cache population (SKIP_CACHE_POPULATE set) — ISR cache will populate lazily on real traffic instead.");
    }
    const deploymentMapping`
  );

writeFileSync(FILE, patched);
console.log("patch-cloudflare-deploy: applied.");
