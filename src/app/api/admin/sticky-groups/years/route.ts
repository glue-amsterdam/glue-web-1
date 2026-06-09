import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin/require-admin-token";

export async function GET() {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { data, error } = await auth.supabase
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
