// Tell Bing (and IndexNow partners) about new/changed blog posts and products after a deploy.
// ChatGPT search leans on Bing's index, so this gets new pages seen sooner.
// Only submits what changed in the last commit (IndexNow asks for changed URLs, not the whole site).
// Usage: node scripts/indexnow.mjs   (needs git history of 2 commits; always exits 0)
import { execSync } from "node:child_process";

const HOST = "www.bodystrands.com";
const KEY = "70861e57a6fdc614f058171516bd7743";
const read = (ref, file) => {
  try { return JSON.parse(execSync(`git show ${ref}:${file}`, { encoding: "utf8", maxBuffer: 64e6 })); } catch { return null; }
};

const urls = new Set();
const diff = (file, idOf, base) => {
  const before = read("HEAD~1", file) ?? [];
  const after = read("HEAD", file) ?? [];
  const old = new Map(before.map((x) => [idOf(x), JSON.stringify(x)]));
  for (const x of after) if (old.get(idOf(x)) !== JSON.stringify(x)) urls.add(base + idOf(x));
};
diff("data/blog-posts.json", (x) => x.slug, `https://${HOST}/blog/`);
diff("data/products.json", (x) => x.id, `https://${HOST}/shop/`);

if (!urls.size) { console.log("IndexNow: nothing new or changed"); process.exit(0); }
const list = [...urls].slice(0, 500);
try {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: list }),
  });
  console.log(`IndexNow: submitted ${list.length} URL(s), HTTP ${res.status}`);
} catch (e) { console.log("IndexNow failed (ignored):", e.message); }
