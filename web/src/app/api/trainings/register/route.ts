import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      training_id,
      training_title,
      first_name,
      last_name,
      customer_name,
      customer_email,
      customer_phone,
      whatsapp,
      date_of_birth,
      gender,
      address,
      city,
      profession,
      education_level,
      has_medical_condition,
      medical_condition_details,
      is_asthmatic,
      has_medical_treatment,
      medical_treatment_details,
      has_passport,
      passport_number,
      passport_expiry,
      national_mobility,
      international_mobility,
      id_card_photo,
      training_category,
      training_mode,
      emergency_contact_name,
      emergency_contact_relation,
      emergency_contact_phone,
      payment_type,
      payment_method,
      photo_permission,
      amount,
    } = body;

    const fullName = customer_name || `${last_name || ""} ${first_name || ""}`.trim();

    if (!training_id || !fullName || !customer_phone) {
      return NextResponse.json(
        { success: false, error: "Nom, téléphone et formation requis." },
        { status: 400 }
      );
    }

    const regNumber = `NAF-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    let inserted = false;
    let registrationData: unknown = null;

    const fullDossier = {
      registration_number: regNumber,
      training_id,
      training_title: training_title || "Formation Professionnelle NAF",
      customer_name: fullName,
      first_name: first_name || "",
      last_name: last_name || "",
      customer_email: customer_email || "",
      customer_phone,
      whatsapp: whatsapp || customer_phone,
      date_of_birth: date_of_birth || "",
      gender: gender || "Non spécifié",
      address: address || "",
      city: city || "Port-au-Prince",
      profession: profession || "",
      education_level: education_level || "",
      health: {
        has_medical_condition: !!has_medical_condition,
        medical_condition_details: medical_condition_details || "",
        is_asthmatic: !!is_asthmatic,
        has_medical_treatment: !!has_medical_treatment,
        medical_treatment_details: medical_treatment_details || "",
      },
      passport: {
        has_passport: !!has_passport,
        passport_number: passport_number || "",
        passport_expiry: passport_expiry || "",
        national_mobility: !!national_mobility,
        international_mobility: !!international_mobility,
      },
      id_card_photo: id_card_photo || null,
      training_category: training_category || "Chimie Industrielle",
      training_mode: training_mode || "Présentiel",
      emergency_contact: {
        name: emergency_contact_name || "",
        relation: emergency_contact_relation || "",
        phone: emergency_contact_phone || "",
      },
      payment_type: payment_type || "Comptant",
      payment_method: payment_method || "moncash",
      photo_permission: photo_permission !== false,
      amount_paid: Number(amount) || 0,
      status: "confirmed",
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabaseAdmin
        .from("training_registrations")
        .insert([
          {
            training_id,
            training_title: training_title || "Formation Professionnelle NAF",
            customer_name: fullName,
            customer_email: customer_email || "",
            customer_phone,
            city: city || "Port-au-Prince",
            payment_method: payment_method || "sur_place",
            amount_paid: Number(amount) || 0,
            status: "confirmed",
            notes: JSON.stringify(fullDossier),
          },
        ])
        .select()
        .single();

      if (!error && data) {
        inserted = true;
        registrationData = { ...data, dossier: fullDossier };
      }
    } catch {
      // Fallback to orders
    }

    if (!inserted) {
      const { data, error } = await supabaseAdmin
        .from("orders")
        .insert([
          {
            customer_name: fullName,
            customer_email: customer_email || "contact@ncp.ht",
            customer_phone,
            delivery_address: `Centre NAF - ${address || "Pétion-Ville"}`,
            city: city || "Port-au-Prince",
            notes: JSON.stringify(fullDossier),
            items: [
              {
                type: "training",
                product_id: training_id,
                product_name: training_title || "Formation Professionnelle NAF",
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
      registrationData = { ...data, dossier: fullDossier };
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
