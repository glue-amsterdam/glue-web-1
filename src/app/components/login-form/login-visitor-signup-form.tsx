"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Loader2, Settings, MailCheck } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { getCookieConsent } from "@/app/actions/cookieConsent";
import { CookieSettingsModal } from "@/components/cookies/cookies-modal";

const visitorSignupSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email({ message: "Invalid email address" }),
  birth_date: z
    .string()
    .trim()
    .min(1, "Birth date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date"),
  area_id: z
    .string({ required_error: "Work area is required" })
    .uuid("Choose a valid work area"),
});

type VisitorSignupFormValues = z.infer<typeof visitorSignupSchema>;

type VisitorAreaOption = { id: string; name: string };

type LoginVisitorSignupFormProps = {
  isOpen: boolean;
};

const EMAIL_FOLLOWUP_MESSAGE = "Take a look to your email.";

export const LoginVisitorSignupForm = ({
  isOpen,
}: LoginVisitorSignupFormProps) => {
  const [areas, setAreas] = useState<VisitorAreaOption[]>([]);
  const [areasLoading, setAreasLoading] = useState(true);
  const [areasError, setAreasError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cookieError, setCookieError] = useState<string | null>(null);
  const [isCookieSettingsOpen, setIsCookieSettingsOpen] = useState(false);

  const form = useForm<VisitorSignupFormValues>({
    resolver: zodResolver(visitorSignupSchema),
    defaultValues: {
      full_name: "",
      email: "",
      birth_date: "",
      area_id: undefined,
    },
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        full_name: "",
        email: "",
        birth_date: "",
        area_id: undefined,
      });
      setSubmitError(null);
      setIsSuccess(false);
      setCookieError(null);
      return;
    }

    const loadAreas = async () => {
      setAreasLoading(true);
      setAreasError(null);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("visitor_areas")
          .select("id, name")
          .order("name", { ascending: true });
        if (error) {
          throw error;
        }
        setAreas((data ?? []) as VisitorAreaOption[]);
      } catch (e) {
        console.error("visitor_areas fetch:", e);
        setAreasError("Could not load work areas.");
        setAreas([]);
      } finally {
        setAreasLoading(false);
      }
    };

    void loadAreas();
  }, [isOpen, form]);

  const handleSubmit = async (values: VisitorSignupFormValues) => {
    setSubmitError(null);
    setCookieError(null);

    const hasConsent = await getCookieConsent();
    if (!hasConsent) {
      setCookieError(
        "Cookie consent is required to continue. Please enable cookies.",
      );
      return;
    }

    const payload = {
      full_name: values.full_name,
      email: values.email,
      birth_date: values.birth_date,
      area_id: values.area_id,
    };

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/visitors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message =
          typeof body?.error === "string"
            ? body.error
            : "Registration failed. Please try again.";
        setSubmitError(message);
        return;
      }
      setIsSuccess(true);
    } catch (e) {
      console.error("visitor register:", e);
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasAreas = areas.length > 0;
  const canSubmitNewVisitor = hasAreas && !areasLoading;

  return (
    <>
      <div
        className="rounded-lg border border-primary/20 bg-white/80 p-4 shadow-sm"
        role="region"
        aria-labelledby="login-visitor-signup-heading"
      >
        {isSuccess ? (
          <div
            className="flex flex-col items-center gap-3 px-1 py-4 text-center"
            role="status"
            aria-live="polite"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MailCheck className="size-7" aria-hidden />
            </div>
            <p
              id="login-visitor-signup-heading"
              className="text-base font-semibold text-foreground"
            >
              {EMAIL_FOLLOWUP_MESSAGE}
            </p>
            <p className="text-sm text-muted-foreground">
              You can close this window and log in later if you already have an
              account.
            </p>
          </div>
        ) : (
          <>
            <p
              id="login-visitor-signup-heading"
              className="text-center text-sm font-medium text-foreground"
            >
              New here?
            </p>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              Enter as a visitor to see the exclusive content.
            </p>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="mt-3 space-y-3"
                noValidate
              >
                {submitError ? (
                  <div
                    className="rounded-md bg-red-100 px-2 py-2 text-sm text-red-700"
                    role="alert"
                  >
                    {submitError}
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
                {areasError ? (
                  <p className="text-xs text-amber-700" role="status">
                    {areasError}
                  </p>
                ) : null}
                {!hasAreas && !areasLoading && !areasError ? (
                  <p className="text-xs text-amber-700" role="status">
                    No work areas are available yet. Registration cannot
                    continue until an admin adds one.
                  </p>
                ) : null}

                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary">Full name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User
                            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden
                          />
                          <Input
                            placeholder="Your name"
                            autoComplete="name"
                            className="bg-white pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

                <FormField
                  control={form.control}
                  name="birth_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary">Birth date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          required
                          className="bg-white"
                          aria-label="Birth date"
                          aria-required="true"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="area_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary">Work area</FormLabel>
                      <Select
                        disabled={areasLoading || !hasAreas}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className="bg-white"
                            aria-label="Work area"
                            aria-required="true"
                          >
                            <SelectValue placeholder="Select a work area" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {areas.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full hover:bg-[var(--color-box2)]"
                  disabled={isSubmitting || !canSubmitNewVisitor}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        className="mr-2 h-4 w-4 animate-spin"
                        aria-hidden
                      />
                      Saving…
                    </>
                  ) : (
                    "Register as a visitor"
                  )}
                </Button>
              </form>
            </Form>
          </>
        )}
      </div>

      <CookieSettingsModal
        isOpen={isCookieSettingsOpen}
        onClose={() => setIsCookieSettingsOpen(false)}
      />
    </>
  );
};
