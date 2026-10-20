import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { products } from "@/lib/products";

const resend = new Resend(process.env.RESEND_API_KEY);

// Owner notification only — never trust client-supplied product name/price, always
// look up the real product server-side by id. Fire-and-forget from the client (see
// ProductCard/ProductPageClient), so failures here are silent and never affect checkout.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { productId?: string; variant?: string } | null;
  const productId = body?.productId;
  if (typeof productId !== "string") {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const product = products.find((p) => p.id === productId);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const variant      = typeof body?.variant === "string" ? body.variant : undefined;
  const productUrl   = `https://www.bodystrands.com/shop/${product.id}`;
  const productImage = product.images?.[0] ? `https://www.bodystrands.com${product.images[0]}` : null;

  try {
    await resend.emails.send({
      from:    "Bodystrands <info@bodystrands.com>",
      to:      "info@bodystrands.com",
      subject: `🛍️ Added to cart: ${product.name}`,
      html: `
        <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;color:#2C2220;">
          <h2 style="font-weight:300;letter-spacing:0.05em;border-bottom:1px solid #E8B4A8;padding-bottom:12px;">
            🛍️ Added to Cart
          </h2>
          ${productImage ? `
          <div style="text-align:center;margin:16px 0;">
            <img src="${productImage}" alt="${product.name}" width="160" height="160" style="width:160px;height:160px;object-fit:cover;border:1px solid #E8B4A8;" />
          </div>
          ` : ""}
          <p style="font-size:15px;text-align:center;margin:0 0 4px;">${product.name}</p>
          ${variant ? `<p style="font-size:12px;color:#8C7B6E;text-align:center;margin:0 0 4px;">${variant}</p>` : ""}
          <p style="font-size:13px;color:#8C7B6E;text-align:center;margin:0 0 20px;">€${product.price.toFixed(2)}</p>
          <p style="text-align:center;">
            <a href="${productUrl}" style="display:inline-block;background:#2C2220;color:#FDF9F7;padding:10px 24px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;">View Product</a>
          </p>
        </div>
      `,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("cart-add email failed:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
