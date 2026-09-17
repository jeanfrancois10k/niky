import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference, status, transactionId } = body;

    const expectedSecret = process.env.MONCASH_WEBHOOK_SECRET;
    if (expectedSecret) {
      const providedSecret = request.headers.get("x-webhook-secret");
      if (providedSecret !== expectedSecret) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
      }
    }

    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("reference", reference)
      .single();

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Update payment status
    await supabaseAdmin
      .from("payments")
      .update({
        status: status === "success" ? "success" : "failed",
        transaction_id: transactionId || null,
        callback_data: body,
      })
      .eq("reference", reference);

    // Update order status if payment was successful
    if (status === "success") {
      await supabaseAdmin
        .from("orders")
        .update({ status: "confirmed" })
        .eq("id", payment.order_id);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
