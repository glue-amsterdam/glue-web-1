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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { CheckInQrButton } from "@/app/dashboard/[userId]/visitor-data/check-in-qr-button";
import { PlatformModToggle } from "@/app/dashboard/[userId]/visitor-data/platform-mod-toggle";
import {
  visitorProfileSchema,
  type VisitorProfileInput,
} from "@/schemas/visitorSchemas";

const VISITOR_PROFILE_WATCH_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "birthDate",
  "areaId",
] as const;

const WORK_AREA_NONE = "__none__";

export type VisitorWorkAreaOption = {
  id: string;
  name: string;
};

type VisitorDataFormProps = {
  initialProfile: VisitorProfileInput;
  workAreas: VisitorWorkAreaOption[];
  targetUserId?: string;
  permissionsTargetUserId?: string;
  isMod?: boolean;
  subjectDisplayName?: string | null;
  onSaved?: () => void;
};

export const VisitorDataForm = ({
  initialProfile,
  workAreas,
  targetUserId,
  permissionsTargetUserId,
  isMod = false,
  subjectDisplayName,
  onSaved,
}: VisitorDataFormProps) => {
  const isModeratorView = Boolean(isMod && targetUserId);
  const router = useRouter();
  const { toast } = useToast();

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
    <div className="px-[30px] mini-padding">
      <h1 className="title-text">
        {subjectDisplayName ?? "Check-in profile"}
      </h1>

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
          <FormField
            control={form.control}
            name="areaId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work area (optional)</FormLabel>
                <Select
                  value={field.value?.trim() ? field.value : WORK_AREA_NONE}
                  onValueChange={(value) =>
                    field.onChange(value === WORK_AREA_NONE ? "" : value)
                  }
                >
                  <FormControl>
                    <SelectTrigger aria-label="Work area">
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={WORK_AREA_NONE}>None</SelectItem>
                    {workAreas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mini-padding">
            <SaveChangesButton
              isSubmitting={form.formState.isSubmitting}
              watchFields={[...VISITOR_PROFILE_WATCH_FIELDS]}
              isDirty={false}
            />
            <CheckInQrButton
              targetUserId={targetUserId}
              isModeratorView={isModeratorView}
              subjectDisplayName={subjectDisplayName}
            />
          </div>
          {isMod && permissionsTargetUserId ? (
            <PlatformModToggle
              targetUserId={permissionsTargetUserId}
              isMod={isMod}
            />
          ) : null}
        </form>
      </Form>
    </div>
  );
};
