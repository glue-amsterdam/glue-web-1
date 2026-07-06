"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import BigButton from "@/components/big-button";
import { ParticipateFormField } from "@/components/participate/participate-form-field";
import {
  ParticipateTermsAcceptance,
  TERMS_ACCEPTANCE_ERROR,
} from "@/components/participate/participate-terms-acceptance";
import {
  invoiceDataTypeSchema,
  type InvoiceDataType,
} from "@/schemas/invoiceSchemas";

type InvoiceStepProps = {
  onSubmit: (data: InvoiceDataType) => void;
  onBack: () => void;
  defaultValues?: Partial<InvoiceDataType>;
  submitLabel?: string;
  termsContent?: string;
  termsAccepted?: boolean;
  onTermsAcceptedChange?: (accepted: boolean) => void;
};

export const InvoiceStep = ({
  onSubmit,
  onBack,
  defaultValues,
  submitLabel = "next step",
  termsContent,
  termsAccepted = false,
  onTermsAcceptedChange,
}: InvoiceStepProps) => {
  const showTerms = Boolean(termsContent);
  const [localTermsAccepted, setLocalTermsAccepted] = useState(termsAccepted);
  const [termsError, setTermsError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<InvoiceDataType>({
    resolver: zodResolver(invoiceDataTypeSchema),
    defaultValues: {
      invoice_company_name: defaultValues?.invoice_company_name ?? "",
      invoice_zip_code: defaultValues?.invoice_zip_code ?? "",
      invoice_address: defaultValues?.invoice_address ?? "",
      invoice_country: defaultValues?.invoice_country ?? "",
      invoice_city: defaultValues?.invoice_city ?? "",
      invoice_extra: defaultValues?.invoice_extra ?? null,
    },
  });

  const handleTermsChange = (accepted: boolean) => {
    setLocalTermsAccepted(accepted);
    onTermsAcceptedChange?.(accepted);
    if (accepted) {
      setTermsError(null);
    }
  };

  const handleFormSubmit = (data: InvoiceDataType) => {
    if (showTerms && !localTermsAccepted) {
      setTermsError(TERMS_ACCEPTANCE_ERROR);
      return;
    }

    if (showTerms) {
      onTermsAcceptedChange?.(true);
    }

    onSubmit(data);
  };

  return (
    <div className="w-full max-w-(--field-max-width) lg:max-w-[1045px] mx-auto title-padding pb-[15px] lg:pb-[30px]">
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="w-full"
        noValidate
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[15px] lg:gap-[30px]">
          <Controller
            name="invoice_company_name"
            control={control}
            render={({ field }) => (
              <ParticipateFormField
                label="Company Name"
                name="invoice_company_name"
                required
                value={field.value}
                onChange={field.onChange}
                error={errors.invoice_company_name?.message}
              />
            )}
          />
          <Controller
            name="invoice_zip_code"
            control={control}
            render={({ field }) => (
              <ParticipateFormField
                label="Zip Code"
                name="invoice_zip_code"
                required
                value={field.value}
                onChange={field.onChange}
                error={errors.invoice_zip_code?.message}
              />
            )}
          />
          <Controller
            name="invoice_address"
            control={control}
            render={({ field }) => (
              <ParticipateFormField
                label="Address"
                name="invoice_address"
                required
                value={field.value}
                onChange={field.onChange}
                error={errors.invoice_address?.message}
              />
            )}
          />
          <Controller
            name="invoice_country"
            control={control}
            render={({ field }) => (
              <ParticipateFormField
                label="Country"
                name="invoice_country"
                required
                value={field.value}
                onChange={field.onChange}
                error={errors.invoice_country?.message}
              />
            )}
          />
          <Controller
            name="invoice_city"
            control={control}
            render={({ field }) => (
              <ParticipateFormField
                label="City"
                name="invoice_city"
                required
                value={field.value}
                onChange={field.onChange}
                error={errors.invoice_city?.message}
              />
            )}
          />
          <Controller
            name="invoice_extra"
            control={control}
            render={({ field }) => (
              <ParticipateFormField
                label="Additional Information (Optional)"
                name="invoice_extra"
                value={field.value ?? ""}
                onChange={field.onChange}
                error={errors.invoice_extra?.message}
              />
            )}
          />
        </div>

        {showTerms && termsContent ? (
          <div className="flex flex-col gap-4 pt-[15px] lg:pt-[30px]">
            <ParticipateTermsAcceptance
              termsContent={termsContent}
              accepted={localTermsAccepted}
              onAcceptedChange={handleTermsChange}
              error={termsError ?? undefined}
              checkboxId="invoice-termsAccepted"
            />
          </div>
        ) : null}

        <div className="flex justify-between items-end pt-[30px] gap-4">
          <button
            type="button"
            onClick={onBack}
            className="body-text text-left cursor-pointer"
          >
            Back
          </button>
          <BigButton as="submit" label={submitLabel} mode="navbar" />
        </div>
      </form>
    </div>
  );
};
