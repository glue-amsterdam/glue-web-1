"use client";

import { useEffect, useState } from "react";
import BigButton from "@/components/big-button";
import { MapInfoFields } from "@/components/participate/map-info-fields";
import { TermsContent } from "@/components/terms-content";
import { MapInfoInput, mapInfoSchema } from "@/schemas/mapInfoSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type Control, type UseFormSetValue } from "react-hook-form";
import { z } from "zod";

const mapInfoStepSchema = mapInfoSchema.extend({
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the General terms and conditions",
  }),
});

export type MapInfoStepInput = z.input<typeof mapInfoStepSchema>;
export type MapInfoStepValues = z.output<typeof mapInfoStepSchema>;

type MapInfoStepProps = {
  onSubmit: (data: MapInfoStepValues) => void;
  onBack: () => void;
  defaultValues?: Partial<MapInfoStepValues>;
  submitLabel?: string;
  termsContent: string;
};

export const MapInfoStep = ({
  onSubmit,
  onBack,
  defaultValues,
  submitLabel = "Next Step",
  termsContent,
}: MapInfoStepProps) => {
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<MapInfoStepInput, unknown, MapInfoStepValues>({
    resolver: zodResolver(mapInfoStepSchema),
    defaultValues: {
      no_address: defaultValues?.no_address ?? false,
      formatted_address: defaultValues?.formatted_address ?? null,
      latitude: defaultValues?.latitude ?? null,
      longitude: defaultValues?.longitude ?? null,
      exhibition_space_preference:
        defaultValues?.exhibition_space_preference ?? null,
      termsAccepted: defaultValues?.termsAccepted ?? false,
    },
  });

  useEffect(() => {
    if (!isTermsDialogOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsTermsDialogOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isTermsDialogOpen]);

  const handleOpenTerms = () => {
    setIsTermsDialogOpen(true);
  };

  const handleCloseTerms = () => {
    setIsTermsDialogOpen(false);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-[508px] lg:max-w-[1045px] mx-auto pt-[40px] lg:pt-[60px] pb-[15px] lg:pb-[30px]"
      noValidate
    >
      <MapInfoFields
        control={control as unknown as Control<MapInfoInput>}
        setValue={setValue as unknown as UseFormSetValue<MapInfoInput>}
        errors={errors}
      />

      <div className="flex flex-col gap-4 pt-[15px] lg:pt-[30px]">
        <Controller
          name="termsAccepted"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="termsAccepted"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                  className="size-[12px] shrink-0 border border-(--black-color) accent-(--primary-color)"
                  aria-invalid={Boolean(errors.termsAccepted)}
                  aria-describedby={
                    errors.termsAccepted ? "termsAccepted-error" : undefined
                  }
                />
                <label
                  htmlFor="termsAccepted"
                  className="cursor-pointer mini-text-size"
                >
                  I accept the{" "}
                  <button
                    type="button"
                    onClick={handleOpenTerms}
                    className="text-(--primary-color) underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                    tabIndex={0}
                    aria-label="Open General terms and conditions"
                  >
                    General terms and conditions
                  </button>
                </label>
              </div>

              {errors.termsAccepted ? (
                <p
                  id="termsAccepted-error"
                  role="alert"
                  className="text-[12px] text-(--primary-color)"
                >
                  {errors.termsAccepted.message}
                </p>
              ) : null}
            </div>
          )}
        />
      </div>

      {isTermsDialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="terms-dialog-title"
          aria-describedby="terms-dialog-description"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            onClick={handleCloseTerms}
            aria-label="Close terms and conditions"
            tabIndex={-1}
          />
          <div className="relative z-10 w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-(--white-color) border border-(--black-color) p-4">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={handleCloseTerms}
                className="cursor-pointer p-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                aria-label="Close"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M2.00007 0.999993L11.1925 10.1924" stroke="black" />
                  <path d="M2 10.1914L11.1924 0.999019" stroke="black" />
                </svg>
              </button>
            </div>
            <h2 id="terms-dialog-title" className="sr-only">
              General Terms and Conditions
            </h2>
            <p id="terms-dialog-description" className="sr-only">
              Please read the following terms and conditions carefully.
            </p>
            <TermsContent content={termsContent} />
          </div>
        </div>
      ) : null}

      <div className="flex justify-between pt-[30px] gap-4">
        <button
          type="button"
          onClick={onBack}
          className="base-text-size text-left hover:underline cursor-pointer"
        >
          Back
        </button>
        <BigButton as="submit" label={submitLabel} mode="navbar" />
      </div>
    </form>
  );
};
