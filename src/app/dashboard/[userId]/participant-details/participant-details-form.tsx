"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  type ParticipantDetails,
  type ParticipantDetailsInput,
  participantDetailsSchema,
} from "@/schemas/participantDetailsSchemas";
import type { PlanType } from "@/schemas/plansSchema";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import {
  createSubmitHandler,
  resetWatchedFieldsDirtyState,
} from "@/utils/form-helpers";
import { BasicInfoFields } from "@/app/dashboard/[userId]/participant-details/basic-info-fields";
import { SlugField } from "@/app/dashboard/[userId]/participant-details/slug-field";
import { ContactFields } from "@/app/dashboard/[userId]/participant-details/contact-fields";
import { SocialMediaFields } from "@/app/dashboard/[userId]/participant-details/social-media-fields";
import { PlanSettingsFields } from "@/app/dashboard/[userId]/participant-details/plan-settings-fields";
import { ModeratorPanel } from "@/app/dashboard/[userId]/participant-details/moderator-panel";
import { ParticipantActiveStatus } from "@/app/dashboard/[userId]/participant-details/active-status-section";
import { ParticipantSection } from "@/app/dashboard/[userId]/participant-details/participant-section";
import { ProfileImageForm } from "@/app/dashboard/[userId]/profile-image/profile-image-form";
import { VisitingHoursForm } from "@/app/dashboard/[userId]/visiting-hours/visiting-hours-form";
import { InvoiceDataForm } from "@/app/dashboard/[userId]/invoice-data/invoice-data-form";
import { PressKitDownloadSection } from "@/app/dashboard/[userId]/participant-details/press-kit-download-section";
import type { ProfileImageRow } from "@/lib/dashboard/get-participant-profile-data";
import type { VisitingHoursDays } from "@/schemas/visitingHoursSchema";
import type { InvoiceData } from "@/schemas/invoiceSchemas";
import type { PressKitLink } from "@/schemas/mainSchema";
import Separator from "@/components/separator";

const PROFILE_WATCH_FIELDS = [
  "description",
  "slug",
  "display_name",
  "phone_numbers",
  "visible_emails",
  "glue_communication_email",
  "visible_websites",
  "social_media.facebookLink",
  "social_media.linkedinLink",
  "social_media.instagramLink",
] as const;

const PLAN_WATCH_FIELDS = ["plan_id", "plan_type"] as const;

const buildDefaultSocialMedia = (
  socialMedia: ParticipantDetailsInput["social_media"]
) => ({
  facebookLink: socialMedia?.facebookLink ?? "",
  linkedinLink: socialMedia?.linkedinLink ?? "",
  instagramLink: socialMedia?.instagramLink ?? "",
});

type ParticipantDetailsFormProps = {
  participantDetails: ParticipantDetails | null;
  isMod: boolean;
  targetUserId: string;
  visitingHours: VisitingHoursDays[];
  invoiceData: InvoiceData | null;
  profileImages: ProfileImageRow[];
  planMaxImages: number;
  plans: PlanType[];
  pressKitLinks: PressKitLink[];
};

export function ParticipantDetailsForm({
  participantDetails,
  isMod,
  targetUserId,
  visitingHours,
  invoiceData,
  profileImages,
  planMaxImages,
  plans,
  pressKitLinks,
}: ParticipantDetailsFormProps) {
  const hasExistingRecord = Boolean(participantDetails);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPlanSubmitting, setIsPlanSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ParticipantDetailsInput, unknown, ParticipantDetails>({
    resolver: zodResolver(participantDetailsSchema),
    defaultValues: {
      description: participantDetails?.description || "",
      slug: participantDetails?.slug || "",
      status: participantDetails?.status || "pending",
      user_id: targetUserId,
      special_program: participantDetails?.special_program || false,
      is_active:
        participantDetails?.is_active !== undefined
          ? participantDetails.is_active
          : true,
      reactivation_requested: participantDetails?.reactivation_requested || false,
      reactivation_notes: participantDetails?.reactivation_notes || null,
      reactivation_status: participantDetails?.reactivation_status || null,
      display_number: participantDetails?.display_number || null,
      display_name: participantDetails?.display_name || "",
      phone_numbers: participantDetails?.phone_numbers ?? [],
      social_media: buildDefaultSocialMedia(participantDetails?.social_media),
      visible_emails: participantDetails?.visible_emails ?? [],
      visible_websites: participantDetails?.visible_websites ?? [],
      glue_communication_email: participantDetails?.glue_communication_email ?? null,
      plan_id: participantDetails?.plan_id ?? null,
      plan_type: participantDetails?.plan_type ?? null,
    },
    mode: "onBlur",
  });

  const isActive = form.watch("is_active");
  const status = form.watch("status");
  const isProfileReadOnly =
    !isMod && (status === "pending" || !isActive);
  const isPendingParticipant = !isMod && status === "pending";

  const onSubmit = createSubmitHandler<ParticipantDetails>(
    `/api/users/participants/${targetUserId}/details`,
    async () => {
      resetWatchedFieldsDirtyState(form, PROFILE_WATCH_FIELDS);
      toast({
        title: "Success",
        description: "Participant details updated successfully.",
      });
      router.refresh();
    },
    (error) => {
      toast({
        title: "Error",
        description:
          "Failed to update Participant details. Please try again. " + error,
        variant: "destructive",
      });
    },
    hasExistingRecord ? "PUT" : "POST"
  );

  const onPlanSubmit = createSubmitHandler<ParticipantDetails>(
    `/api/users/participants/${targetUserId}/details`,
    async () => {
      resetWatchedFieldsDirtyState(form, PLAN_WATCH_FIELDS);
      toast({
        title: "Success",
        description: "Plan updated successfully.",
      });
      router.refresh();
    },
    (error) => {
      toast({
        title: "Error",
        description: "Failed to update plan. Please try again. " + error,
        variant: "destructive",
      });
    },
    hasExistingRecord ? "PUT" : "POST"
  );

  const handleProfileSubmit = async (values: ParticipantDetails) => {
    if (isProfileReadOnly) return;

    setIsSubmitting(true);
    await onSubmit({ ...values, user_id: targetUserId });
    setIsSubmitting(false);
  };

  const handlePlanSubmit = async (values: ParticipantDetails) => {
    if (!isMod) return;

    const previousPlanId = participantDetails?.plan_id;
    if (values.plan_id && values.plan_id !== previousPlanId) {
      const currentPlan = plans.find((plan) => plan.plan_id === previousPlanId);
      const newPlan = plans.find((plan) => plan.plan_id === values.plan_id);
      const confirmed = window.confirm(
        `Are you sure you want to change the user's plan from ${currentPlan?.plan_label || "current plan"
        } to ${newPlan?.plan_label || "new plan"}?`
      );
      if (!confirmed) {
        return;
      }
    }

    setIsPlanSubmitting(true);
    await onPlanSubmit({ ...values, user_id: targetUserId });
    setIsPlanSubmitting(false);
  };

  const handleOpenReactivationFlow = () => {
    router.push("/participate?intent=reactivation#plans-selection-section");
  };

  return (
    <div className="px-[30px] mini-padding">
      <h1 className="title-text">{participantDetails?.display_name}</h1>

      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <input type="hidden" {...form.register("user_id")} />
          <input type="hidden" {...form.register("plan_type")} />

          {isMod && (
            <>
              <ModeratorPanel
                targetUserId={targetUserId}
                participantDetails={participantDetails}
                hasExistingRecord={hasExistingRecord}
              />

              <ParticipantSection title="Plan settings">
                <PlanSettingsFields plans={plans} />
                <div className="flex justify-center mini-padding">
                  <SaveChangesButton
                    type="button"
                    onClick={form.handleSubmit(handlePlanSubmit)}
                    watchFields={[...PLAN_WATCH_FIELDS]}
                    isSubmitting={isPlanSubmitting}
                    label={isPlanSubmitting ? "Updating..." : "Update plan"}
                  />
                </div>
              </ParticipantSection>
            </>
          )}

          {!isMod && (
            <ParticipantSection title="Tour participation" className="mini-padding">
              <ParticipantActiveStatus
                onOpenReactivationModal={handleOpenReactivationFlow}
              />
            </ParticipantSection>
          )}

          {isPendingParticipant && (
            <div
              className="rounded-md border border-yellow-300 bg-yellow-50 p-4 text-yellow-800 mini-padding"
              role="alert"
            >
              <p className="font-bold">Pending approval</p>
              <p className="text-sm">
                Your profile is waiting for moderator approval. Contact and
                profile fields are read-only until you are accepted.
              </p>
            </div>
          )}

          <PressKitDownloadSection pressKitLinks={pressKitLinks} />

          <ParticipantSection title="Participant Profile">
            <BasicInfoFields readOnly={isProfileReadOnly} />
            <SlugField readOnly={isProfileReadOnly} />
            <ContactFields readOnly={isProfileReadOnly} />
            <SocialMediaFields readOnly={isProfileReadOnly} />
            <div className="flex justify-center mini-padding">
              <SaveChangesButton
                type="button"
                onClick={form.handleSubmit(handleProfileSubmit)}
                watchFields={[...PROFILE_WATCH_FIELDS]}
                isSubmitting={isSubmitting}
                {...(isProfileReadOnly ? { disabled: true } : {})}
                label={isSubmitting ? "Updating..." : "Update participant"}
              />
            </div>
          </ParticipantSection>
        </form>

        <Separator />

        <div className="space-y-6 mt-6">
          <ParticipantSection id="profile-images" title="Profile images">
            <ProfileImageForm
              targetUserId={targetUserId}
              initialImages={profileImages}
              planMaxImages={planMaxImages}
              readOnly={isProfileReadOnly}
            />
          </ParticipantSection>

          <Separator />

          <ParticipantSection id="visiting-hours" title="Visiting hours">
            <VisitingHoursForm
              targetUserId={targetUserId}
              initialData={visitingHours}
              embedded
              readOnly={isProfileReadOnly}
            />
          </ParticipantSection>
          <Separator />

          <ParticipantSection id="invoice-data" title="Invoice data">
            <InvoiceDataForm
              initialData={invoiceData}
              isMod={isMod}
              targetUserId={targetUserId}
              embedded
            />
          </ParticipantSection>
        </div>
      </Form>
    </div>
  );
}
