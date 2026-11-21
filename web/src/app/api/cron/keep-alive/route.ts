import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { count, error } = await supabaseAdmin
      .from("trainings")
      .select("id", { count: "exact", head: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Supabase keep-alive successful! Inactivity timer reset.",
      trainingsCount: count,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Keep-alive failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
