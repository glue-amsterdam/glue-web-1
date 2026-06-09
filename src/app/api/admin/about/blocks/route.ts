import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { data, error } = await auth.supabase
      .from("about_blocks")
      .select("*")
      .order("display_order");

    if (error) {
      throw error;
    }

    return NextResponse.json({ blocks: data ?? [] });
  } catch (error) {
    console.error("Error in GET /api/admin/about/blocks:", error);
    return NextResponse.json(
      { error: "Failed to fetch about blocks" },
      { status: 500 }
    );
  }
}
