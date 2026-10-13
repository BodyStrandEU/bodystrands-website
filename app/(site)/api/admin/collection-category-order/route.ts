import { NextRequest, NextResponse } from "next/server";
import { getFile, putFile } from "@/lib/github";
import { isValidToken, COOKIE_NAME } from "@/lib/auth";

const FILE_PATH = "data/collection-category-order.json";

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return isValidToken(token);
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content } = await getFile(FILE_PATH);
    return NextResponse.json(JSON.parse(content));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const overrides = (await request.json()) as Record<string, string[]>;
    const valid =
      overrides !== null &&
      typeof overrides === "object" &&
      !Array.isArray(overrides) &&
      Object.values(overrides).every(
        (order) => Array.isArray(order) && order.every((c) => typeof c === "string")
      );
    if (!valid) {
      return NextResponse.json({ error: "Body must be an object of page key -> category name array" }, { status: 400 });
    }

    const { sha } = await getFile(FILE_PATH);
    await putFile(FILE_PATH, JSON.stringify(overrides, null, 2) + "\n", sha, "Update collection page category order via admin panel");

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
