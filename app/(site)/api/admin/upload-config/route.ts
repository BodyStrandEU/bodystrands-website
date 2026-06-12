import { NextRequest, NextResponse } from "next/server";
import { isValidToken, COOKIE_NAME } from "@/lib/auth";

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return !!token && isValidToken(token);
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    token: process.env.GITHUB_TOKEN ?? "",
    repo: process.env.GITHUB_REPO ?? "BodyStrandEU/bodystrands-website",
    branch: "main",
  });
}
