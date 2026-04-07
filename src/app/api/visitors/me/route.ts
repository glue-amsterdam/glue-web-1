import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/adminClient";

const visitorCookieName = "visitor_token";

/**
 * Returns the current verified visitor (if any) using the HttpOnly visitor_token cookie.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(visitorCookieName)?.value;
    if (!token?.trim()) {
      return NextResponse.json({ visitor: null });
    }

    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("visitor_data")
      .select("id, full_name, email, email_verified")
      .eq("visitor_token", token)
      .maybeSingle();

    if (error) {
      console.error("GET /api/visitors/me:", error);
      return NextResponse.json({ visitor: null });
    }

    if (!data || data.email_verified !== true) {
      return NextResponse.json({ visitor: null });
    }

    return NextResponse.json({
      visitor: {
        id: data.id,
        full_name: data.full_name,
        email: data.email,
      },
    });
  } catch (err) {
    console.error("GET /api/visitors/me:", err);
    return NextResponse.json({ visitor: null });
  }
}
