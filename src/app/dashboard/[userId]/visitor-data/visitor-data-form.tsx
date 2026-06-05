"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useDashboardContext } from "@/app/context/DashboardContext";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { PlatformModToggle } from "@/app/dashboard/[userId]/visitor-data/platform-mod-toggle";
import {
  visitorProfileSchema,
  type VisitorProfileInput,
} from "@/schemas/visitorSchemas";

const emptyProfile: VisitorProfileInput = {
  firstName: "",
  lastName: "",
  email: "",
  birthDate: "",
  areaId: "",
};

const VISITOR_PROFILE_WATCH_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "birthDate",
  "areaId",
] as const;

type VisitorDataFormProps = {
  initialProfile: VisitorProfileInput;
  targetUserId?: string;
  permissionsTargetUserId?: string;
  onSaved?: () => void;
};

export const VisitorDataForm = ({
  initialProfile,
  targetUserId,
  permissionsTargetUserId,
  onSaved,
}: VisitorDataFormProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const { isMod } = useDashboardContext();

  const form = useForm<VisitorProfileInput>({
    resolver: zodResolver(visitorProfileSchema),
    defaultValues: initialProfile,
  });

  useEffect(() => {
    form.reset(initialProfile);
  }, [initialProfile, form]);

  const handleSubmit = async (values: VisitorProfileInput) => {
    try {
      const response = await fetch("/api/users/visitor-data", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          targetUserId ? { ...values, targetUserId } : values
        ),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Failed to save profile");
      }

      toast({
        title: "Profile saved",
        description: "Your check-in profile has been updated.",
      });
      onSaved?.();
      router.refresh();
    } catch (error) {
      toast({
        title: "Save failed",
        description:
          error instanceof Error ? error.message : "Could not save profile",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Check-in profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
            noValidate
          >
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="given-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="family-name" />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" autoComplete="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birth date (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SaveChangesButton
              isSubmitting={form.formState.isSubmitting}
              watchFields={[...VISITOR_PROFILE_WATCH_FIELDS]}
              isDirty={false}
            />
            {isMod && permissionsTargetUserId ? (
              <PlatformModToggle targetUserId={permissionsTargetUserId} />
            ) : null}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
