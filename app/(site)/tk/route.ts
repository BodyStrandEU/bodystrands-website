export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { shortLink } from "@/lib/shortlink";

// Shorter alias for /tiktok — counted under the same "tiktok" slug.
export function GET(request: NextRequest) {
  return shortLink(request, "tiktok");
}
