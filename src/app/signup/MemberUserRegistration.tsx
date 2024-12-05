"use client";

import { useState } from "react";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { invoiceDataTypeSchema } from "@/schemas/invoiceSchemas";
import { loginSchemaWithEmail } from "@/schemas/loginSchema";
import { InvoiceForm, InvoiceFormData } from "@/app/signup/InvoiceFormData";
import {
  EmailPasswordForm,
  EmailPasswordFormData,
} from "@/app/signup/EmailPasswordForm";

const paidUserSchema = z
  .object({
    plan_id: z.string(),
    plan_type: z.literal("member"),
  })
  .and(invoiceDataTypeSchema)
  .and(loginSchemaWithEmail);

type PaidUserFormData = z.infer<typeof paidUserSchema>;

interface PaidUserRegistrationProps {
  onSubmit: (data: PaidUserFormData) => void;
  plan_id: string;
  plan_type: "member";
  onBack: () => void;
}

export default function MemberUserRegistration({
  onSubmit,
  plan_id,
  plan_type,
  onBack,
}: PaidUserRegistrationProps) {
  const [step, setStep] = useState(1);
  const [invoiceData, setInvoiceData] = useState<InvoiceFormData | null>(null);

  const handleInvoiceSubmit = (data: InvoiceFormData) => {
    setInvoiceData(data);
    setStep(2);
  };

  const handleEmailPasswordSubmit = (data: EmailPasswordFormData) => {
    if (invoiceData) {
      onSubmit({
        ...data,
        ...invoiceData,
        plan_id,
        plan_type,
      });
    }
  };

  const handleBack = () => {
    if (step === 1) {
      onBack();
    } else {
      setStep(1);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {step === 1
            ? "Step 1: Invoice Information"
            : "Step 2: Account Information"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === 1 ? (
          <InvoiceForm onSubmit={handleInvoiceSubmit} onBack={onBack} />
        ) : (
          <EmailPasswordForm
            onSubmit={handleEmailPasswordSubmit}
            onBack={handleBack}
          />
        )}
      </CardContent>
    </Card>
  );
}
