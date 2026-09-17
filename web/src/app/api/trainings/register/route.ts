import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      training_id,
      training_title,
      customer_name,
      customer_email,
      customer_phone,
      city,
      payment_method,
      amount,
    } = body;

    if (!training_id || !customer_name || !customer_phone) {
      return NextResponse.json(
        { success: false, error: "Nom, téléphone et formation requis." },
        { status: 400 }
      );
    }

    let inserted = false;
    let registrationData: unknown = null;

    try {
      const { data, error } = await supabaseAdmin
        .from("training_registrations")
        .insert([
          {
            training_id,
            training_title: training_title || "Formation Professionnelle",
            customer_name,
            customer_email: customer_email || "",
            customer_phone,
            city: city || "Port-au-Prince",
            payment_method: payment_method || "sur_place",
            amount_paid: Number(amount) || 0,
            status: "confirmed",
          },
        ])
        .select()
        .single();

      if (!error && data) {
        inserted = true;
        registrationData = data;
      }
    } catch {
      // Fallback to orders
    }

    if (!inserted) {
      const { data, error } = await supabaseAdmin
        .from("orders")
        .insert([
          {
            customer_name,
            customer_email: customer_email || "contact@ncp.ht",
            customer_phone,
            delivery_address: "Centre de Formation NCP",
            city: city || "Port-au-Prince",
            notes: "INSCRIPTION_FORMATION",
            items: [
              {
                type: "training",
                product_id: training_id,
                product_name: training_title || "Formation Professionnelle",
                quantity: 1,
                unit_price: Number(amount) || 0,
                payment_method: payment_method || "sur_place",
              },
            ],
            total: Number(amount) || 0,
            status: "confirmed",
          },
        ])
        .select()
        .single();

      if (error) throw error;
      registrationData = data;
    }

    try {
      const { data: training } = await supabaseAdmin
        .from("trainings")
        .select("current_seats, max_seats")
        .eq("id", training_id)
        .single();

      if (training) {
        const nextSeats = (Number(training.current_seats) || 0) + 1;
        await supabaseAdmin
          .from("trainings")
          .update({ current_seats: nextSeats })
          .eq("id", training_id);
      }
    } catch (e) {
      console.warn("Could not increment training seats:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Inscription confirmée avec succès !",
      data: registrationData,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
