"use client";

import { useState } from "react";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import BigButton from "@/components/big-button";
import { ParticipateFormSelect } from "@/components/participate/participate-form-field";
import type { VisitorWorkAreaOption } from "@/components/participate/visitor-account-step";
import {
  VISITOR_AGE_RANGES,
  VISITOR_AGE_RANGE_LABELS,
} from "@/lib/visitor/visitor-age-ranges";
import {
  visitorCheckInFieldsSchema,
  visitorProfileSchema,
  type VisitorProfileFormState,
} from "@/schemas/visitorSchemas";

const ageRangeOptions = VISITOR_AGE_RANGES.map((range) => ({
  value: range,
  label: VISITOR_AGE_RANGE_LABELS[range],
}));

type VisitorCheckInFormState = {
  birthDate: string;
  areaId: string;
};

const defaultValues: VisitorCheckInFormState = {
  birthDate: "",
  areaId: "",
};

type VisitorCheckInStepProps = {
  workAreas: VisitorWorkAreaOption[];
  initialProfile: VisitorProfileFormState;
  onSubmit: () => void;
  onBack: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  loadingMessage?: string;
};

export const VisitorCheckInStep = ({
  workAreas,
  initialProfile,
  onSubmit,
  onBack,
  submitLabel = "Continue",
  isSubmitting = false,
  loadingMessage = "Saving check-in profile…",
}: VisitorCheckInStepProps) => {
  const [values, setValues] = useState<VisitorCheckInFormState>({
    birthDate: initialProfile.birthDate,
    areaId: initialProfile.areaId,
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof VisitorCheckInFormState, string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const workAreaOptions = workAreas.map((area) => ({
    value: area.id,
    label: area.name,
  }));

  const setField =
    (key: keyof VisitorCheckInFormState) => (value: string) => {
      setValues((prev) => ({ ...prev, [key]: value }));
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    const parsed = visitorCheckInFieldsSchema.safeParse(values);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      const next: Partial<Record<keyof VisitorCheckInFormState, string>> = {};
      (Object.keys(flat) as (keyof VisitorCheckInFormState)[]).forEach(
        (key) => {
          const msg = flat[key]?.[0];
          if (msg) next[key] = msg;
        }
      );
      setFieldErrors(next);
      return;
    }

    setFieldErrors({});
    const profilePayload = visitorProfileSchema.parse({
      ...initialProfile,
      birthDate: parsed.data.birthDate,
      areaId: parsed.data.areaId,
    });

    setIsSaving(true);
    try {
      const response = await fetch("/api/users/visitor-data", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profilePayload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Could not save check-in profile"
        );
      }

      onSubmit();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Could not save check-in profile"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isSubmitting) {
    return (
      <div
        className="max-w-[508px] mx-auto pt-[40px] lg:pt-[60px] pb-[15px] lg:pb-[30px]"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="flex justify-center items-center min-h-[200px] w-full">
          <LoadingSpinner />
        </div>
        <p className="sr-only">{loadingMessage}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="max-w-[508px] lg:max-w-[1045px] mx-auto pt-[40px] lg:pt-[60px] pb-[15px] lg:pb-[30px]"
      noValidate
    >
      <h1 className="title-text pb-[15px]">Check-in profile</h1>
      <p className="base-text-size pb-[30px] max-w-prose">
        Before you continue, tell us your age range and work area for event
        check-in.
      </p>

      {submitError ? (
        <p
          role="alert"
          className="max-w-[508px] mx-auto pb-[15px] base-text-size text-(--primary-color)"
        >
          {submitError}
        </p>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[15px] lg:gap-[30px]">
        <ParticipateFormSelect
          label="Age range"
          name="birthDate"
          required
          value={values.birthDate}
          onChange={setField("birthDate")}
          error={fieldErrors.birthDate}
          options={ageRangeOptions}
        />
        <ParticipateFormSelect
          label="Work area"
          name="areaId"
          required
          value={values.areaId}
          onChange={setField("areaId")}
          error={fieldErrors.areaId}
          options={workAreaOptions}
        />
      </div>

      <div className="flex justify-between pt-[30px] gap-4">
        <button
          type="button"
          onClick={onBack}
          className="base-text-size text-left hover:underline cursor-pointer"
        >
          Back
        </button>
        <BigButton
          as="submit"
          label={isSaving ? "saving…" : submitLabel}
          mode="navbar"
          disabled={isSaving}
        />
      </div>
    </form>
  );
};
