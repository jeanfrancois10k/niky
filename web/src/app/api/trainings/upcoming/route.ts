import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { queryD1 } from "@/lib/d1";
import type { Training } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "edge";
export const revalidate = 0;

export async function GET() {
  try {
    // 1. Try D1 first
    try {
      const list = await queryD1<Training>(
        "SELECT * FROM trainings WHERE is_active = 1 ORDER BY date_start ASC LIMIT 1"
      );
      if (list && list.length > 0) {
        return NextResponse.json({ data: list[0] });
      }
    } catch {}

    // 2. Try Supabase fallback
    try {
      const { data, error } = await supabase
        .from("trainings")
        .select("*")
        .eq("is_active", true)
        .order("date_start", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return NextResponse.json({ data });
      }
    } catch {}

    return NextResponse.json({ data: null });
  } catch (err) {
    console.warn("API upcoming training notice:", err);
    return NextResponse.json({ data: null }, { status: 200 });
  }
}
