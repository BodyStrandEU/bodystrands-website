export type VideoSource = { src: string; type: string };

const CF_PATTERN =
  /^(https:\/\/customer-[^/]+\.cloudflarestream\.com\/[a-f0-9]+)\/downloads\/default\.mp4$/;

/**
 * Converts a raw video URL into the best sources for the current device.
 *
 * Cloudflare Stream: MP4 direct download only — full quality from the first
 * frame, no adaptive bitrate blur. HLS was removed because ABR always starts
 * at the lowest quality level which looks terrible for jewelry video.
 * Local files: single source with correct MIME type.
 */
export function getVideoSources(src: string): VideoSource[] {
  if (!src) return [];

  const cfMatch = src.match(CF_PATTERN);
  if (cfMatch) {
    return [
      { src, type: "video/mp4" },
    ];
  }

  if (src.toLowerCase().endsWith(".mov")) {
    return [{ src, type: "video/quicktime" }];
  }

  return [{ src, type: "video/mp4" }];
}
