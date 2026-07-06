"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getCookieConsent } from "@/app/actions/cookieConsent";
import {
  VisitorAccountStep,
  type VisitorAccountValues,
  type VisitorWorkAreaOption,
} from "@/components/participate/visitor-account-step";
import { redirectToDashboardHome } from "@/lib/users/redirect-to-dashboard-home";
import { fetchNavbarIdentity } from "@/lib/users/fetch-navbar-identity";
import {
  buildLoginHref,
  parseCancelToParam,
  parseEmailParam,
  parseReturnToParam,
  resolveCancelTo,
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
  const hasRedirectedRef = useRef(false);
  const { user, isLoading: isAuthLoading, login } = useAuth();
  const returnTo = parseReturnToParam(searchParams);
  const cancelTo = resolveCancelTo(parseCancelToParam(searchParams));
  const prefilledEmail = parseEmailParam(searchParams);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const redirectAfterAuth = (loggedInUserId: string, dashboardHref: string | null) => {
    if (hasRedirectedRef.current) {
      return;
    }

    setIsRedirecting(true);

    if (returnTo) {
      hasRedirectedRef.current = true;
      router.replace(resolvePostAuthRedirect(returnTo));
      return;
    }

    redirectToDashboardHome({
      router,
      userId: loggedInUserId,
      hasRedirectedRef,
      href: dashboardHref,
    });
  };

  useEffect(() => {
    if (isAuthLoading || !user || hasRedirectedRef.current) {
      return;
    }

    setIsRedirecting(true);

    const redirectExistingSession = async () => {
      if (returnTo) {
        hasRedirectedRef.current = true;
        router.replace(resolvePostAuthRedirect(returnTo));
        return;
      }

      const identity = await fetchNavbarIdentity();
      redirectToDashboardHome({
        router,
        userId: user.id,
        hasRedirectedRef,
        href: identity?.dashboardHref,
      });
    };

    void redirectExistingSession();
  }, [user, isAuthLoading, router, returnTo]);

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
        const { user: loggedInUser, dashboardHref } = await login(
          data.email,
          data.password,
        );
        redirecting = true;
        redirectAfterAuth(loggedInUser.id, dashboardHref);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Account created but sign-in failed. Please log in manually.";
        setSubmitError(message);
        return;
      }
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      if (!redirecting) {
        setIsSubmitting(false);
      }
    }
  };

  const loginHref = buildLoginHref({
    email: prefilledEmail,
    returnTo,
    cancelTo,
  });

  const showSpinner =
    isAuthLoading || isSubmitting || isRedirecting || user !== null;

  return (
    <>
      <VisitorAccountStep
        workAreas={workAreas}
        submitError={submitError ?? undefined}
        onSubmit={(data) => void handleSubmit(data)}
        showBackButton={false}
        initialValues={{ email: prefilledEmail ?? "" }}
        submitLabel={isSubmitting ? "creating…" : "create account"}
        submitDisabled={showSpinner}
        isSubmitting={showSpinner}
        loadingMessage="Creating your account…"
        loginHref={loginHref}
      />
    </>
  );
};
