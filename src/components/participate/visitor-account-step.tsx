"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import BigButton from "@/components/big-button";
import { ParticipateFormField } from "@/components/participate/participate-form-field";
import { TermsContent } from "@/components/terms-content";
import { visitorRegisterSchema } from "@/schemas/visitorSchemas";

export type VisitorAccountValues = z.infer<typeof visitorRegisterSchema>;

const defaultAccountValues: VisitorAccountValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  termsAccepted: true,
  newsletterSubscribe: true,
};

type VisitorAccountStepProps = {
  onSubmit: (data: VisitorAccountValues) => void;
  onBack: () => void;
  initialValues?: Partial<VisitorAccountValues>;
  submitError?: string;
  submitLabel?: string;
  backLabel?: string;
  submitDisabled?: boolean;
  isSubmitting?: boolean;
  loadingMessage?: string;
  termsContent?: string;
};

export const VisitorAccountStep = ({
  onSubmit,
  onBack,
  initialValues,
  submitError,
  backLabel = "back",
  submitLabel = "submit application",
  submitDisabled = false,
  isSubmitting = false,
  loadingMessage = "Submitting…",
  termsContent = "",
}: VisitorAccountStepProps) => {
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);
  const [values, setValues] = useState<VisitorAccountValues>({
    ...defaultAccountValues,
    ...initialValues,
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof VisitorAccountValues, string>>
  >({});

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = visitorRegisterSchema.safeParse(values);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      const next: Partial<Record<keyof VisitorAccountValues, string>> = {};
      (Object.keys(flat) as (keyof VisitorAccountValues)[]).forEach((key) => {
        const msg = flat[key]?.[0];
        if (msg) next[key] = msg;
      });
      setFieldErrors(next);
      return;
    }
    setFieldErrors({});
    onSubmit(parsed.data);
  };

  const setField =
    (key: keyof VisitorAccountValues) => (value: string) => {
      setValues((prev) => ({ ...prev, [key]: value }));
    };

  const setBooleanField =
    (key: "termsAccepted" | "newsletterSubscribe") => (checked: boolean) => {
      setValues((prev) => ({ ...prev, [key]: checked }));
    };

  const handleOpenTerms = () => {
    setIsTermsDialogOpen(true);
  };

  const handleCloseTerms = () => {
    setIsTermsDialogOpen(false);
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
    <form onSubmit={handleSubmit} className="max-w-[508px] mx-auto pt-[40px] lg:pt-[60px] pb-[15px] lg:pb-[30px]" noValidate>
      {submitError ? (
        <p
          role="alert"
          className="max-w-[508px] mx-auto pb-[15px] base-text-size text-(--primary-color)"
        >
          {submitError}
        </p>
      ) : null}
      <div className="flex flex-col gap-[15px] md:gap-[30px]">
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



        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="termsAccepted"
              checked={values.termsAccepted}
              onChange={(event) =>
                setBooleanField("termsAccepted")(event.target.checked)
              }
              className="size-[12px] shrink-0 border border-(--black-color) accent-(--primary-color)"
              aria-invalid={Boolean(fieldErrors.termsAccepted)}
              aria-describedby={
                fieldErrors.termsAccepted ? "termsAccepted-error" : undefined
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


          {fieldErrors.termsAccepted ? (
            <p
              id="termsAccepted-error"
              role="alert"
              className="text-[12px] text-(--primary-color)"
            >
              {fieldErrors.termsAccepted}
            </p>
          ) : null}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="newsletterSubscribe"
              checked={values.newsletterSubscribe}
              onChange={(event) =>
                setBooleanField("newsletterSubscribe")(event.target.checked)
              }
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
        <button type="button" onClick={onBack} className="base-text-size text-left max-w-[155px] lg:max-w-none hover:underline cursor-pointer">
          Already have an account, Login here.
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
