"use client";



import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Form } from "@/components/ui/form";

import { useToast } from "@/hooks/use-toast";

import {

  type ParticipantDetails,

  participantDetailsSchema,

} from "@/schemas/participantDetailsSchemas";

import { SaveChangesButton } from "@/app/admin/components/save-changes-button";

import {
  createSubmitHandler,
  resetWatchedFieldsDirtyState,
} from "@/utils/form-helpers";

import { BasicInfoFields } from "@/app/dashboard/[userId]/participant-details/basic-info-fields";

import { SlugField } from "@/app/dashboard/[userId]/participant-details/slug-field";

import { ModeratorPanel } from "@/app/dashboard/[userId]/participant-details/moderator-panel";

import { ParticipantActiveStatus } from "@/app/dashboard/[userId]/participant-details/active-status-section";

import { ParticipantSection } from "@/app/dashboard/[userId]/participant-details/participant-section";

import { ProfileImageForm } from "@/app/dashboard/[userId]/profile-image/profile-image-form";

import { VisitingHoursForm } from "@/app/dashboard/[userId]/visiting-hours/visiting-hours-form";

import { InvoiceDataForm } from "@/app/dashboard/[userId]/invoice-data/invoice-data-form";

import type { ProfileImageRow } from "@/lib/dashboard/get-participant-profile-data";

import type { VisitingHoursDays } from "@/schemas/visitingHoursSchema";

import type { InvoiceData } from "@/schemas/invoiceSchemas";

import Separator from "@/components/separator";



const PROFILE_WATCH_FIELDS = [

  "short_description",

  "description",

  "slug",

] as const;



type ParticipantDetailsFormProps = {

  participantDetails: ParticipantDetails | null;

  isMod: boolean;

  targetUserId: string;

  visitingHours: VisitingHoursDays[];

  invoiceData: InvoiceData | null;

  profileImages: ProfileImageRow[];

  planMaxImages: number;

};



export function ParticipantDetailsForm({

  participantDetails,

  isMod,

  targetUserId,

  visitingHours,

  invoiceData,

  profileImages,

  planMaxImages,

}: ParticipantDetailsFormProps) {

  const hasExistingRecord = Boolean(participantDetails);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  const router = useRouter();



  const form = useForm<ParticipantDetails>({

    resolver: zodResolver(participantDetailsSchema),

    defaultValues: {

      short_description: participantDetails?.short_description || "",

      description: participantDetails?.description || "",

      slug: participantDetails?.slug || "",

      status: participantDetails?.status || "pending",

      user_id: targetUserId,

      special_program: participantDetails?.special_program || false,

      is_active:

        participantDetails?.is_active !== undefined

          ? participantDetails.is_active

          : true,

      reactivation_requested:

        participantDetails?.reactivation_requested || false,

      reactivation_notes: participantDetails?.reactivation_notes || null,

      reactivation_status: participantDetails?.reactivation_status || null,

      display_number: participantDetails?.display_number || null,

    },

    mode: "onBlur",

  });



  const isActive = form.watch("is_active");

  const isProfileReadOnly = !isMod && !isActive;



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



  const handleProfileSubmit = async (values: ParticipantDetails) => {

    if (isProfileReadOnly) return;



    setIsSubmitting(true);

    await onSubmit({ ...values, user_id: targetUserId });

    setIsSubmitting(false);

  };



  const handleOpenReactivationFlow = () => {

    router.push("/participate?intent=reactivation#plans-selection-section");

  };



  return (

    <div className="px-[30px] mini-padding">

      <h1 className="title-text">{participantDetails?.display_name}</h1>


      <Separator />


      <Form {...form}>

        <form

          onSubmit={(e) => e.preventDefault()}

          className="space-y-6"

        >

          <input type="hidden" {...form.register("user_id")} />



          {isMod && (

            <>

              <ModeratorPanel

                targetUserId={targetUserId}

                participantDetails={participantDetails}

                hasExistingRecord={hasExistingRecord}

              />

            </>

          )}

          {!isMod && (

            <ParticipantSection title="Tour participation" className="mini-padding">

              <ParticipantActiveStatus

                onOpenReactivationModal={handleOpenReactivationFlow}

              />

            </ParticipantSection>

          )}

          <ParticipantSection title="Participant Profile">

            <BasicInfoFields readOnly={isProfileReadOnly} />

            <SlugField readOnly={isProfileReadOnly} />

            <div className="flex justify-center mini-padding">

              <SaveChangesButton

                type="button"

                onClick={form.handleSubmit(handleProfileSubmit)}

                watchFields={[...PROFILE_WATCH_FIELDS]}

                isSubmitting={isSubmitting}

                {...(isProfileReadOnly ? { disabled: true } : {})}

                label={

                  isSubmitting ? "Updating..." : "Update Participant"

                }

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

