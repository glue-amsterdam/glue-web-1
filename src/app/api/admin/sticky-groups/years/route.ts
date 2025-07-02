import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");

  if (!adminToken) {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 403 }
    );
  }
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
