import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { getPlansStatusId } from "@/lib/participate/get-plans-status-id";
import {
  DEFAULT_BASE_PLAN_ITEMS,
  DEFAULT_BASE_PLAN_LABEL,
  DEFAULT_BASE_PLAN_SUBTITLE,
} from "@/lib/participate/participate-defaults";
import { revalidateParticipatePlansCache } from "@/lib/participate/revalidate-participate-plans-cache";
import type {
  ParticipateBasePackageAdminData,
  ParticipatePlansStatusRow,
} from "@/lib/participate/types";
import { participateBasePackageUpdateSchema } from "@/schemas/participatePlansSchema";
import { NextResponse } from "next/server";

const mapRowToAdminData = (
  row: ParticipatePlansStatusRow | null
): ParticipateBasePackageAdminData => ({
  base_plan_label: row?.base_plan_label?.trim() || DEFAULT_BASE_PLAN_LABEL,
  base_plan_subtitle:
    row?.base_plan_subtitle?.trim() || DEFAULT_BASE_PLAN_SUBTITLE,
  base_plan_items:
    row?.base_plan_items && row.base_plan_items.length > 0
      ? row.base_plan_items.map((item) => ({ label: item.label }))
      : DEFAULT_BASE_PLAN_ITEMS,
});

export async function PUT(request: Request) {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const validated = participateBasePackageUpdateSchema.parse(body);
    const statusId = await getPlansStatusId(auth.supabase);

    const { data, error } = await auth.supabase
      .from("plans_status")
      .update({
        base_plan_label: validated.base_plan_label,
        base_plan_subtitle: validated.base_plan_subtitle,
        base_plan_items: validated.base_plan_items,
        updated_at: new Date().toISOString(),
      })
      .eq("id", statusId)
      .select("base_plan_label, base_plan_subtitle, base_plan_items")
      .single();

    if (error) {
      throw error;
    }

    revalidateParticipatePlansCache();

    return NextResponse.json(
      mapRowToAdminData(data as ParticipatePlansStatusRow)
    );
  } catch (error) {
    console.error("Error in PUT /api/admin/plans/base-package:", error);
    return NextResponse.json(
      { error: "Failed to update base package" },
      { status: 500 }
    );
  }
}
