"use client";

import { useState } from "react";
import { z } from "zod";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import BigButton from "@/components/big-button";
import {
  ParticipateFormField,
  ParticipateFormSelect,
} from "@/components/participate/participate-form-field";
import {
  VISITOR_AGE_RANGES,
  VISITOR_AGE_RANGE_LABELS,
} from "@/lib/visitor/visitor-age-ranges";
import {
  visitorParticipantAccountSchema,
  visitorRegisterSchema,
  type VisitorParticipantAccountValues,
} from "@/schemas/visitorSchemas";

export type VisitorAccountValues = z.infer<typeof visitorRegisterSchema>;

export type VisitorWorkAreaOption = {
  id: string;
  name: string;
};

type VisitorAccountFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: string;
  areaId: string;
  newsletterSubscribe: boolean;
};

const defaultAccountValues: VisitorAccountFormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  birthDate: "",
  areaId: "",
  newsletterSubscribe: true,
};

const ageRangeOptions = VISITOR_AGE_RANGES.map((range) => ({
  value: range,
  label: VISITOR_AGE_RANGE_LABELS[range],
}));

const mapZodFieldErrors = (
  flat: Partial<Record<string, string[] | undefined>>
): Partial<Record<keyof VisitorAccountFormState, string>> => {
  const next: Partial<Record<keyof VisitorAccountFormState, string>> = {};
  for (const key of Object.keys(flat) as (keyof VisitorAccountFormState)[]) {
    const msg = flat[key]?.[0];
    if (msg) next[key] = msg;
  }
  return next;
};

type VisitorAccountStepBaseProps = {
  onBack: () => void;
  initialValues?: Partial<VisitorAccountFormState>;
  submitError?: string;
  submitLabel?: string;
  backLabel?: string;
  submitDisabled?: boolean;
  isSubmitting?: boolean;
  loadingMessage?: string;
};

type VisitorAccountStepWithCheckInProps = VisitorAccountStepBaseProps & {
  requireCheckInFields?: true;
  workAreas: VisitorWorkAreaOption[];
  onSubmit: (data: VisitorAccountValues) => void;
};

type VisitorAccountStepWithoutCheckInProps = VisitorAccountStepBaseProps & {
  requireCheckInFields: false;
  workAreas?: VisitorWorkAreaOption[];
  onSubmit: (data: VisitorParticipantAccountValues) => void;
};

type VisitorAccountStepProps =
  | VisitorAccountStepWithCheckInProps
  | VisitorAccountStepWithoutCheckInProps;

export const VisitorAccountStep = ({
  workAreas = [],
  onSubmit,
  onBack,
  initialValues,
  submitError,
  submitLabel = "submit application",
  backLabel = "Already have an account, Login here.",
  submitDisabled = false,
  isSubmitting = false,
  loadingMessage = "Submitting…",
  ...rest
}: VisitorAccountStepProps) => {
  const requireCheckInFields = rest.requireCheckInFields !== false;

  const [values, setValues] = useState<VisitorAccountFormState>({
    ...defaultAccountValues,
    ...initialValues,
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof VisitorAccountFormState, string>>
  >({});

  const workAreaOptions = workAreas.map((area) => ({
    value: area.id,
    label: area.name,
  }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (requireCheckInFields) {
      const parsed = visitorRegisterSchema.safeParse(values);
      if (!parsed.success) {
        setFieldErrors(mapZodFieldErrors(parsed.error.flatten().fieldErrors));
        return;
      }
      setFieldErrors({});
      (onSubmit as VisitorAccountStepWithCheckInProps["onSubmit"])(parsed.data);
      return;
    }

    const { birthDate: _birthDate, areaId: _areaId, ...participantValues } =
      values;
    const parsed = visitorParticipantAccountSchema.safeParse(participantValues);
    if (!parsed.success) {
      setFieldErrors(mapZodFieldErrors(parsed.error.flatten().fieldErrors));
      return;
    }
    setFieldErrors({});
    (onSubmit as VisitorAccountStepWithoutCheckInProps["onSubmit"])(parsed.data);
  };

  const setField =
    (key: keyof VisitorAccountFormState) => (value: string) => {
      setValues((prev) => ({ ...prev, [key]: value }));
    };

  const handleNewsletterChange = (checked: boolean) => {
    setValues((prev) => ({ ...prev, newsletterSubscribe: checked }));
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
      onSubmit={handleSubmit}
      className="max-w-[508px] lg:max-w-[1045px] mx-auto pt-[40px] lg:pt-[60px] pb-[15px] lg:pb-[30px]"
      noValidate
    >
      <h1 className="title-text pb-[30px]">Create Account</h1>
      {submitError ? (
        <p
          role="alert"
          className="max-w-[508px] mx-auto pb-[15px] base-text-size text-(--primary-color)"
        >
          {submitError}
        </p>
      ) : null}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[15px] lg:gap-[30px]">
        <ParticipateFormField
          label="First name"
          name="firstName"
          required
          value={values.firstName}
          onChange={setField("firstName")}
          error={fieldErrors.firstName}
          autoComplete="given-name"
        />
        <ParticipateFormField
          label="Last name"
          name="lastName"
          required
          value={values.lastName}
          onChange={setField("lastName")}
          error={fieldErrors.lastName}
          autoComplete="family-name"
        />
        <ParticipateFormField
          label="Email Address"
          name="email"
          type="email"
          required
          value={values.email}
          onChange={setField("email")}
          error={fieldErrors.email}
          autoComplete="email"
        />
        <ParticipateFormField
          label="Password"
          name="password"
          type="password"
          required
          value={values.password}
          onChange={setField("password")}
          error={fieldErrors.password}
          autoComplete="new-password"
        />
        {requireCheckInFields ? (
          <>
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
          </>
        ) : null}

        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="newsletterSubscribe"
              checked={values.newsletterSubscribe}
              onChange={(event) => handleNewsletterChange(event.target.checked)}
              className="size-[12px] shrink-0 border border-(--black-color) accent-(--primary-color)"
            />
            <label
              htmlFor="newsletterSubscribe"
              className="cursor-pointer mini-text-size"
            >
              Subscribe to newsletter
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-[30px] gap-4">
        <button
          type="button"
          onClick={onBack}
          className={
            backLabel.includes("Login")
              ? "base-text-size text-left max-w-[155px] lg:max-w-none hover:underline cursor-pointer"
              : "base-text-size text-left hover:underline cursor-pointer"
          }
        >
          {backLabel}
        </button>
        <BigButton
          as="submit"
          label={submitLabel}
          mode="navbar"
          disabled={submitDisabled}
        />
      </div>
    </form>
  );
};
