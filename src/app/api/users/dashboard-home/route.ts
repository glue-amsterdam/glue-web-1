import { NextResponse } from "next/server";
import { getNavbarIdentity } from "@/lib/users/get-navbar-identity";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        href: null,
        isParticipant: false,
        isVisitorOnly: false,
      });
    }

    const identity = await getNavbarIdentity(user.id);
    return NextResponse.json({
      href: identity.dashboardHref,
      isParticipant: identity.isParticipant,
      isVisitorOnly: identity.isVisitorOnly,
    });
  } catch (err) {
    console.error("GET /api/users/dashboard-home:", err);
    return NextResponse.json({
      href: null,
      isParticipant: false,
      isVisitorOnly: false,
    });
  }
}
