import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export interface ParticipantRecord {
  id: string;
  training_id: string;
  training_title: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  city: string;
  amount_paid: number;
  payment_method: string;
  status: string;
  created_at: string;
}

export async function GET() {
  try {
    const list: ParticipantRecord[] = [];

    // 1. Try to fetch from training_registrations table
    try {
      const { data, error } = await supabaseAdmin
        .from("training_registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        list.push(...(data as ParticipantRecord[]));
      }
    } catch {
      // Table may not exist yet
    }

    // 2. Fetch from orders table where notes = 'INSCRIPTION_FORMATION'
    try {
      const { data: orderData } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("notes", "INSCRIPTION_FORMATION")
        .order("created_at", { ascending: false });

      if (orderData && orderData.length > 0) {
        for (const o of orderData) {
          const item = (o.items && o.items[0]) || {};
          // Check if not already in list
          if (!list.some((existing) => existing.id === o.id)) {
            list.push({
              id: o.id,
              training_id: item.product_id || "",
              training_title: item.product_name || "Formation Professionnelle",
              customer_name: o.customer_name,
              customer_email: o.customer_email,
              customer_phone: o.customer_phone,
              city: o.city,
              amount_paid: Number(o.total) || 0,
              payment_method: item.payment_method || "Sur place",
              status: o.status || "confirmed",
              created_at: o.created_at,
            });
          }
        }
      }
    } catch (e) {
      console.warn("Error fetching training orders:", e);
    }

    return NextResponse.json({ success: true, data: list });
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
      return NextResponse.json({ success: false, error: "Missing registration id" }, { status: 400 });
    }

    // Attempt delete from training_registrations then orders
    try {
      await supabaseAdmin.from("training_registrations").delete().eq("id", id);
    } catch {}

    try {
      await supabaseAdmin.from("orders").delete().eq("id", id);
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
