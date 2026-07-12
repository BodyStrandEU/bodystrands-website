import sharp from "sharp";
import { readdirSync, statSync, readFileSync, writeFileSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../public/images/products");

// Same settings as lib/image-optimize.ts — kept in sync manually since this is a
// one-off Node script (not run through the Next.js/TS build).
const MAX_DIMENSION = 2400;
const JPEG_QUALITY = 92;
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full, files);
    } else if (IMAGE_EXTENSIONS.has(extname(entry).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

async function optimize(path) {
  const ext = extname(path).toLowerCase();
  const input = readFileSync(path);

  let pipeline = sharp(input, { failOn: "none" }).rotate();
  const metadata = await sharp(input).metadata();
  const needsResize = (metadata.width ?? 0) > MAX_DIMENSION || (metadata.height ?? 0) > MAX_DIMENSION;

  if (needsResize) {
    pipeline = pipeline.resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const output = ext === ".png"
    ? await pipeline.png({ compressionLevel: 9, effort: 10 }).toBuffer()
    : await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();

  if (output.length < input.length) {
    writeFileSync(path, output);
    return { before: input.length, after: output.length, changed: true, resized: needsResize };
  }
  return { before: input.length, after: input.length, changed: false, resized: false };
}

async function main() {
  const files = walk(ROOT);
  console.log(`Found ${files.length} images under public/images/products`);

  let totalBefore = 0;
  let totalAfter = 0;
  let changedCount = 0;
  let resizedCount = 0;

  for (const file of files) {
    const result = await optimize(file);
    totalBefore += result.before;
    totalAfter += result.after;
    if (result.changed) {
      changedCount++;
      if (result.resized) resizedCount++;
      const pct = (100 * (1 - result.after / result.before)).toFixed(0);
      console.log(`  ${result.resized ? "resized+" : ""}optimized (-${pct}%): ${file.replace(ROOT, "")}`);
    }
  }

  const savedMB = ((totalBefore - totalAfter) / 1024 / 1024).toFixed(1);
  const beforeMB = (totalBefore / 1024 / 1024).toFixed(1);
  const afterMB = (totalAfter / 1024 / 1024).toFixed(1);
  console.log(`\nDone. ${changedCount}/${files.length} files optimized (${resizedCount} were resized).`);
  console.log(`Total size: ${beforeMB}MB -> ${afterMB}MB (saved ${savedMB}MB)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
