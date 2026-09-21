import {
  getAdminUsersPage,
  parseAdminUsersPageSearchParams,
} from "@/lib/admin/get-admin-users-page";
import { getIsPlatformMod } from "@/lib/permissions/get-is-mod";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request): Promise<Response> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isModerator = await getIsPlatformMod(supabase, user.id);
    if (!isModerator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = parseAdminUsersPageSearchParams(searchParams);
    const admin = await createAdminClient();
    const data = await getAdminUsersPage(admin, query);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/admin/users:", error);
    return NextResponse.json(
      { error: "Failed to list users" },
      { status: 500 }
    );
  }
}
