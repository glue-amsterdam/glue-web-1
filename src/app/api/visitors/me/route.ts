import { NextResponse } from "next/server";
import { getVisitorDisplayName } from "@/lib/visitor/display-name";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ visitor: null });
    }

    const { data, error } = await supabase
      .from("visitor_data")
      .select(
        "id, email, first_name, last_name, display_name, full_name, auth_user_id"
      )
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("GET /api/visitors/me:", error);
      return NextResponse.json({ visitor: null });
    }

    if (!data) {
      return NextResponse.json({ visitor: null });
    }

    return NextResponse.json({
      visitor: {
        id: data.id,
        authUserId: user.id,
        email: data.email,
        full_name: getVisitorDisplayName(data),
        firstName: data.first_name,
        lastName: data.last_name,
      },
    });
  } catch (err) {
    console.error("GET /api/visitors/me:", err);
    return NextResponse.json({ visitor: null });
  }
}
