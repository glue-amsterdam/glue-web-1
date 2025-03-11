"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  type ParticipantDetails,
  participantDetailsSchema,
  type ReactivationNotes,
} from "@/schemas/participantDetailsSchemas";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { mutate } from "swr";
import { createSubmitHandler } from "@/utils/form-helpers";
import { ConfirmationDialog } from "@/app/dashboard/[userId]/participant-details/confirmation-dialog";
import { ReactivationDialog } from "@/app/dashboard/[userId]/participant-details/reactivation-dialog";
import { ReactivationRequestModal } from "@/app/dashboard/[userId]/participant-details/reactivation-request-modal";

import { MapPin, FileText } from "lucide-react";
import { BasicInfoFields } from "@/app/dashboard/[userId]/participant-details/basic-info-fields";
import { SlugField } from "@/app/dashboard/[userId]/participant-details/slug-field";
import { ModeratorSettings } from "@/app/dashboard/[userId]/participant-details/moderator-settings";
import { ActiveStatusSection } from "@/app/dashboard/[userId]/participant-details/active-status-section";

export function ParticipantDetailsForm({
  participantDetails,
  isMod,
  targetUserId,
}: {
  participantDetails: ParticipantDetails;
  isMod: boolean;
  targetUserId: string | undefined;
}) {
  const isError = participantDetails && "error" in participantDetails;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReactivationDialogOpen, setIsReactivationDialogOpen] =
    useState(false);
  const [isReactivationRequestModalOpen, setIsReactivationRequestModalOpen] =
    useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ParticipantDetails>({
    resolver: zodResolver(participantDetailsSchema),
    defaultValues: {
      short_description: participantDetails?.short_description || "",
      description: participantDetails?.description || "",
      slug: participantDetails?.slug || "",
      is_sticky: participantDetails?.is_sticky || false,
      year: participantDetails?.year || null,
      status: participantDetails?.status || "pending",
      user_id: targetUserId || "",
      special_program: participantDetails?.special_program || false,
      is_active:
        participantDetails?.is_active !== undefined
          ? participantDetails.is_active
          : true,
      reactivation_requested:
        participantDetails?.reactivation_requested || false,
      reactivation_notes: participantDetails?.reactivation_notes || null,
      reactivation_status: participantDetails?.reactivation_status || null,
    },
    mode: "onBlur",
  });

  const onSubmit = createSubmitHandler<ParticipantDetails>(
    `/api/users/participants/${targetUserId}/details`,
    async () => {
      toast({
        title: "Success",
        description: "Participant details updated successfully.",
      });
      await mutate(`/api/users/participants/${targetUserId}/details`);
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
    isError ? "POST" : "PUT"
  );

  const handleSubmit = async (values: ParticipantDetails) => {
    setIsSubmitting(true);
    const isReactivationApproval =
      values.is_active &&
      participantDetails.reactivation_requested &&
      !participantDetails.is_active;

    if (
      values.status === "accepted" &&
      participantDetails.status !== "accepted"
    ) {
      setIsDialogOpen(true);
    } else {
      await onSubmit({ ...values, user_id: targetUserId! });
      if (isReactivationApproval) {
        await sendReactivationApprovedEmail();
        form.setValue("reactivation_requested", false);
        form.setValue("reactivation_status", "approved");
        await onSubmit({
          ...values,
          user_id: targetUserId!,
          reactivation_requested: false,
          reactivation_status: "approved",
        });
      }
    }
    setIsSubmitting(false);
  };

  const handleReactivationRequest = async (
    reactivationData: ReactivationNotes
  ) => {
    form.setValue("reactivation_requested", true);
    form.setValue("reactivation_notes", reactivationData);
    form.setValue("reactivation_status", "pending");
    await onSubmit({
      ...form.getValues(),
      user_id: targetUserId!,
      reactivation_requested: true,
      reactivation_notes: reactivationData,
      reactivation_status: "pending",
    });
    await sendReactivationRequestEmail(reactivationData);
  };

  const handleConfirmSendEmail = async () => {
    await onSubmit({ ...form.getValues(), user_id: targetUserId! });
    setIsDialogOpen(false);
    await sendAcceptanceEmail();
  };

  const handleCancelSendEmail = async () => {
    await onSubmit({ ...form.getValues(), user_id: targetUserId! });
    setIsDialogOpen(false);
  };

  const handleConfirmReactivation = async () => {
    form.setValue("is_active", true);
    form.setValue("reactivation_requested", false);
    form.setValue("reactivation_status", "approved");
    await onSubmit({
      ...form.getValues(),
      user_id: targetUserId!,
      is_active: true,
      reactivation_requested: false,
      reactivation_status: "approved",
    });
    await sendReactivationApprovedEmail();
    setIsReactivationDialogOpen(false);
  };

  const handleCancelReactivation = async () => {
    form.setValue("is_active", true);
    form.setValue("reactivation_requested", false);
    form.setValue("reactivation_status", "approved");
    await onSubmit({
      ...form.getValues(),
      user_id: targetUserId!,
      is_active: true,
      reactivation_requested: false,
      reactivation_status: "approved",
    });
    setIsReactivationDialogOpen(false);
  };

  const handleDeclineReactivation = async () => {
    setIsSubmitting(true);
    try {
      form.setValue("reactivation_status", "declined");
      await onSubmit({
        ...form.getValues(),
        user_id: targetUserId!,
        reactivation_status: "declined",
      });

      const response = await fetch(`/api/send-decline-reactivation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: targetUserId }),
      });

      if (!response.ok) {
        throw new Error("Failed to decline reactivation request");
      }

      toast({
        title: "Reactivation Declined",
        description: "The reactivation request has been declined.",
      });
    } catch (error) {
      console.error("Error declining reactivation:", error);
      toast({
        title: "Error",
        description:
          "Failed to decline reactivation request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendReactivationRequestEmail = async (
    reactivationData: ReactivationNotes
  ) => {
    try {
      const response = await fetch("/api/send-reactivation-request-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: targetUserId,
          reactivationData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send reactivation request email");
      }

      toast({
        title: "Request Sent",
        description:
          "Your reactivation request has been sent to the administrators.",
      });
    } catch (error) {
      console.error("Error sending reactivation request:", error);
      toast({
        title: "Request Error",
        description: "Failed to send reactivation request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const sendReactivationApprovedEmail = async () => {
    try {
      const response = await fetch("/api/send-reactivation-approved-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: targetUserId }),
      });

      if (!response.ok) {
        throw new Error("Failed to send reactivation approval email");
      }

      toast({
        title: "Email Sent",
        description: "Reactivation approval email sent successfully.",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Email Error",
        description: "Failed to send reactivation approval email.",
        variant: "destructive",
      });
    }
  };

  const sendAcceptanceEmail = async () => {
    try {
      const response = await fetch("/api/send-participant-accepted-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: targetUserId }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email notification");
      }

      toast({
        title: "Email Sent",
        description: "Participant acceptance email sent successfully.",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Email Error",
        description: "Failed to send participant acceptance email.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    form.reset(participantDetails);
  }, [form, participantDetails]);

  const renderReactivationDetails = () => {
    if (!form.watch("reactivation_notes")) return null;

    const reactivationNotes = form.watch("reactivation_notes");

    return (
      <div className="space-y-2 mt-2 p-3 bg-gray-50 rounded-md">
        {reactivationNotes?.plan_id && (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-sm">
              <strong>Plan ID:</strong> {reactivationNotes.plan_id}
            </span>
          </div>
        )}
        {reactivationNotes?.plan_type && (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-sm">
              <strong>Plan Type:</strong> {reactivationNotes.plan_type}
            </span>
          </div>
        )}
        {reactivationNotes?.formatted_address && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm">
              <strong>Address:</strong> {reactivationNotes?.formatted_address}
            </span>
          </div>
        )}
        {reactivationNotes?.no_address && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm">
              <strong>Address:</strong> Participant requested an address
            </span>
          </div>
        )}
        {reactivationNotes?.notes && (
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-gray-500 mt-1" />
            <span className="text-sm">
              <strong>Notes:</strong> {reactivationNotes?.notes}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Participant Details
        </CardTitle>
        {form.watch("status") === "pending" && (
          <div
            className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4"
            role="alert"
          >
            <p className="font-bold">Pending Approval</p>
            <p>This participant is waiting for approval.</p>
          </div>
        )}
        {!form.watch("is_active") && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
            role="alert"
          >
            <p className="font-bold">Inactive Participant</p>
            <p>
              This participant is currently inactive and has limited access.
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="space-y-6">
              <BasicInfoFields />
              <SlugField />
              {isMod && (
                <>
                  <Separator className="my-4" />
                  <ModeratorSettings />
                </>
              )}
              <ActiveStatusSection
                isMod={isMod}
                onApproveReactivation={() => setIsReactivationDialogOpen(true)}
                onDeclineReactivation={handleDeclineReactivation}
                onReconsiderRequest={() => {
                  form.setValue("reactivation_status", "pending");
                  onSubmit({
                    ...form.getValues(),
                    user_id: targetUserId!,
                    reactivation_status: "pending",
                  });
                }}
                onOpenReactivationModal={() =>
                  setIsReactivationRequestModalOpen(true)
                }
                renderReactivationDetails={renderReactivationDetails}
              />

              <div className="pt-6">
                <SaveChangesButton
                  watchFields={[
                    "id",
                    "user_id",
                    "short_description",
                    "description",
                    "slug",
                    "is_sticky",
                    "year",
                    "status",
                    "special_program",
                    "is_active",
                  ]}
                  isSubmitting={isSubmitting}
                  className="w-full"
                  label={
                    isSubmitting ? "Updating..." : "Update Participant Details"
                  }
                />
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmSendEmail}
        onCancel={handleCancelSendEmail}
      />
      <ReactivationDialog
        isOpen={isReactivationDialogOpen}
        onClose={() => setIsReactivationDialogOpen(false)}
        onConfirm={handleConfirmReactivation}
        onCancel={handleCancelReactivation}
      />
      <ReactivationRequestModal
        isOpen={isReactivationRequestModalOpen}
        onClose={() => setIsReactivationRequestModalOpen(false)}
        onSubmit={handleReactivationRequest}
        userId={targetUserId || ""}
      />
    </Card>
  );
}
