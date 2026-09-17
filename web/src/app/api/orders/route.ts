import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

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
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id,name,price,stock,is_active")
      .in("id", productIds);

    if (productsError) {
      console.error("Products lookup failed:", productsError);
      return NextResponse.json({ error: "Unable to verify cart" }, { status: 500 });
    }

    const productById = new Map((products ?? []).map((product) => [product.id, product]));

    const orderItems = normalizedItems.map((item) => {
      const product = productById.get(item.id);
      if (!product || !product.is_active) {
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

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
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
      })
      .select("id,total,status,payment_method")
      .single();

    if (orderError) {
      console.error("Order insert failed:", orderError);
      return NextResponse.json({ error: "Unable to create order" }, { status: 500 });
    }

    return NextResponse.json({ success: true, order });
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
