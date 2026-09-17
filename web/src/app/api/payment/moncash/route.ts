import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createMonCashPayment } from "@/lib/moncash";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount, phone, customerName, description } = body;

    if (!orderId || !amount || !phone) {
      return NextResponse.json({ error: "Champs requis manquants (orderId, amount, phone)" }, { status: 400 });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
    }

    // Call MonCash Business Gateway Helper
    const moncashResult = await createMonCashPayment({
      orderId: String(orderId),
      amount: numericAmount,
      phone: String(phone),
      customerName: String(customerName || "Client NCP"),
      description: description || "Paiement Matières Premières / Formation NCP",
    });

    // Save/Update in DB payments table
    try {
      await supabaseAdmin.from("payments").insert({
        order_id: orderId,
        amount: numericAmount,
        method: "moncash",
        reference: moncashResult.reference,
        transaction_id: moncashResult.paymentToken || null,
        status: "pending",
        callback_data: { phone, customerName, description },
      });
    } catch (dbErr) {
      console.warn("Payment table insert notice (optional):", dbErr);
    }

    return NextResponse.json({
      ...moncashResult,
    });
  } catch (err: unknown) {
    console.error("MonCash POST route error:", err);
    return NextResponse.json({ error: "Erreur interne du serveur MonCash" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ error: "Reference requise" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("payments")
    .select("*")
    .eq("reference", reference)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Paiement non trouvé" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      status: data.status,
      reference: data.reference,
      amount: data.amount,
      transaction_id: data.transaction_id,
    },
  });
}
