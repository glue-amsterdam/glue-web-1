import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const auth = await requireAdminToken();
    if (!auth.ok) return auth.response;

    const { data, error } = await auth.supabase
      .from("about_citizens")
      .select("year")
      .order("year", { ascending: false });

    if (error) throw error;

    const years = [...new Set(data.map((item) => item.year))];

    return NextResponse.json(years);
  } catch (error) {
    console.error("Error fetching years:", error);
    return NextResponse.json(
      { error: "Failed to fetch years" },
      { status: 500 }
    );
  }
}
