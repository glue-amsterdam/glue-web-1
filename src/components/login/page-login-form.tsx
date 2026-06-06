"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useAuth } from "@/app/context/AuthContext";
import { getCookieConsent } from "@/app/actions/cookieConsent";
import { CookieSettingsModal } from "@/components/cookies/cookies-modal";
import BigButton from "@/components/big-button";
import { ParticipateFormField } from "@/components/participate/participate-form-field";
import { fetchDashboardHomeHref } from "@/lib/users/fetch-dashboard-home";
import { redirectToDashboardHome } from "@/lib/users/redirect-to-dashboard-home";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import {
  parseReturnToParam,
  resolvePostAuthRedirect,
} from "@/lib/auth/post-auth-redirect";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(1, "Password is required"),
});

const resetPasswordSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
});

type LoginFieldName = keyof z.infer<typeof loginSchema>;
type ResetFieldName = keyof z.infer<typeof resetPasswordSchema>;

const formWrapperClassName = "pt-[160px] lg:pt-[100px] w-full lg:max-w-[508px] lg:mx-auto";

const PageLoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRedirectedRef = useRef(false);
  const returnTo = parseReturnToParam(searchParams);

  const { user, isLoading: isAuthLoading, login, loginError, clearLoginError } =
    useAuth();

  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [loginFieldErrors, setLoginFieldErrors] = useState<
    Partial<Record<LoginFieldName, string>>
  >({});
  const [resetFieldErrors, setResetFieldErrors] = useState<
    Partial<Record<ResetFieldName, string>>
  >({});

  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);

  const [cookieError, setCookieError] = useState<string | null>(null);
  const [isCookieSettingsOpen, setIsCookieSettingsOpen] = useState(false);

  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(
    null,
  );
  const [resetSubmitError, setResetSubmitError] = useState<string | null>(null);
  const [memberEmail, setMemberEmail] = useState("");

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

      const href = await fetchDashboardHomeHref();
      redirectToDashboardHome({
        router,
        userId: user.id,
        hasRedirectedRef,
        href,
      });
    };
    void redirectExistingSession();
  }, [user, isAuthLoading, router, returnTo]);

  const handleMemberLoginSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    clearLoginError();
    setCookieError(null);
    setLoginFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const values = {
      email: formData.get("email")?.toString(),
      password: formData.get("password")?.toString(),
    };

    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      const flattenedErrors = parsed.error.flatten().fieldErrors;
      const nextFieldErrors: Partial<Record<LoginFieldName, string>> = {};
      (Object.keys(flattenedErrors) as LoginFieldName[]).forEach((fieldName) => {
        const message = flattenedErrors[fieldName]?.[0];
        if (message) nextFieldErrors[fieldName] = message;
      });
      setLoginFieldErrors(nextFieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const hasConsent = await getCookieConsent();
      if (!hasConsent) {
        setCookieError(
          "Cookie consent is required to log in. Please enable cookies.",
        );
        return;
      }

      const { user: loggedInUser, dashboardHref } = await login(
        parsed.data.email,
        parsed.data.password,
      );
      setIsRedirecting(true);

      if (returnTo) {
        hasRedirectedRef.current = true;
        router.replace(resolvePostAuthRedirect(returnTo));
        return;
      }

      redirectToDashboardHome({
        router,
        userId: loggedInUser.id,
        hasRedirectedRef,
        href: dashboardHref,
      });
    } catch (error) {
      console.error("Failed to log in:", error);
      setIsRedirecting(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setResetSubmitError(null);
    setResetSuccessMessage(null);
    setResetFieldErrors({});

    const formData = new FormData(formElement);
    const values = {
      email: formData.get("email")?.toString(),
    };

    const parsed = resetPasswordSchema.safeParse(values);
    if (!parsed.success) {
      const flattenedErrors = parsed.error.flatten().fieldErrors;
      const nextFieldErrors: Partial<Record<ResetFieldName, string>> = {};
      (Object.keys(flattenedErrors) as ResetFieldName[]).forEach((fieldName) => {
        const message = flattenedErrors[fieldName]?.[0];
        if (message) nextFieldErrors[fieldName] = message;
      });
      setResetFieldErrors(nextFieldErrors);
      return;
    }

    setIsResetLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: parsed.data.email }),
      });
      const dataRes = await response.json().catch(() => ({}));

      if (!response.ok) {
        setResetSubmitError(
          typeof dataRes?.error === "string"
            ? dataRes.error
            : "Failed to send reset email. Please try again.",
        );
        return;
      }

      setResetSubmitError(null);
      setResetSuccessMessage(
        "Password reset email sent. Please check your inbox.",
      );
      formElement.reset();
    } catch (error) {
      console.error("Error sending password reset email:", error);
      setResetSubmitError(
        "Failed to send password reset email. Please try again.",
      );
    } finally {
      setIsResetLoading(false);
    }
  };

  const showSpinner =
    isAuthLoading || isLoading || isRedirecting || user !== null;

  if (showSpinner) {
    return (
      <div
        className={formWrapperClassName}
        aria-busy="true"
        aria-live="polite"
      >
        <div className="flex justify-center items-center min-h-[200px] w-full">
          <LoadingSpinner />
        </div>
        <p className="sr-only">Signing you in…</p>
      </div>
    );
  }

  if (isResetPasswordOpen) {
    return (
      <div className={formWrapperClassName}>
        <button
          type="button"
          onClick={() => {
            setIsResetPasswordOpen(false);
            setResetSubmitError(null);
            setResetSuccessMessage(null);
            setResetFieldErrors({});
          }}
          className="base-text-size cursor-pointer"
          aria-label="Back to log in form"
        >
          Back
        </button>

        <form
          id="login-reset-password-form"
          onSubmit={handleResetPasswordSubmit}
          className="pt-[40px] flex flex-col gap-[15px] md:gap-[30px]"
          noValidate
        >
          <p className="base-text-size lg:max-w-(--paragraph-max-width)">
            Enter your email to receive a password reset link.
          </p>

          <ParticipateFormField
            label="Email Address"
            name="email"
            type="email"
            required
            error={resetFieldErrors.email}
            autoComplete="email"
          />

          {resetSuccessMessage ? (
            <p role="status" className="base-text-size]">
              {resetSuccessMessage}
            </p>
          ) : resetSubmitError ? (
            <p role="alert" className="base-text-size]">
              {resetSubmitError}
            </p>
          ) : null}

          <div className="flex justify-end pt-[15px] pb-[5px]">
            <BigButton
              as="submit"
              label={isResetLoading ? "sending…" : "send reset link"}
              mode="navbar"
              disabled={isResetLoading}
            />
          </div>
        </form>
      </div>
    );
  }



  return (
    <>
      <div className={formWrapperClassName}>
        <form
          id="login-form"
          onSubmit={handleMemberLoginSubmit}
          className="flex flex-col gap-[15px] md:gap-[30px] w-full"
          noValidate
        >
          <p className="sr-only">Log in to your account</p>

          {loginError ? (
            <p role="alert" className="base-text-size]">
              {loginError}
            </p>
          ) : null}

          {cookieError ? (
            <div role="alert" className="flex flex-col gap-[10px]">
              <p className="base-text-size">
                {cookieError}
              </p>
              <button
                type="button"
                onClick={() => setIsCookieSettingsOpen(true)}
                className="base-text-size text-left hover:underline"
                aria-label="Open cookie settings"
              >
                Change cookie settings
              </button>
            </div>
          ) : null}

          <ParticipateFormField
            label="Email Address"
            name="email"
            type="email"
            required
            error={loginFieldErrors.email}
            autoComplete="email"
            value={memberEmail}
            onChange={setMemberEmail}
          />

          <ParticipateFormField
            label="Password"
            name="password"
            type="password"
            required
            error={loginFieldErrors.password}
            autoComplete="current-password"
          />

          <div className="flex justify-between pt-[15px] flex-wrap">
            <button
              type="button"
              onClick={() => setIsResetPasswordOpen(true)}
              className="base-text-size hover:underline text-right cursor-pointer"
              aria-label="Forgot your password"
            >
              Forgot your password?
            </button>
            <BigButton
              as="submit"
              label={isLoading ? "logging..." : "log in"}
              mode="navbar"
              disabled={isLoading}
            />
          </div>


        </form>
      </div>

      <CookieSettingsModal
        isOpen={isCookieSettingsOpen}
        onClose={() => setIsCookieSettingsOpen(false)}
      />
    </>
  );
};

export default PageLoginForm;
