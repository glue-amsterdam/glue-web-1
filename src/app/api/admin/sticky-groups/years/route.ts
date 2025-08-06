import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const adminClient = await createClient();
    const { data, error } = await adminClient
      .from("sticky_groups")
      .select("year")
      .order("year", { ascending: true });
    if (error) throw error;
    const years = data ? data.map((g: { year: number }) => g.year) : [];
    return NextResponse.json(years);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
