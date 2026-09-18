import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("trainings")
      .select("*")
      .eq("is_active", true)
      .order("date_start", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.warn("API upcoming training notice:", err);
    return NextResponse.json({ data: null }, { status: 200 });
  }
}
