"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getResetPasswordErrorMessage } from "@/lib/auth/reset-password-error-message";
import { createClient } from "@/utils/supabase/client";

const resetPasswordSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address" }),
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

export default function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRecoveryVerified, setIsRecoveryVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const form = useForm<FormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      token: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (session?.user?.email) {
        setIsRecoveryVerified(true);
        form.setValue("email", session.user.email);
        return;
      }

      const token = searchParams.get("token");
      if (token) {
        form.setValue("token", token);
      }
    };

    void init();

    return () => {
      cancelled = true;
    };
  }, [searchParams, form, supabase.auth]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    let recoveryVerified = isRecoveryVerified;

    try {
      if (!recoveryVerified) {
        if (data.token.trim().length !== 6) {
          form.setError("token", {
            message: "Token must be 6 digits",
          });
          return;
        }

        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: data.email,
          token: data.token.trim(),
          type: "recovery",
        });

        if (verifyError) throw verifyError;

        recoveryVerified = true;
        setIsRecoveryVerified(true);
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
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

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
      {successMessage ? (
        <div
          role="status"
          className="text-green-700 text-sm bg-green-100 p-2 rounded"
        >
          {successMessage}
        </div>
      ) : error ? (
        <div role="alert" className="text-red-500 text-sm bg-red-100 p-2 rounded">
          {error}
        </div>
      ) : null}

      {isRecoveryVerified && !successMessage ? (
        <p className="text-sm text-gray-600">
          Reset link verified. Enter a new password below.
        </p>
      ) : null}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    readOnly={isRecoveryVerified}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="token"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormLabel>Reset Token</FormLabel>
                <FormControl>
                  <Input type="text" {...field} readOnly />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
