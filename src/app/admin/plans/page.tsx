import { getPlans } from "@/app/actions/plans";
import ApplicationStatusManager from "@/components/admin/plans/ApplicationStatusManager";
import ParticipateBasePackageForm from "@/components/admin/plans/ParticipateBasePackageForm";
import PlansList from "@/components/admin/plans/PlansList";
import {
  DEFAULT_BASE_PLAN_ITEMS,
  DEFAULT_BASE_PLAN_LABEL,
  DEFAULT_BASE_PLAN_SUBTITLE,
} from "@/lib/participate/participate-defaults";
import type {
  ParticipateBasePackageAdminData,
  ParticipatePlansStatusRow,
} from "@/lib/participate/types";
import { createPublicSupabaseClient } from "@/utils/supabase/public";

const fetchBasePackageData = async (): Promise<ParticipateBasePackageAdminData> => {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("plans_status")
    .select("base_plan_label, base_plan_subtitle, base_plan_items")
    .single();

  if (error) {
    console.error("fetchBasePackageData:", error);
    return {
      base_plan_label: DEFAULT_BASE_PLAN_LABEL,
      base_plan_subtitle: DEFAULT_BASE_PLAN_SUBTITLE,
      base_plan_items: DEFAULT_BASE_PLAN_ITEMS,
    };
  }

  const row = data as ParticipatePlansStatusRow;

  return {
    base_plan_label: row.base_plan_label?.trim() || DEFAULT_BASE_PLAN_LABEL,
    base_plan_subtitle:
      row.base_plan_subtitle?.trim() || DEFAULT_BASE_PLAN_SUBTITLE,
    base_plan_items:
      row.base_plan_items && row.base_plan_items.length > 0
        ? row.base_plan_items.map((item) => ({ label: item.label }))
        : DEFAULT_BASE_PLAN_ITEMS,
  };
};

export default async function PlansPage() {
  const [plans, basePackageData] = await Promise.all([
    getPlans(),
    fetchBasePackageData(),
  ]);

  return (
    <div className="rounded-lg bg-white p-4 shadow-md">
      <div className="space-y-10">
        <section>
          <ApplicationStatusManager />
        </section>

        <section className="border-t pt-8">
          <h2 className="title-text mb-4">Base Package Card</h2>
          <p className="base-text-size mb-4 text-muted-foreground">
            Fixed intro card shown on the participate page for every package.
          </p>
          <ParticipateBasePackageForm initialData={basePackageData} />
        </section>

        <section className="border-t pt-8">
          <h2 className="title-text mb-4">Participant Plans</h2>
          <PlansList initialPlans={plans} />
        </section>
      </div>
    </div>
  );
}
