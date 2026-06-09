import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { getPlansStatusId } from "@/lib/participate/get-plans-status-id";
import { revalidateParticipatePlansCache } from "@/lib/participate/revalidate-participate-plans-cache";
import type { ParticipateApplicationStatusAdminData } from "@/lib/participate/types";
import { participateApplicationStatusUpdateSchema } from "@/schemas/participatePlansSchema";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from("plans_status")
      .select("id, application_closed, closed_message")
      .single();

    if (error) {
      throw error;
    }

    const response: ParticipateApplicationStatusAdminData = {
      application_closed: data.application_closed ?? false,
      closed_message: data.closed_message ?? "",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/admin/plans/status:", error);
    return NextResponse.json(
      { error: "Failed to fetch application status" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const validated = participateApplicationStatusUpdateSchema.parse(body);
    const statusId = await getPlansStatusId(auth.supabase);

    const { data, error } = await auth.supabase
      .from("plans_status")
      .update({
        application_closed: validated.application_closed,
        closed_message: validated.closed_message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", statusId)
      .select("application_closed, closed_message")
      .single();

    if (error) {
      throw error;
    }

    revalidateParticipatePlansCache();

    const response: ParticipateApplicationStatusAdminData = {
      application_closed: data.application_closed ?? false,
      closed_message: data.closed_message ?? "",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in PUT /api/admin/plans/status:", error);
    return NextResponse.json(
      { error: "Failed to update application status" },
      { status: 500 }
    );
  }
}
