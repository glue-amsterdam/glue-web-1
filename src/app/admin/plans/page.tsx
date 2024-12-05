import AdminHeader from "@/app/admin/components/admin-header";
import PlanSelector from "@/app/admin/components/plans-section-selector";
import PlanFifthSection from "@/app/admin/sections/plans-fifth-sections";
import PlanFourSection from "@/app/admin/sections/plans-four-sections";
import PlanOneSection from "@/app/admin/sections/plans-one-plan-sections";
import PlanThreeSection from "@/app/admin/sections/plans-three-sections";
import PlanTwoSection from "@/app/admin/sections/plans-two-plan-sections";
import PlanZeroSection from "@/app/admin/sections/plans-zero-plan-sections";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { PlanIdType } from "@/schemas/plansSchema";
import Link from "next/link";
import { Suspense } from "react";

interface PlansPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function PlansPage({ searchParams }: PlansPageProps) {
  const { plan } = await searchParams;
  const currentPlan = (plan as string) || "planId-0";

  return (
    <div className="container mx-auto p-4">
      <AdminHeader adminName="Admin" />
      <div className="bg-white rounded-lg shadow-md p-6 mt-4">
        <Link
          href="/admin"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          Back to Admin Dashboard
        </Link>
        <h2 className="text-2xl font-semibold mb-6 text-blue-800">
          Plan Management
        </h2>
        <PlanSelector currentPlan={currentPlan as PlanIdType} />
        {currentPlan === "planId-0" && (
          <Suspense fallback={<LoadingSpinner />}>
            <PlanZeroSection />
          </Suspense>
        )}
        {currentPlan === "planId-1" && (
          <Suspense fallback={<LoadingSpinner />}>
            <PlanOneSection />
          </Suspense>
        )}
        {currentPlan === "planId-2" && (
          <Suspense fallback={<LoadingSpinner />}>
            <PlanTwoSection />
          </Suspense>
        )}
        {currentPlan === "planId-3" && (
          <Suspense fallback={<LoadingSpinner />}>
            <PlanThreeSection />
          </Suspense>
        )}
        {currentPlan === "planId-4" && (
          <Suspense fallback={<LoadingSpinner />}>
            <PlanFourSection />
          </Suspense>
        )}
        {currentPlan === "planId-5" && (
          <Suspense fallback={<LoadingSpinner />}>
            <PlanFifthSection />
          </Suspense>
        )}
      </div>
    </div>
  );
}
