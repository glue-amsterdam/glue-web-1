"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Loader2, Settings, ArrowLeft } from "lucide-react";
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
import { getCookieConsent } from "@/app/actions/cookieConsent";
import { CookieSettingsModal } from "@/components/cookies/cookies-modal";

const emailSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
});

type EmailFormValues = z.infer<typeof emailSchema>;

type LoginVisitorReturnFormProps = {
  isOpen: boolean;
  onBack: () => void;
  onSessionRestored: () => void | Promise<void>;
};

export const LoginVisitorReturnForm = ({
  isOpen,
  onBack,
  onSessionRestored,
}: LoginVisitorReturnFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [cookieError, setCookieError] = useState<string | null>(null);
  const [isCookieSettingsOpen, setIsCookieSettingsOpen] = useState(false);

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset({ email: "" });
      setErrorMessage(null);
      setUnverifiedEmail(null);
      setResendMessage(null);
      setCookieError(null);
    }
  }, [isOpen, form]);

  const handleSubmit = async (values: EmailFormValues) => {
    setErrorMessage(null);
    setResendMessage(null);
    setUnverifiedEmail(null);
    setCookieError(null);

    const hasConsent = await getCookieConsent();
    if (!hasConsent) {
      setCookieError(
        "Cookie consent is required to continue. Please enable cookies.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/visitors/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: values.email.trim() }),
      });
      const body = await response.json().catch(() => ({}));

      if (response.ok) {
        await Promise.resolve(onSessionRestored());
        return;
      }

      if (response.status === 403 && body?.code === "UNVERIFIED") {
        setUnverifiedEmail(values.email.trim().toLowerCase());
        setErrorMessage(
          typeof body.error === "string"
            ? body.error
            : "Please verify your email first.",
        );
        return;
      }

      if (response.status === 404 && body?.code === "NOT_FOUND") {
        setErrorMessage(
          typeof body.error === "string"
            ? body.error
            : "No visitor profile for this email.",
        );
        return;
      }

      setErrorMessage(
        typeof body?.error === "string"
          ? body.error
          : "Something went wrong. Try again.",
      );
    } catch (e) {
      console.error("visitor session:", e);
      setErrorMessage("Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) {
      return;
    }
    setResendMessage(null);
    setIsResending(true);
    try {
      const response = await fetch("/api/visitors/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unverifiedEmail }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setResendMessage(
          typeof body?.error === "string"
            ? body.error
            : "Could not resend. Try again.",
        );
        return;
      }
      setResendMessage("Confirmation email sent. Check your inbox.");
    } catch (e) {
      console.error("resend verification:", e);
      setResendMessage("Could not resend. Try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <div
        className="rounded-lg border border-primary/20 bg-white/80 p-4 shadow-sm"
        role="region"
        aria-labelledby="login-visitor-return-heading"
      >
        <div className="mb-3 flex w-full justify-start">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-primary hover:bg-primary/10"
            onClick={onBack}
            aria-label="Back to visitor options"
          >
            <ArrowLeft className="size-6" aria-hidden />
          </Button>
        </div>
        <p
          id="login-visitor-return-heading"
          className="text-center text-sm font-medium text-foreground"
        >
          Already a visitor?
        </p>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Enter the email you used to register. We will restore your visitor
          session if it is verified.
        </p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="mt-3 space-y-3"
            noValidate
          >
            {errorMessage ? (
              <div
                className="rounded-md bg-amber-50 px-2 py-2 text-sm text-amber-950"
                role="alert"
              >
                {errorMessage}
                {unverifiedEmail ? (
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={isResending}
                      onClick={() => void handleResendVerification()}
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        "Resend confirmation email"
                      )}
                    </Button>
                    {resendMessage ? (
                      <p className="mt-2 text-xs text-green-800" role="status">
                        {resendMessage}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
            {cookieError ? (
              <div
                className="flex flex-col gap-2 rounded-md bg-red-100 px-2 py-2 text-sm text-red-700"
                role="alert"
              >
                <span>{cookieError}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCookieSettingsOpen(true)}
                  className="h-auto justify-start p-0 text-primary hover:underline"
                  aria-label="Open cookie settings"
                >
                  <Settings className="mr-2 h-4 w-4 shrink-0" aria-hidden />
                  Change settings
                </Button>
              </div>
            ) : null}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                      />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="bg-white pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full hover:bg-[var(--color-box2)]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  Checking…
                </>
              ) : (
                "Continue as visitor"
              )}
            </Button>
          </form>
        </Form>
      </div>

      <CookieSettingsModal
        isOpen={isCookieSettingsOpen}
        onClose={() => setIsCookieSettingsOpen(false)}
      />
    </>
  );
};
