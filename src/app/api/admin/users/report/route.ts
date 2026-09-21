import { getAdminUserList } from "@/lib/admin/get-admin-user-list";
import { getIsPlatformMod } from "@/lib/permissions/get-is-mod";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(): Promise<Response> {
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

    const admin = await createAdminClient();
    const users = await getAdminUserList(admin);

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error in GET /api/admin/users/report:", error);
    return NextResponse.json(
      { error: "Failed to load users report data" },
      { status: 500 }
    );
  }
}
