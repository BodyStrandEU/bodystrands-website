export type VideoSource = { src: string; type: string };

const CF_PATTERN =
  /^(https:\/\/customer-[^/]+\.cloudflarestream\.com\/[a-f0-9]+)\/downloads\/default\.mp4$/;

/**
 * Converts a raw video URL into the best sources for the current device.
 *
 * Cloudflare Stream: HLS first (adaptive bitrate, loads in 2-second chunks — the
 * only format iOS Safari actually preloads on cellular), MP4 as fallback.
 * Local files: single source with correct MIME type.
 */
export function getVideoSources(src: string): VideoSource[] {
  if (!src) return [];

  const cfMatch = src.match(CF_PATTERN);
  if (cfMatch) {
    return [
      { src: `${cfMatch[1]}/manifest/video.m3u8`, type: "application/x-mpegURL" },
      { src,                                       type: "video/mp4" },
    ];
  }

  if (src.toLowerCase().endsWith(".mov")) {
    return [{ src, type: "video/quicktime" }];
  }

  return [{ src, type: "video/mp4" }];
}
