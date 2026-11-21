import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { queryD1 } from "@/lib/d1";

export const dynamic = "force-dynamic";
export const runtime = "edge";

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
  notes?: string;
  created_at: string;
}

interface OrderItem {
  type?: string;
  product_id?: string;
  product_name?: string;
  payment_method?: string;
}

export async function GET() {
  try {
    const list: ParticipantRecord[] = [];

    // 1. Try D1 training_registrations table
    try {
      const regD1 = await queryD1<ParticipantRecord>(
        "SELECT * FROM training_registrations ORDER BY created_at DESC"
      );
      if (regD1 && regD1.length > 0) {
        list.push(...regD1);
      }
    } catch {}

    // 2. Try Supabase training_registrations
    try {
      const { data, error } = await supabaseAdmin
        .from("training_registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        for (const item of data) {
          if (!list.some((existing) => existing.id === item.id)) {
            list.push(item as ParticipantRecord);
          }
        }
      }
    } catch {}

    // 3. Fetch from D1 orders table
    try {
      const d1Orders = await queryD1<any>("SELECT * FROM orders ORDER BY created_at DESC");
      if (d1Orders && d1Orders.length > 0) {
        for (const o of d1Orders) {
          let items: OrderItem[] = [];
          try {
            items = typeof o.items === "string" ? JSON.parse(o.items) : o.items || [];
          } catch {}

          const isTrainingOrder =
            o.notes === "INSCRIPTION_FORMATION" ||
            (typeof o.notes === "string" && o.notes.includes("NAF-")) ||
            items.some((it) => it.type === "training");

          if (isTrainingOrder && !list.some((existing) => existing.id === o.id)) {
            const trainingItem = items.find((it) => it.type === "training") || items[0] || {};
            list.push({
              id: o.id,
              training_id: trainingItem.product_id || "",
              training_title: trainingItem.product_name || "Formation Professionnelle NAF",
              customer_name: o.customer_name,
              customer_email: o.customer_email,
              customer_phone: o.customer_phone,
              city: o.city,
              amount_paid: Number(o.total) || 0,
              payment_method: trainingItem.payment_method || "Sur place",
              status: o.status || "confirmed",
              notes: o.notes,
              created_at: o.created_at,
            });
          }
        }
      }
    } catch {}

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

    try {
      await queryD1("DELETE FROM training_registrations WHERE id = ?", [id]);
    } catch {}

    try {
      await queryD1("DELETE FROM orders WHERE id = ?", [id]);
    } catch {}

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
