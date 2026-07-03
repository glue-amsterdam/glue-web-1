"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PlanType } from "@/schemas/plansSchema";
import { InvoiceStep } from "@/components/participate/invoice-step";
import type { InvoiceDataType } from "@/schemas/invoiceSchemas";
import { ParticipantExtraDataStep } from "@/components/participate/participant-extra-data-step";
import type { ParticipantExtraDataFormData } from "@/schemas/participantExtraDataSchema";
import {
  MapInfoStep,
  type MapInfoStepValues,
} from "@/components/participate/map-info-step";
import type { MapInfo } from "@/schemas/mapInfoSchemas";
import {
  VisitorAccountStep,
  type VisitorWorkAreaOption,
} from "@/components/participate/visitor-account-step";
import { VisitorCheckInStep } from "@/components/participate/visitor-check-in-step";
import { ParticipationPrefilledHint } from "@/components/participate/participation-prefilled-hint";
import type { ParticipationFormContext } from "@/lib/participate/get-participation-form-context";
import {
  toVisitorProfileFormValues,
  type VisitorParticipantAccountValues,
} from "@/schemas/visitorSchemas";
import MainContainer from "@/components/main-container";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { getCookieConsent } from "@/app/actions/cookieConsent";
import { useAuth } from "@/context/AuthContext";

type ParticipationWizardProps = {
  plan: PlanType;
  formContext: ParticipationFormContext;
  participateBackHref: string;
  termsContent: string;
  workAreas: VisitorWorkAreaOption[];
  prefilledEmail?: string | null;
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
  workAreas,
  prefilledEmail,
}: ParticipationWizardProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();
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
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [accountData, setAccountData] =
    useState<VisitorParticipantAccountValues | null>(null);

  const isReactivation = intent === "reactivation";
  const showAccountStep = !isAuthenticated && intent === "new";
  const showVisitorCheckInStep =
    isAuthenticated && !formContext.visitorProfileComplete;
  const hasFinalStep = showAccountStep || showVisitorCheckInStep;

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
    map: MapInfo,
    acceptedTerms: boolean
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
            termsAccepted: acceptedTerms,
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

  const submitApplication = async (
    account?: VisitorParticipantAccountValues
  ) => {
    if (!invoiceData || !extraData || !mapInfo || !termsAccepted) return;

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
        termsAccepted,
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

      toast({
        title: "Application submitted",
        description: "A moderator will review your application.",
      });

      if (account) {
        const hasConsent = await getCookieConsent();
        if (!hasConsent) {
          toast({
            title: "Cookie consent required",
            description:
              "Cookie consent is required to continue. Please enable cookies.",
            variant: "destructive",
          });
          return;
        }

        try {
          await login(account.email, account.password);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Account created but sign-in failed. Please log in manually.";
          toast({
            title: "Sign-in failed",
            description: message,
            variant: "destructive",
          });
          return;
        }
      }

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

  const handleMapSubmit = (data: MapInfoStepValues) => {
    const { termsAccepted: acceptedTerms, ...map } = data;
    setMapInfo(map);
    setTermsAccepted(acceptedTerms);

    if (hasFinalStep) {
      setStep(4);
      return;
    }

    if (isReactivation) {
      if (!invoiceData || !extraData) return;
      void submitReactivation(invoiceData, extraData, map, acceptedTerms);
      return;
    }

    void submitApplication();
  };

  const handleAccountSubmit = (data: VisitorParticipantAccountValues) => {
    setAccountData(data);
    void submitApplication(data);
  };

  const handleVisitorCheckInSubmit = () => {
    if (isReactivation) {
      if (!invoiceData || !extraData || !mapInfo) return;
      void submitReactivation(invoiceData, extraData, mapInfo, termsAccepted);
      return;
    }

    void submitApplication();
  };

  const mapSubmitLabel = (() => {
    if (hasFinalStep) return "next step";
    if (isReactivation) return "submit request";
    return "submit";
  })();

  const visitorProfileFormValues = formContext.visitorProfile
    ? toVisitorProfileFormValues(formContext.visitorProfile)
    : null;

  return (
    <MainContainer className="terms-and-conditions-padding pb-(--site-footer-h) min-h-dvh flex flex-col">
      {step === 1 && (
        <>
          <ParticipationPrefilledHint show={sectionStatus.invoice === "complete"} />
          <h1 className="title-text uppercase">Invoice Information</h1>
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
          <h1 className="title-text uppercase">Participant Information</h1>
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
          <h1 className="title-text uppercase">Location</h1>
          <MapInfoStep
            defaultValues={
              mapInfo
                ? { ...mapInfo, termsAccepted }
                : { termsAccepted }
            }
            onSubmit={handleMapSubmit}
            onBack={handleBack}
            submitLabel={mapSubmitLabel}
            termsContent={termsContent}
          />
        </>
      )}
      {step === 4 && showAccountStep && (
        <>
          <h1 className="title-text uppercase">Sign up</h1>
          <VisitorAccountStep
            submitLabel="submit"
            requireCheckInFields={false}
            initialValues={{
              ...(accountData ?? {}),
              email: accountData?.email ?? prefilledEmail ?? "",
            }}
            onSubmit={handleAccountSubmit}
            onBack={handleBack}
            backLabel="Back"
            isSubmitting={loading}
            loadingMessage="Submitting your application…"
          />
        </>
      )}
      {step === 4 && showVisitorCheckInStep && visitorProfileFormValues && (
        <VisitorCheckInStep
          workAreas={workAreas}
          initialProfile={visitorProfileFormValues}
          onSubmit={handleVisitorCheckInSubmit}
          onBack={handleBack}
          submitLabel={
            isReactivation ? "submit request" : "submit"
          }
          isSubmitting={loading}
          loadingMessage={
            isReactivation
              ? "Submitting your reactivation request…"
              : "Submitting your application…"
          }
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
