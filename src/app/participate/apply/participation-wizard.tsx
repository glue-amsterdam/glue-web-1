"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PlanType } from "@/schemas/plansSchema";
import { InvoiceForm, type InvoiceFormData } from "@/app/signup-0.1/InvoiceFormData";
import {
  ParticipantExtraDataForm,
  type ParticipantExtraDataFormData,
} from "@/app/signup-0.1/ParticipantExtraData";
import { MapInfoForm } from "@/app/signup-0.1/MapInfoForm";
import type { MapInfo } from "@/schemas/mapInfoSchemas";
import {
  VisitorAccountStep,
  type VisitorAccountValues,
} from "@/components/participate/visitor-account-step";
import MainContainer from "@/components/main-container";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/app/components/LoadingSpinner";

type ParticipationWizardProps = {
  plan: PlanType;
  intent: "new" | "upgrade" | "reactivation";
  isAuthenticated: boolean;
};

export const ParticipationWizard = ({
  plan,
  intent,
  isAuthenticated,
}: ParticipationWizardProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceFormData | null>(null);
  const [extraData, setExtraData] =
    useState<ParticipantExtraDataFormData | null>(null);
  const [mapInfo, setMapInfo] = useState<MapInfo | null>(null);

  const isReactivation = intent === "reactivation";
  const showAccountStep = !isAuthenticated && !isReactivation;
  const totalSteps = isReactivation ? 1 : showAccountStep ? 4 : 3;

  const handleBack = () => {
    if (step === 1) {
      router.push("/participate#plans-selection-section");
      return;
    }
    setStep(step - 1);
  };

  const submitReactivation = async (data: MapInfo) => {
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
            formatted_address: data.formatted_address,
            latitude: data.latitude,
            longitude: data.longitude,
            no_address: data.no_address,
            notes: "",
            exhibition_space_preference: data.exhibition_space_preference,
            termsAccepted: true,
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
    if (isReactivation) {
      void submitReactivation(data);
      return;
    }
    setMapInfo(data);
    if (showAccountStep) {
      setStep(4);
      return;
    }
    void submitApplication();
  };

  const handleAccountSubmit = (data: VisitorAccountValues) => {
    void submitApplication(data);
  };

  if (isReactivation) {
    return (
      <MainContainer className="pt-[160px] lg:pt-[195px] pb-[80px]">
        <p className="base-text-size pb-[20px]">
          Reactivation · Plan: <strong>{plan.plan_label}</strong>
        </p>
        <MapInfoForm onSubmit={handleMapSubmit} onBack={handleBack} />
        {loading ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <LoadingSpinner />
          </div>
        ) : null}
      </MainContainer>
    );
  }

  return (
    <MainContainer className="pt-[160px] lg:pt-[195px] pb-[80px]">
      <p className="base-text-size pb-[20px]">
        Plan: <strong>{plan.plan_label}</strong> · Step {step} of {totalSteps}
      </p>

      {step === 1 && (
        <InvoiceForm
          onSubmit={(data) => {
            setInvoiceData(data);
            setStep(2);
          }}
          onBack={handleBack}
        />
      )}
      {step === 2 && (
        <ParticipantExtraDataForm
          onSubmit={(data) => {
            setExtraData(data);
            setStep(3);
          }}
          onBack={handleBack}
        />
      )}
      {step === 3 && (
        <MapInfoForm onSubmit={handleMapSubmit} onBack={handleBack} />
      )}
      {step === 4 && showAccountStep && (
        <VisitorAccountStep onSubmit={handleAccountSubmit} onBack={handleBack} />
      )}

      {loading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <LoadingSpinner />
        </div>
      ) : null}
    </MainContainer>
  );
};
