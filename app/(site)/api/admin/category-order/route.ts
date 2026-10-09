import { NextRequest, NextResponse } from "next/server";
import { getFile, putFile } from "@/lib/github";
import { isValidToken, COOKIE_NAME } from "@/lib/auth";

const FILE_PATH = "data/category-order.json";

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
    const order = (await request.json()) as string[];
    if (!Array.isArray(order) || order.some((c) => typeof c !== "string")) {
      return NextResponse.json({ error: "Body must be an array of category names" }, { status: 400 });
    }

    const { sha } = await getFile(FILE_PATH);
    await putFile(FILE_PATH, JSON.stringify(order, null, 2) + "\n", sha, "Update category order via admin panel");

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
