"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { getCookieConsent } from "@/app/actions/cookieConsent";
import {
  VisitorAccountStep,
  type VisitorAccountValues,
} from "@/components/participate/visitor-account-step";
import {
  buildLoginFromSignUpHref,
  parseReturnToParam,
  resolvePostAuthRedirect,
} from "@/lib/auth/post-auth-redirect";

export const SignUpVisitorForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const returnTo = parseReturnToParam(searchParams);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: VisitorAccountValues) => {
    if (isSubmitting) return;

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/visitors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setSubmitError(
          typeof result.error === "string"
            ? result.error
            : "Registration failed. Please try again.",
        );
        return;
      }

      const hasConsent = await getCookieConsent();
      if (!hasConsent) {
        setSubmitError(
          "Cookie consent is required to continue. Please enable cookies.",
        );
        return;
      }

      try {
        await login(data.email, data.password);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Account created but sign-in failed. Please log in manually.";
        setSubmitError(message);
        return;
      }

      router.replace(resolvePostAuthRedirect(returnTo));
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push(buildLoginFromSignUpHref(returnTo));
  };

  return (
    <div className="pt-[80px]">
      {submitError ? (
        <p
          role="alert"
          className="max-w-[508px] mx-auto pb-[15px] base-text-size text-[var(--primary-color)]"
        >
          {submitError}
        </p>
      ) : null}

      <VisitorAccountStep
        onSubmit={(data) => void handleSubmit(data)}
        onBack={handleBack}
        submitLabel={isSubmitting ? "creating account…" : "create account"}
        backLabel="back"
        submitDisabled={isSubmitting}
      />
    </div>
  );
};
