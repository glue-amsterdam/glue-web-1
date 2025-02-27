"use client";

import { useState } from "react";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  EmailPasswordForm,
  emailPasswordSchema,
  EmailPasswordFormData,
} from "./EmailPasswordForm";
import { invoiceDataTypeSchema } from "@/schemas/invoiceSchemas";
import { MapInfoForm } from "@/app/signup/MapInfoForm";
import { InvoiceForm, InvoiceFormData } from "@/app/signup/InvoiceFormData";
import {
  ParticipantExtraDataForm,
  ParticipantExtraDataFormData,
  participantExtraDataSchema,
} from "@/app/signup/ParticipantExtraData";
import { MapInfo, mapInfoSchema } from "@/schemas/mapInfoSchemas";

const participantUserSchema = z
  .object({
    plan_id: z.enum(["planId-2", "planId-3", "planId-4", "planId-5"]),
    plan_type: z.literal("participant"),
  })
  .and(invoiceDataTypeSchema)
  .and(participantExtraDataSchema)
  .and(mapInfoSchema)
  .and(emailPasswordSchema);

type ParticipantUserFormData = z.infer<typeof participantUserSchema>;

interface ParticipantRegistrationProps {
  onSubmit: (data: ParticipantUserFormData) => void;
  plan_id: string;
  plan_type: "participant";
  onBack: () => void;
}

export default function ParticipantRegistration({
  onSubmit,
  plan_id,
  plan_type,
  onBack,
}: ParticipantRegistrationProps) {
  const [step, setStep] = useState(1);
  const [invoiceData, setInvoiceData] = useState<InvoiceFormData | null>(null);
  const [extraData, setExtraData] =
    useState<ParticipantExtraDataFormData | null>(null);
  const [mapInfo, setMapInfo] = useState<MapInfo | null>(null);

  const handleInvoiceSubmit = (data: InvoiceFormData) => {
    setInvoiceData(data);
    setStep(2);
  };

  const handleExtraDataSubmit = (data: ParticipantExtraDataFormData) => {
    setExtraData(data);
    setStep(3);
  };

  const handleMapInfoSubmit = (data: MapInfo) => {
    setMapInfo(data);
    setStep(4);
  };

  const handleEmailPasswordSubmit = (data: EmailPasswordFormData) => {
    if (invoiceData && extraData && mapInfo) {
      onSubmit({
        ...invoiceData,
        ...extraData,
        ...mapInfo,
        ...data,
        plan_id: plan_id as "planId-2" | "planId-3" | "planId-4" | "planId-5",
        plan_type,
      });
    }
  };

  const handleBack = () => {
    if (step === 1) {
      onBack();
    } else {
      setStep(step - 1);
    }
  };

  return (
    <Card className="w-full max-w-md lg:max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {step === 1 && "Step 1: Invoice Information"}
          {step === 2 && "Step 2: Participant Details"}
          {step === 3 && "Step 3: Map Information"}
          {step === 4 && "Step 4: Account Information"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <InvoiceForm onSubmit={handleInvoiceSubmit} onBack={onBack} />
        )}
        {step === 2 && (
          <ParticipantExtraDataForm
            onSubmit={handleExtraDataSubmit}
            onBack={handleBack}
          />
        )}
        {step === 3 && (
          <MapInfoForm onSubmit={handleMapInfoSubmit} onBack={handleBack} />
        )}
        {step === 4 && (
          <EmailPasswordForm
            onSubmit={handleEmailPasswordSubmit}
            onBack={handleBack}
            submitButtonText="Complete Participant Registration"
          />
        )}
      </CardContent>
    </Card>
  );
}
