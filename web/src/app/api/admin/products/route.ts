import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { queryD1 } from "@/lib/d1";
import { MOCK_PRODUCTS } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "edge";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let list: any[] = [];
    try {
      list = await queryD1("SELECT * FROM products ORDER BY created_at DESC");
    } catch {
      // D1 query error
    }

    if (!list || list.length === 0) {
      try {
        const { data } = await supabaseAdmin
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });
        if (data && data.length > 0) list = data;
      } catch {}
    }

    return NextResponse.json({ success: true, data: list || [] });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, ...productData } = body;
    const productId = id && !String(id).startsWith("temp-") ? id : `prod-${Date.now()}`;

    // Normalize images to string for SQLite
    const imagesStr = Array.isArray(productData.images)
      ? JSON.stringify(productData.images)
      : String(productData.images || "[]");

    try {
      await queryD1(
        `INSERT OR REPLACE INTO products (id, name, slug, description, short_desc, price, stock, unit, category, images, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          productId,
          productData.name || "",
          productData.slug || "",
          productData.description || "",
          productData.short_desc || "",
          Number(productData.price) || 0,
          Number(productData.stock) || 0,
          productData.unit || "kg",
          productData.category || "Bases Lavantes",
          imagesStr,
          productData.is_active !== false ? 1 : 0,
        ]
      );
    } catch (d1Err) {
      console.warn("D1 write error:", d1Err);
    }

    // Also attempt Supabase update if reachable
    try {
      if (id && !String(id).startsWith("temp-")) {
        await supabaseAdmin.from("products").update(productData).eq("id", id);
      } else {
        await supabaseAdmin.from("products").insert([{ ...productData, id: productId }]);
      }
    } catch {}

    return NextResponse.json({ success: true, data: { ...productData, id: productId } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID requis" }, { status: 400 });
    }

    try {
      await queryD1("DELETE FROM products WHERE id = ?", [id]);
    } catch (d1Err) {
      console.warn("D1 delete error:", d1Err);
    }

    try {
      await supabaseAdmin.from("products").delete().eq("id", id);
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
