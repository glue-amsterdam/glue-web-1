"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import BigButton from "@/components/big-button";
import { ParticipateFormField } from "@/components/participate/participate-form-field";
import {
  invoiceDataTypeSchema,
  type InvoiceDataType,
} from "@/schemas/invoiceSchemas";

type InvoiceStepProps = {
  onSubmit: (data: InvoiceDataType) => void;
  onBack: () => void;
  defaultValues?: Partial<InvoiceDataType>;
};

export const InvoiceStep = ({
  onSubmit,
  onBack,
  defaultValues,
}: InvoiceStepProps) => {
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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-[508px] lg:max-w-[1045px] mx-auto pt-[40px] lg:pt-[60px] pb-[15px] lg:pb-[30px]"
      noValidate
    >
      <h1 className="title-text pb-[30px] uppercase">Invoice Information</h1>
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
      <div className="flex justify-between pt-[30px] gap-4 pb-(--site-footer-h) lg:pb-0">
        <button
          type="button"
          onClick={onBack}
          className="base-text-size text-left hover:underline cursor-pointer"
        >
          Back
        </button>
        <BigButton as="submit" label="Next Step" mode="navbar" />
      </div>
    </form>
  );
};
