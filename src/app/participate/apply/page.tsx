import { redirect } from "next/navigation";
import { ParticipationWizard } from "@/app/participate/apply/participation-wizard";
import { participateApplyMetadata } from "@/lib/metadata";
import { getParticipationEligibility } from "@/lib/participate/get-participation-eligibility";
import { getParticipationFormContext } from "@/lib/participate/get-participation-form-context";
import { getPlanByIdForApply } from "@/lib/participate/get-plan-by-id";
import { getCachedTerms } from "@/lib/terms/get-cached-terms";
import type { Metadata } from "next";

export const metadata: Metadata = participateApplyMetadata;

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

  const eligibility = await getParticipationEligibility(params.intent);

  if (!eligibility.canApply) {
    redirect(eligibility.dashboardHref ?? eligibility.participateBackHref);
  }

  const plan = await getPlanByIdForApply(planId);
  if (!plan) {
    redirect(eligibility.participateBackHref);
  }

  const [termsContent, formContext] = await Promise.all([
    getCachedTerms(),
    getParticipationFormContext(eligibility.resolvedIntent),
  ]);

  if (
    eligibility.resolvedIntent === "reactivation" &&
    !formContext.isAuthenticated
  ) {
    redirect(eligibility.participateBackHref);
  }

  return (
    <main id="participate-apply-page">
      <ParticipationWizard
        plan={plan}
        formContext={formContext}
        participateBackHref={eligibility.participateBackHref}
        termsContent={termsContent}
      />
    </main>
  );
}
