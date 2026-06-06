import { redirect } from "next/navigation";
import { ParticipationWizard } from "@/app/participate/apply/participation-wizard";
import { getPlanByIdForApply } from "@/lib/participate/get-plan-by-id";
import { getCachedTerms } from "@/lib/terms/get-cached-terms";
import { createClient } from "@/utils/supabase/server";

type PageProps = {
  searchParams: Promise<{
    planId?: string;
    intent?: string;
  }>;
};

export default async function ParticipateApplyPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const planId = params.planId?.trim();

  if (!planId) {
    redirect("/participate#plans-selection-section");
  }

  const intentParam = params.intent?.trim();
  const intent =
    intentParam === "upgrade" || intentParam === "reactivation"
      ? intentParam
      : "new";

  const plan = await getPlanByIdForApply(planId);
  if (!plan) {
    redirect("/participate#plans-selection-section");
  }

  const [termsContent, supabase] = await Promise.all([
    getCachedTerms(),
    createClient(),
  ]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main id="participate-apply-page">
      <ParticipationWizard
        plan={plan}
        intent={intent}
        isAuthenticated={Boolean(user)}
        termsContent={termsContent}
      />
    </main>
  );
}
