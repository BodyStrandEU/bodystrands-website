import { NextRequest, NextResponse } from "next/server";
import { uploadImage, deleteFile, getFile } from "@/lib/github";
import { isValidToken, COOKIE_NAME } from "@/lib/auth";
import { optimizeImageBuffer } from "@/lib/image-optimize";

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return isValidToken(token);
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const optimized = await optimizeImageBuffer(Buffer.from(arrayBuffer), filename);
    const base64 = optimized.toString("base64");

    const url = await uploadImage(filename, base64);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json() as { path: string };
    const { path } = body;
    if (!path) {
      return NextResponse.json({ error: "No path provided" }, { status: 400 });
    }

    // Convert URL path /images/products/foo.jpg → GitHub path public/images/products/foo.jpg
    const githubPath = path.startsWith("/") ? `public${path}` : path;
    const { sha } = await getFile(githubPath);
    await deleteFile(githubPath, sha, `Delete product image: ${path}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
