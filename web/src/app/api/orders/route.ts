import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { queryD1 } from "@/lib/d1";

export const dynamic = "force-dynamic";
export const runtime = "edge";

type CheckoutItem = {
  id: string;
  quantity: number;
};

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items = Array.isArray(body.items) ? (body.items as CheckoutItem[]) : [];

    const customerName = asText(body.customerName);
    const customerEmail = asText(body.customerEmail);
    const customerPhone = asText(body.customerPhone);
    const deliveryAddress = asText(body.deliveryAddress);
    const city = asText(body.city);
    const notes = asText(body.notes);
    const paymentMethod = body.paymentMethod === "moncash" ? "moncash" : "cash_on_delivery";

    if (!customerName || !customerEmail || !customerPhone || !deliveryAddress || !city) {
      return NextResponse.json({ error: "Missing customer fields" }, { status: 400 });
    }

    const normalizedItems = items
      .map((item) => ({
        id: asText(item.id),
        quantity: Number(item.quantity),
      }))
      .filter((item) => item.id && Number.isInteger(item.quantity) && item.quantity > 0);

    if (normalizedItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const productIds = Array.from(new Set(normalizedItems.map((item) => item.id)));

    // Look up products from D1 or Supabase
    let products: any[] = [];
    try {
      const placeholders = productIds.map(() => "?").join(",");
      products = await queryD1(
        `SELECT id, name, price, stock, is_active FROM products WHERE id IN (${placeholders})`,
        productIds
      );
    } catch {}

    if (!products || products.length === 0) {
      try {
        const { data } = await supabaseAdmin
          .from("products")
          .select("id,name,price,stock,is_active")
          .in("id", productIds);
        if (data) products = data;
      } catch {}
    }

    const productById = new Map((products ?? []).map((product) => [product.id, product]));

    const orderItems = normalizedItems.map((item) => {
      const product = productById.get(item.id);
      if (!product || (product.is_active !== true && product.is_active !== 1)) {
        throw new Error("INVALID_PRODUCT");
      }
      if (typeof product.stock === "number" && product.stock < item.quantity) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      return {
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: Number(product.price),
      };
    });

    const total = orderItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
    const orderId = `order-${Date.now()}`;

    // 1. Insert into D1
    try {
      await queryD1(
        `INSERT INTO orders (id, customer_name, customer_email, customer_phone, delivery_address, city, notes, items, total, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`,
        [
          orderId,
          customerName,
          customerEmail,
          customerPhone,
          deliveryAddress,
          city,
          notes || null,
          JSON.stringify(orderItems),
          total,
        ]
      );
    } catch (d1Err) {
      console.warn("D1 order insert warning:", d1Err);
    }

    // 2. Also insert into Supabase if available
    try {
      await supabaseAdmin.from("orders").insert({
        id: orderId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
        city,
        notes: notes || null,
        items: orderItems,
        total,
        status: "pending",
        payment_method: paymentMethod,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        total,
        status: "pending",
        payment_method: paymentMethod,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_PRODUCT") {
      return NextResponse.json({ error: "A product in the cart is unavailable" }, { status: 400 });
    }

    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
      return NextResponse.json({ error: "Insufficient stock for a product" }, { status: 400 });
    }

    console.error("Order route failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
