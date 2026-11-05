export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { shortLink } from "@/lib/shortlink";

export function GET(request: NextRequest) {
  return shortLink(request, "tiktok");
}
