import { buildAdminUserDetail } from "@/lib/admin/build-admin-user-detail";
import { getIsPlatformMod } from "@/lib/permissions/get-is-mod";
import type { AdminVisitorData } from "@/types/admin-user";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
): Promise<Response> {
  const { userId } = await params;

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
    const { data: authData, error: authError } =
      await admin.auth.admin.getUserById(userId);

    if (authError || !authData.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const authUser = {
      id: authData.user.id,
      email: authData.user.email ?? null,
      created_at: authData.user.created_at,
    };

    const [
      visitorResult,
      participantResult,
      permissionsResult,
      invoiceResult,
      visitingHoursResult,
      legacyResult,
    ] = await Promise.all([
      admin
        .from("visitor_data")
        .select(
          "id, email, first_name, last_name, full_name, display_name, birth_date, area_id"
        )
        .eq("auth_user_id", userId)
        .maybeSingle(),
      admin.from("participant_details").select("*").eq("user_id", userId).maybeSingle(),
      admin
        .from("user_permissions")
        .select("is_mod")
        .eq("user_id", userId)
        .maybeSingle(),
      admin.from("invoice_data").select("*").eq("user_id", userId).maybeSingle(),
      admin
        .from("visiting_hours")
        .select("day_id, hours")
        .eq("user_id", userId),
      admin
        .from("user_info")
        .select("user_name")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

    if (visitingHoursResult.error) {
      console.error("Error fetching visiting hours:", visitingHoursResult.error);
      return NextResponse.json(
        { error: "Failed to fetch visiting hours" },
        { status: 500 }
      );
    }

    const visitorData = visitorResult.data as AdminVisitorData | null;
    const formattedVisitingHours =
      visitingHoursResult.data?.map((row) => ({
        day_id: row.day_id,
        hours: row.hours as Array<{ open: string; close: string }>,
      })) ?? [];

    const detail = buildAdminUserDetail({
      authUser,
      isMod: permissionsResult.data?.is_mod === true,
      visitorData,
      participantDetails: participantResult.data ?? null,
      legacyUserName: legacyResult.data?.user_name ?? null,
      invoiceData: invoiceResult.data ?? undefined,
      visitingHours:
        formattedVisitingHours.length > 0 ? formattedVisitingHours : undefined,
    });

    return NextResponse.json(detail);
  } catch (error) {
    console.error(`Error in GET /api/users/${userId}:`, error);

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
