"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import BigButton from "@/components/big-button";
import { ParticipateFormField } from "@/components/participate/participate-form-field";
import { getResetPasswordErrorMessage } from "@/lib/auth/reset-password-error-message";
import { createClient } from "@/utils/supabase/client";

const resetPasswordSchema = z
  .object({
    email: z.string().trim().email({ message: "Invalid email address" }),
    token: z.string(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof resetPasswordSchema>;
type FieldName = keyof FormData;

const defaultValues: FormData = {
  email: "",
  token: "",
  password: "",
  confirmPassword: "",
};

const formWrapperClassName = "pt-[100px] w-full lg:max-w-[508px] lg:mx-auto";

const mapZodFieldErrors = (
  flat: Partial<Record<string, string[] | undefined>>,
): Partial<Record<FieldName, string>> => {
  const next: Partial<Record<FieldName, string>> = {};
  for (const key of Object.keys(flat) as FieldName[]) {
    const message = flat[key]?.[0];
    if (message) next[key] = message;
  }
  return next;
};

export default function ResetPasswordForm() {
  const [values, setValues] = useState<FormData>(defaultValues);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<FieldName, string>>
  >({});
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecoveryVerified, setIsRecoveryVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (session?.user?.email) {
        setIsRecoveryVerified(true);
        setValues((prev) => ({ ...prev, email: session.user.email ?? "" }));
        setIsInitializing(false);
        return;
      }

      const token = searchParams.get("token");
      if (token) {
        setValues((prev) => ({ ...prev, token }));
      }

      setIsInitializing(false);
    };

    void init();

    return () => {
      cancelled = true;
    };
  }, [searchParams, supabase.auth]);

  const setField = (key: FieldName) => (value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setFieldErrors({});

    let recoveryVerified = isRecoveryVerified;

    try {
      if (!recoveryVerified) {
        if (values.token.trim().length !== 6) {
          setFieldErrors({ token: "Token must be 6 digits" });
          return;
        }

        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: values.email,
          token: values.token.trim(),
          type: "recovery",
        });

        if (verifyError) throw verifyError;

        recoveryVerified = true;
        setIsRecoveryVerified(true);
      }

      const parsed = resetPasswordSchema.safeParse(values);
      if (!parsed.success) {
        setFieldErrors(mapZodFieldErrors(parsed.error.flatten().fieldErrors));
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: parsed.data.password,
      });

      if (updateError) throw updateError;

      setSuccessMessage("Password updated successfully. Redirecting…");
      router.push("/");
    } catch (submitError) {
      console.error("Error resetting password:", submitError);
      setError(
        getResetPasswordErrorMessage(submitError, {
          isRecoveryVerified: recoveryVerified,
        }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div
        className={formWrapperClassName}
        aria-busy="true"
        aria-live="polite"
      >
        <div className="flex justify-center items-center min-h-[200px] w-full">
          <LoadingSpinner />
        </div>
        <p className="sr-only">Loading reset password form…</p>
      </div>
    );
  }

  return (
    <div className={formWrapperClassName}>
      {successMessage ? (
        <p role="status" className="base-text-size">
          {successMessage}
        </p>
      ) : error ? (
        <p role="alert" className="base-text-size text-(--primary-color)">
          {error}
        </p>
      ) : null}

      {isRecoveryVerified && !successMessage ? (
        <p className="base-text-size lg:max-w-(--paragraph-max-width) pt-[40px]">
          Reset link verified. Enter a new password below.
        </p>
      ) : null}

      <form
        id="reset-password-form"
        onSubmit={handleSubmit}
        className="pt-[40px] flex flex-col gap-[15px] md:gap-[30px]"
        noValidate
      >
        <ParticipateFormField
          label="Email Address"
          name="email"
          type="email"
          required
          value={values.email}
          onChange={setField("email")}
          error={fieldErrors.email}
          autoComplete="email"
          disabled={isRecoveryVerified}
        />

        <ParticipateFormField
          label="New Password"
          name="password"
          type="password"
          required
          value={values.password}
          onChange={setField("password")}
          error={fieldErrors.password}
          autoComplete="new-password"
        />

        <ParticipateFormField
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          required
          value={values.confirmPassword}
          onChange={setField("confirmPassword")}
          error={fieldErrors.confirmPassword}
          autoComplete="new-password"
        />

        <div className="flex justify-end pt-[15px] pb-[5px]">
          <BigButton
            as="submit"
            label={isLoading ? "resetting…" : "reset password"}
            mode="navbar"
            disabled={isLoading}
          />
        </div>
      </form>
    </div>
  );
}
