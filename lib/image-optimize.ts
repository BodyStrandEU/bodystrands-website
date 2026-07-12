import sharp from "sharp";

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
