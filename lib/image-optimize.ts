// Generous ceiling — no product image on the site is ever rendered anywhere near this large,
// even in a lightbox/zoom view, so shrinking down to this only removes pixels no one can see.
const MAX_DIMENSION = 2400;
// Visually lossless for photographic jewelry detail (chain links, pearls, clasps).
const JPEG_QUALITY = 92;

const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg"]);

/**
 * Resizes oversized product photos down to a sane ceiling and re-encodes them at a
 * quality setting with no visible difference from the source. PNG re-encoding is fully
 * lossless (same pixels, better compression). Never returns a file larger than the input.
 * Anything that isn't a jpg/png (video, etc.) passes through untouched.
 */
export async function optimizeImageBuffer(input: Buffer, filename: string): Promise<Buffer> {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext || !IMAGE_EXTENSIONS.has(ext)) {
    return input;
  }

  // Loaded lazily (not as a top-level import) because sharp is a native module that
  // doesn't exist on Cloudflare Workers — a static import crashes the whole route at
  // load time, even on requests that never touch this function. Loading it inside the
  // call lets Workers catch the failure here and ship the original file untouched,
  // while Node/Vercel still loads it fine and optimizes as before.
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    return input;
  }

  let pipeline = sharp(input, { failOn: "none" }).rotate(); // normalize EXIF orientation
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

  const output = ext === "png"
    ? await pipeline.png({ compressionLevel: 9, effort: 10 }).toBuffer()
    : await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();

  // Safety net: never ship a "optimized" file that's actually bigger than the original.
  return output.length < input.length ? output : input;
}
