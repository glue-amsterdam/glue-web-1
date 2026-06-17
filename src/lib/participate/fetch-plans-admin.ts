import { getPlansStatusId } from "@/lib/participate/get-plans-status-id";
import {
  DEFAULT_BASE_PLAN_ITEMS,
  DEFAULT_BASE_PLAN_LABEL,
  DEFAULT_BASE_PLAN_SUBTITLE,
} from "@/lib/participate/participate-defaults";
import type {
  ParticipateApplicationStatusAdminData,
  ParticipateBasePackageAdminData,
  ParticipatePlansStatusRow,
} from "@/lib/participate/types";
import {
  participateApplicationStatusUpdateSchema,
  participateBasePackageUpdateSchema,
} from "@/schemas/participatePlansSchema";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import type { SupabaseClient } from "@supabase/supabase-js";

const mapRowToBasePackageAdminData = (
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

export const fetchPlansApplicationStatus = async (
  supabase?: SupabaseClient
): Promise<ParticipateApplicationStatusAdminData> => {
  const client = supabase ?? createPublicSupabaseClient();
  const { data, error } = await client
    .from("plans_status")
    .select("id, application_closed, closed_message")
    .single();

  if (error) {
    throw error;
  }

  return {
    application_closed: data.application_closed ?? false,
    closed_message: data.closed_message ?? "",
  };
};

export const updatePlansApplicationStatus = async (
  input: ParticipateApplicationStatusAdminData,
  supabase: SupabaseClient
): Promise<ParticipateApplicationStatusAdminData> => {
  const validated = participateApplicationStatusUpdateSchema.parse(input);
  const statusId = await getPlansStatusId(supabase);

  const { data, error } = await supabase
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

  return {
    application_closed: data.application_closed ?? false,
    closed_message: data.closed_message ?? "",
  };
};

export const fetchPlansBasePackage = async (
  supabase?: SupabaseClient
): Promise<ParticipateBasePackageAdminData> => {
  const client = supabase ?? createPublicSupabaseClient();
  const { data, error } = await client
    .from("plans_status")
    .select("base_plan_label, base_plan_subtitle, base_plan_items")
    .single();

  if (error) {
    throw error;
  }

  return mapRowToBasePackageAdminData(data as ParticipatePlansStatusRow);
};

export const updatePlansBasePackage = async (
  input: ParticipateBasePackageAdminData,
  supabase: SupabaseClient
): Promise<ParticipateBasePackageAdminData> => {
  const validated = participateBasePackageUpdateSchema.parse(input);
  const statusId = await getPlansStatusId(supabase);

  const { data, error } = await supabase
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

  return mapRowToBasePackageAdminData(data as ParticipatePlansStatusRow);
};
