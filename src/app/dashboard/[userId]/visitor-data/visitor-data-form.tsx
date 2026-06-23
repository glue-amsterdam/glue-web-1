"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  isVisitorAgeRange,
  VISITOR_AGE_RANGES,
  VISITOR_AGE_RANGE_LABELS,
} from "@/lib/visitor/visitor-age-ranges";
import {
  visitorProfileSchema,
  type VisitorProfileFormState,
} from "@/schemas/visitorSchemas";

const VISITOR_PROFILE_WATCH_FIELDS = [
  "firstName",
  "lastName",
  "birthDate",
  "areaId",
] as const;

export type VisitorWorkAreaOption = {
  id: string;
  name: string;
};

type VisitorDataFormProps = {
  initialProfile: VisitorProfileFormState;
  workAreas: VisitorWorkAreaOption[];
  isProfileComplete: boolean;
  targetUserId?: string;
  isMod?: boolean;
  subjectDisplayName?: string | null;
  onSaved?: () => void;
};

export const VisitorDataForm = ({
  initialProfile,
  workAreas,
  isProfileComplete,
  targetUserId,
  isMod = false,
  subjectDisplayName,
  onSaved,
}: VisitorDataFormProps) => {
  const isModeratorView = Boolean(isMod && targetUserId);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<VisitorProfileFormState>({
    resolver: zodResolver(
      visitorProfileSchema
    ) as Resolver<VisitorProfileFormState>,
    defaultValues: initialProfile,
  });

  useEffect(() => {
    form.reset(initialProfile);
  }, [initialProfile, form]);

  const handleSubmit = async (values: VisitorProfileFormState) => {
    const parsed = visitorProfileSchema.parse(values);

    try {
      const response = await fetch("/api/users/visitor-data", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          targetUserId ? { ...parsed, targetUserId } : parsed
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
        {subjectDisplayName ?? " "}
      </h1>

      <CheckInQrButton
        targetUserId={targetUserId}
        isModeratorView={isModeratorView}
        subjectDisplayName={subjectDisplayName}
        isProfileComplete={isProfileComplete}
      />

      {!isProfileComplete ? (
        <p
          role="status"
          className="mb-6 base-text-size text-(--primary-color) max-w-prose"
        >
          Your profile is incomplete. Select Age range and Work area
          below, then save to generate your QR code.
        </p>
      ) : null}

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
                  <Input
                    {...field}
                    type="email"
                    autoComplete="email"
                    readOnly
                    disabled
                    className="disabled:opacity-60"
                  />
                </FormControl>
                <FormDescription>
                  Registration email — this is the address you signed up with and
                  cannot be changed here.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Age range <span aria-hidden="true">*</span>
                </FormLabel>
                <Select
                  value={
                    isVisitorAgeRange(field.value) ? field.value : undefined
                  }
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger aria-label="Age range" aria-required="true">
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {VISITOR_AGE_RANGES.map((range) => (
                      <SelectItem key={range} value={range}>
                        {VISITOR_AGE_RANGE_LABELS[range]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="areaId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Work area <span aria-hidden="true">*</span>
                </FormLabel>
                <Select
                  value={field.value?.trim() ? field.value : undefined}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger aria-label="Work area" aria-required="true">
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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
          <div className="mini-padding">
            <SaveChangesButton
              isSubmitting={form.formState.isSubmitting}
              watchFields={[...VISITOR_PROFILE_WATCH_FIELDS]}
              isDirty={false}
            />
          </div>
        </form>
      </Form>
    </div>
  );
};
