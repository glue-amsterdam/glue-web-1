import { createAdminClient } from "@/utils/supabase/adminClient";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await createAdminClient();
    const { data, error } = await admin
      .from("visitor_areas")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ areas: data ?? [] });
  } catch (err) {
    console.error("GET /api/visitor-areas:", err);
    return NextResponse.json(
      { error: "Failed to fetch work areas" },
      { status: 500 }
    );
  }
}
