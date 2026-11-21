import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendTrainingConfirmationEmail } from "@/lib/email/training-confirmation";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { registration_id, moncash_reference } = body;

    if (!registration_id) {
      return NextResponse.json(
        { success: false, error: "registration_id requis." },
        { status: 400 }
      );
    }

    // 1. Fetch the registration from DB
    let registration: Record<string, unknown> | null = null;

    const { data: regData, error: regError } = await supabaseAdmin
      .from("training_registrations")
      .select("*")
      .eq("id", registration_id)
      .single();

    if (!regError && regData) {
      registration = regData as Record<string, unknown>;
    } else {
      // Fallback: try orders table
      const { data: orderData, error: orderError } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("id", registration_id)
        .single();

      if (orderError || !orderData) {
        return NextResponse.json(
          { success: false, error: "Dossier introuvable." },
          { status: 404 }
        );
      }
      registration = orderData as Record<string, unknown>;
    }

    // 2. Update status to confirmed
    try {
      await supabaseAdmin
        .from("training_registrations")
        .update({
          status: "confirmed",
          notes: JSON.stringify({
            ...(registration.notes ? JSON.parse(registration.notes as string) : {}),
            moncash_reference,
            confirmed_at: new Date().toISOString(),
          }),
        })
        .eq("id", registration_id);
    } catch {
      // Maybe it's in orders table — try there too
      try {
        await supabaseAdmin
          .from("orders")
          .update({ status: "confirmed" })
          .eq("id", registration_id);
      } catch { /* non-blocking */ }
    }

    // 3. Parse dossier from notes
    let dossier: Record<string, unknown> = {};
    try {
      const notes = registration.notes as string;
      if (notes) dossier = JSON.parse(notes);
    } catch { /* ignore */ }

    const registrationNumber =
      (dossier.registration_number as string) ||
      (registration.registration_number as string) ||
      `NAF-${Date.now().toString(36).toUpperCase()}`;

    const studentEmail =
      (registration.customer_email as string) ||
      (dossier.customer_email as string) ||
      "";

    const studentName =
      (registration.customer_name as string) ||
      (dossier.customer_name as string) ||
      "Étudiant NAF";

    const trainingTitle =
      (registration.training_title as string) ||
      (dossier.training_title as string) ||
      "Formation NAF";

    const trainingMode = (dossier.training_mode as string) || "Présentiel";
    const trainingLocation = "68b Route De Frère Pétion-Ville, Haïti";
    const amount = Number(registration.amount_paid || dossier.amount_paid || 0);
    const paymentMethod =
      (registration.payment_method as string) ||
      (dossier.payment_method as string) ||
      "moncash";

    // 4. Send confirmation email
    const emailResult = await sendTrainingConfirmationEmail({
      studentName,
      studentEmail,
      registrationNumber,
      trainingTitle,
      trainingMode,
      trainingLocation,
      amount,
      paymentMethod,
      moncashReference: moncash_reference,
    });

    return NextResponse.json({
      success: true,
      message: "Paiement confirmé et email envoyé.",
      registration_number: registrationNumber,
      email_sent: emailResult.success,
      email_error: emailResult.error || null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    console.error("confirm-payment error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
