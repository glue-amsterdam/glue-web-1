"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getCookieConsent } from "@/app/actions/cookieConsent";
import {
  VisitorAccountStep,
  type VisitorAccountValues,
  type VisitorWorkAreaOption,
} from "@/components/participate/visitor-account-step";
import {
  buildLoginFromSignUpHref,
  parseReturnToParam,
  resolvePostAuthRedirect,
} from "@/lib/auth/post-auth-redirect";

type SignUpVisitorFormProps = {
  workAreas: VisitorWorkAreaOption[];
};

export const SignUpVisitorForm = ({
  workAreas,
}: SignUpVisitorFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const returnTo = parseReturnToParam(searchParams);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSubmit = async (data: VisitorAccountValues) => {
    if (isSubmitting || isRedirecting) return;

    setSubmitError(null);
    setIsSubmitting(true);
    let redirecting = false;

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

      redirecting = true;
      setIsRedirecting(true);
      router.replace(resolvePostAuthRedirect(returnTo));
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      if (!redirecting) {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    router.push(buildLoginFromSignUpHref(returnTo));
  };

  return (
    <>
      <VisitorAccountStep
        workAreas={workAreas}
        submitError={submitError ?? undefined}
        onSubmit={(data) => void handleSubmit(data)}
        onBack={handleBack}
        submitLabel={isSubmitting ? "creating…" : "create account"}
        submitDisabled={isSubmitting || isRedirecting}
        isSubmitting={isSubmitting || isRedirecting}
        loadingMessage="Creating your account…"
      />
    </>
  );
};
