import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { queryD1 } from "@/lib/d1";

export const dynamic = "force-dynamic";
export const runtime = "edge";

// GET all orders
export async function GET() {
  try {
    // 1. Try D1 first
    try {
      const orders = await queryD1("SELECT * FROM orders ORDER BY created_at DESC");
      if (orders && orders.length > 0) {
        // Parse items JSON if needed
        const parsed = orders.map((o: any) => ({
          ...o,
          items: typeof o.items === "string" ? JSON.parse(o.items) : o.items,
        }));
        return NextResponse.json({ orders: parsed });
      }
    } catch {}

    // 2. Try Supabase fallback
    try {
      const { data: orders, error } = await supabaseAdmin
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && orders) {
        return NextResponse.json({ orders });
      }
    } catch {}

    return NextResponse.json({ orders: [] });
  } catch (err: unknown) {
    console.error("GET orders route failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH to update order status (e.g. 'confirmed', 'rejected', 'delivered', 'pending')
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing orderId or status" }, { status: 400 });
    }

    const validStatuses = ["pending", "confirmed", "rejected", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    // Update in D1
    try {
      await queryD1("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);
    } catch {}

    // Also update in Supabase
    try {
      await supabaseAdmin.from("orders").update({ status }).eq("id", orderId);
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("PATCH order status failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
