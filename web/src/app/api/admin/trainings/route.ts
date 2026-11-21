import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { queryD1 } from "@/lib/d1";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET() {
  try {
    // 1. Try D1 first
    try {
      const list = await queryD1("SELECT * FROM trainings ORDER BY date_start ASC");
      if (list && list.length > 0) {
        return NextResponse.json({ success: true, data: list });
      }
    } catch {}

    // 2. Try Supabase fallback
    try {
      const { data, error } = await supabaseAdmin
        .from("trainings")
        .select("*")
        .order("date_start", { ascending: true });

      if (!error && data) {
        return NextResponse.json({ success: true, data });
      }
    } catch {}

    return NextResponse.json({ success: true, data: [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, ...trainingData } = body;
    const trainingId = id && !String(id).startsWith("temp-") ? id : `training-${Date.now()}`;

    // Normalize objectives array to JSON string for SQLite
    const objectivesStr = Array.isArray(trainingData.objectives)
      ? JSON.stringify(trainingData.objectives)
      : String(trainingData.objectives || "[]");

    // Save to Cloudflare D1
    try {
      await queryD1(
        `INSERT OR REPLACE INTO trainings (id, title, slug, description, full_description, objectives, date_start, date_end, location, max_seats, current_seats, price, image, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          trainingId,
          trainingData.title || "",
          trainingData.slug || "",
          trainingData.description || "",
          trainingData.full_description || "",
          objectivesStr,
          trainingData.date_start || "",
          trainingData.date_end || "",
          trainingData.location || "Port-au-Prince, Haïti",
          Number(trainingData.max_seats) || 30,
          Number(trainingData.current_seats) || 0,
          Number(trainingData.price) || 0,
          trainingData.image || "",
          trainingData.is_active !== false ? 1 : 0,
        ]
      );
    } catch (d1Err) {
      console.warn("D1 training write error:", d1Err);
    }

    // Also attempt Supabase update
    try {
      if (id && !String(id).startsWith("temp-")) {
        await supabaseAdmin.from("trainings").update(trainingData).eq("id", id);
      } else {
        await supabaseAdmin.from("trainings").insert([{ ...trainingData, id: trainingId }]);
      }
    } catch {}

    return NextResponse.json({ success: true, data: { ...trainingData, id: trainingId } });
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
      return NextResponse.json({ success: false, error: "Missing training id" }, { status: 400 });
    }

    try {
      await queryD1("DELETE FROM trainings WHERE id = ?", [id]);
    } catch {}

    try {
      await supabaseAdmin.from("trainings").delete().eq("id", id);
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
