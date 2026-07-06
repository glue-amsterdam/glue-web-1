"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import BigButton from "@/components/big-button";
import { AuthPageHeadline } from "@/components/auth/auth-page-headline";
import { ParticipateFormField } from "@/components/participate/participate-form-field";
import {
  buildLoginHref,
  buildParticipateFromAccountHref,
  buildSignUpFromAccountHref,
  parseCancelToParam,
  parseReturnToParam,
  resolveCancelTo,
} from "@/lib/auth/post-auth-redirect";
import { navigateWithHashHref } from "@/lib/navigation/hash-route";

const emailSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
});

type AccountWizardStep = "email" | "type";

const formWrapperClassName = "title-padding w-full lg:max-w-(--field-max-width) lg:mx-auto";

const accountTypeOptions = [
  {
    id: "visitor" as const,
    title: "Sign up as a visitor",
    description:
      "If you would like to visit the GLUE design route, please sign up here.",
    buttonLabel: "visitor",
  },
  {
    id: "participant" as const,
    title: "Sign up as a participant",
    description:
      "If you would like to participate in the GLUE design route, please sign up here.",
    buttonLabel: "participant",
  },
];

export const AccountWizard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = parseReturnToParam(searchParams);
  const cancelTo = resolveCancelTo(parseCancelToParam(searchParams));

  const [step, setStep] = useState<AccountWizardStep>("email");
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isChecking) return;

    setFieldError(null);
    setSubmitError(null);

    const parsed = emailSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldError(parsed.error.flatten().fieldErrors.email?.[0] ?? "Invalid email");
      return;
    }

    const normalizedEmail = parsed.data.email.toLowerCase();
    setIsChecking(true);

    try {
      const response = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setSubmitError(
          typeof result.error === "string"
            ? result.error
            : "Could not verify email. Please try again.",
        );
        return;
      }

      if (result.exists) {
        router.push(
          buildLoginHref({ email: normalizedEmail, returnTo, cancelTo }),
        );
        return;
      }

      setEmail(normalizedEmail);
      setStep("type");
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleSelectVisitor = () => {
    router.push(
      buildSignUpFromAccountHref({ email, returnTo, cancelTo }),
    );
  };

  const handleSelectParticipant = () => {
    navigateWithHashHref(
      router,
      buildParticipateFromAccountHref({ email, cancelTo }),
      "push",
    );
  };

  if (step === "type") {
    return (
      <div className="flex flex-col">
        <AuthPageHeadline title="Account" />
        <div className="title-padding flex flex-col lg:pb-[60px]">
          {accountTypeOptions.map((option, index) => (
            <div
              key={option.id}
              className={
                index === 0
                  ? ""
                  : "pt-[100px]"
              }
            >
              <div className="flex flex-col gap-[40px] lg:gap-[60px] main-boder-top max-w-(--field-max-width) mx-auto">

                <h2 className="small-title-text pt-[15px]">
                  {option.title.toUpperCase()}</h2>
                <p className="body-text">
                  {option.description}
                </p>
                <div className="shrink-0 self-center lg:self-end">
                  <BigButton
                    as="button"
                    label={option.buttonLabel}
                    mode="navbar"
                    onClick={
                      option.id === "visitor"
                        ? handleSelectVisitor
                        : handleSelectParticipant
                    }
                    aria-label={
                      option.id === "visitor"
                        ? "Sign up as a visitor"
                        : "Sign up as a participant"
                    }
                  />
                </div>
              </div>
            </div>


          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <AuthPageHeadline title="Account" />
      <div className={formWrapperClassName}>
        <form
          id="account-email-form"
          onSubmit={(event) => void handleEmailSubmit(event)}
          className="flex flex-col gap-[15px] md:gap-[30px] w-full"
          noValidate
        >
          <p className="sr-only">Enter your email to continue</p>

          {submitError ? (
            <p role="alert" className="body-text">
              {submitError}
            </p>
          ) : null}

          <ParticipateFormField
            label="Email Address"
            name="email"
            type="email"
            required
            error={fieldError ?? undefined}
            autoComplete="email"
            value={email}
            onChange={setEmail}
          />

          <div className="flex justify-end pt-[15px] pb-[5px]">
            <BigButton
              as="submit"
              label={isChecking ? "checking…" : "next step"}
              mode="navbar"
              disabled={isChecking}
            />
          </div>
        </form>
      </div>
    </div>
  );
};
