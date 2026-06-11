"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PlanType } from "@/schemas/plansSchema";
import { InvoiceStep } from "@/components/participate/invoice-step";
import type { InvoiceDataType } from "@/schemas/invoiceSchemas";
import { ParticipantExtraDataStep } from "@/components/participate/participant-extra-data-step";
import type { ParticipantExtraDataFormData } from "@/schemas/participantExtraDataSchema";
import { MapInfoStep } from "@/components/participate/map-info-step";
import type { MapInfo } from "@/schemas/mapInfoSchemas";
import {
  VisitorAccountStep,
  type VisitorAccountValues,
} from "@/components/participate/visitor-account-step";
import { ParticipationPrefilledHint } from "@/components/participate/participation-prefilled-hint";
import type { ParticipationFormContext } from "@/lib/participate/get-participation-form-context";
import MainContainer from "@/components/main-container";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { submitNewsletter } from "@/app/actions/newsletter";

type ParticipationWizardProps = {
  plan: PlanType;
  formContext: ParticipationFormContext;
  participateBackHref: string;
  termsContent: string;
};

/**
 * Reactivation is initiated by the participant here; moderators approve
 * and change plans from the dashboard only (no targetId impersonation).
 */
export const ParticipationWizard = ({
  plan,
  formContext,
  participateBackHref,
  termsContent,
}: ParticipationWizardProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const { intent, isAuthenticated, sectionStatus } = formContext;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceDataType | null>(
    formContext.initialValues.invoice
  );
  const [extraData, setExtraData] = useState<ParticipantExtraDataFormData | null>(
    formContext.initialValues.extra
  );
  const [mapInfo, setMapInfo] = useState<MapInfo | null>(
    formContext.initialValues.map
  );
  const [accountData, setAccountData] = useState<VisitorAccountValues | null>(
    null
  );

  const isReactivation = intent === "reactivation";
  const showAccountStep = !isAuthenticated && intent === "new";
  const totalSteps = showAccountStep ? 4 : 3;

  const handleBack = () => {
    if (step === 1) {
      router.push(participateBackHref);
      return;
    }
    setStep(step - 1);
  };

  const submitReactivation = async (
    invoice: InvoiceDataType,
    extra: ParticipantExtraDataFormData,
    map: MapInfo
  ) => {
    setLoading(true);
    try {
      const response = await fetch("/api/participation/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "reactivation",
          plan_id: plan.plan_id,
          reactivation: {
            plan_id: plan.plan_id,
            plan_type: plan.plan_type,
            plan_label: plan.plan_label,
            termsAccepted: true,
            ...invoice,
            ...extra,
            formatted_address: map.formatted_address,
            latitude: map.latitude,
            longitude: map.longitude,
            no_address: map.no_address,
            exhibition_space_preference: map.exhibition_space_preference,
            notes: "",
          },
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast({
          title: "Submission failed",
          description:
            typeof result.error === "string"
              ? result.error
              : "Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Request submitted",
        description: "Your reactivation request has been sent.",
      });
      router.push("/");
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitApplication = async (account?: VisitorAccountValues) => {
    if (!invoiceData || !extraData || !mapInfo) return;

    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        intent,
        plan_id: plan.plan_id,
        plan_type: plan.plan_type,
        plan_label: plan.plan_label,
        ...invoiceData,
        ...extraData,
        ...mapInfo,
        ...(account ?? {}),
      };

      const response = await fetch("/api/participation/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast({
          title: "Submission failed",
          description:
            typeof result.error === "string"
              ? result.error
              : "Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (account?.newsletterSubscribe) {
        try {
          await submitNewsletter({
            firstName: account.firstName,
            lastName: account.lastName,
            email: account.email,
          });
        } catch {
          // best-effort; application already succeeded
        }
      }

      toast({
        title: "Application submitted",
        description: "A moderator will review your application.",
      });
      router.push("/");
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMapSubmit = (data: MapInfo) => {
    setMapInfo(data);

    if (isReactivation) {
      if (!invoiceData || !extraData) return;
      void submitReactivation(invoiceData, extraData, data);
      return;
    }

    if (showAccountStep) {
      setStep(4);
      return;
    }

    void submitApplication();
  };

  const handleAccountSubmit = (data: VisitorAccountValues) => {
    setAccountData(data);
    void submitApplication(data);
  };

  return (
    <MainContainer className="pt-[160px] lg:pt-[122px] lg:pb-[80px]">
      {step === 1 && (
        <>
          <ParticipationPrefilledHint show={sectionStatus.invoice === "complete"} />
          <InvoiceStep
            defaultValues={invoiceData ?? undefined}
            onSubmit={(data) => {
              setInvoiceData(data);
              setStep(2);
            }}
            onBack={handleBack}
          />
        </>
      )}
      {step === 2 && (
        <>
          <ParticipationPrefilledHint show={sectionStatus.extra === "complete"} />
          <ParticipantExtraDataStep
            defaultValues={extraData ?? undefined}
            onSubmit={(data) => {
              setExtraData(data);
              setStep(3);
            }}
            onBack={handleBack}
          />
        </>
      )}
      {step === 3 && (
        <>
          <ParticipationPrefilledHint show={sectionStatus.map === "complete"} />
          <MapInfoStep
            defaultValues={mapInfo ?? undefined}
            onSubmit={handleMapSubmit}
            onBack={handleBack}
            submitLabel={
              isReactivation
                ? "Submit reactivation request"
                : showAccountStep
                  ? "Next Step"
                  : "Submit application"
            }
          />
        </>
      )}
      {step === 4 && showAccountStep && (
        <VisitorAccountStep
          initialValues={accountData ?? undefined}
          onSubmit={handleAccountSubmit}
          onBack={handleBack}
          backLabel="Back"
          isSubmitting={loading}
          loadingMessage="Submitting your application…"
          termsContent={termsContent}
        />
      )}
      {loading && step !== 4 ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <LoadingSpinner />
        </div>
      ) : null}
    </MainContainer>
  );
};
