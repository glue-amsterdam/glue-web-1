"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UseFormReturn } from "react-hook-form";
import { MapPin, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ParticipantDetails } from "@/schemas/participantDetailsSchemas";
import {
  createSubmitHandler,
  resetWatchedFieldsDirtyState,
} from "@/utils/form-helpers";
import type { z } from "zod";
import { mapInfoSchema } from "@/schemas/mapInfoSchemas";

type MapInfoType = z.infer<typeof mapInfoSchema>;

type UseModeratorActionsParams = {
  form: UseFormReturn<ParticipantDetails>;
  targetUserId: string;
  participantDetails: ParticipantDetails | null;
  hasExistingRecord: boolean;
};

export const MODERATOR_WATCH_FIELDS = [
  "status",
  "special_program",
  "is_active",
  "display_number",
  "reactivation_requested",
  "reactivation_status",
  "reactivation_notes",
] as const;

export const useModeratorActions = ({
  form,
  targetUserId,
  participantDetails,
  hasExistingRecord,
}: UseModeratorActionsParams) => {
  const [isModeratorSubmitting, setIsModeratorSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReactivationDialogOpen, setIsReactivationDialogOpen] =
    useState(false);
  const [mapInfo, setMapInfo] = useState<MapInfoType | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const resetModeratorDirtyState = () => {
    resetWatchedFieldsDirtyState(form, MODERATOR_WATCH_FIELDS);
  };

  const onSubmit = createSubmitHandler<ParticipantDetails>(
    `/api/users/participants/${targetUserId}/details`,
    async () => {
      resetModeratorDirtyState();
      toast({
        title: "Success",
        description: "Moderation settings updated successfully.",
      });
      router.refresh();
    },
    (error) => {
      toast({
        title: "Error",
        description:
          "Failed to update moderation settings. Please try again. " + error,
        variant: "destructive",
      });
    },
    hasExistingRecord ? "PUT" : "POST"
  );

  const getValidMapInfo = (
    currentMapInfo: MapInfoType | null,
    formValues: ParticipantDetails
  ): MapInfoType => {
    if (currentMapInfo) {
      return {
        formatted_address: currentMapInfo.formatted_address ?? null,
        latitude: currentMapInfo.latitude ?? null,
        longitude: currentMapInfo.longitude ?? null,
        no_address: currentMapInfo.no_address ?? true,
      };
    }
    const notes = formValues.reactivation_notes;
    if (
      notes &&
      (notes.formatted_address || notes.latitude || notes.longitude)
    ) {
      return {
        formatted_address: notes.formatted_address ?? null,
        latitude: notes.latitude ?? null,
        longitude: notes.longitude ?? null,
        no_address: notes.no_address ?? true,
      };
    }
    return {
      formatted_address: null,
      latitude: null,
      longitude: null,
      no_address: true,
    };
  };

  const upsertParticipantDetailsAndMapInfo = async (
    details: ParticipantDetails,
    currentMapInfo: MapInfoType | null
  ) => {
    const response = await fetch(
      `/api/users/participants/${targetUserId}/upsert-details-map-info`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantDetails: { ...details, user_id: targetUserId },
          mapInfo: currentMapInfo,
        }),
      }
    );
    if (!response.ok) {
      throw new Error("Error updating participant and map info");
    }
    return response.json();
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

  const handleModeratorSave = async (values: ParticipantDetails) => {
    setIsModeratorSubmitting(true);
    const isReactivationApproval =
      values.is_active &&
      participantDetails?.reactivation_requested &&
      !participantDetails?.is_active;

    if (
      values.status === "accepted" &&
      participantDetails?.status !== "accepted"
    ) {
      setIsDialogOpen(true);
    } else {
      await onSubmit({ ...values, user_id: targetUserId });
      if (isReactivationApproval) {
        await sendReactivationApprovedEmail();
        form.setValue("reactivation_requested", false);
        form.setValue("reactivation_status", "approved");
        await onSubmit({
          ...values,
          user_id: targetUserId,
          reactivation_requested: false,
          reactivation_status: "approved",
        });
      }
    }
    setIsModeratorSubmitting(false);
  };

  const handleConfirmReactivation = async () => {
    form.setValue("is_active", true);
    form.setValue("reactivation_requested", false);
    form.setValue("reactivation_status", "approved");
    await upsertParticipantDetailsAndMapInfo(
      {
        ...form.getValues(),
        user_id: targetUserId,
        is_active: true,
        reactivation_requested: false,
        reactivation_status: "approved",
      },
      getValidMapInfo(mapInfo, form.getValues())
    );
    await sendReactivationApprovedEmail();
    resetModeratorDirtyState();
    setMapInfo(null);
    setIsReactivationDialogOpen(false);
    router.refresh();
  };

  const handleCancelReactivation = async () => {
    form.setValue("is_active", true);
    form.setValue("reactivation_requested", false);
    form.setValue("reactivation_status", "approved");
    await upsertParticipantDetailsAndMapInfo(
      {
        ...form.getValues(),
        user_id: targetUserId,
        is_active: true,
        reactivation_requested: false,
        reactivation_status: "approved",
      },
      getValidMapInfo(mapInfo, form.getValues())
    );
    resetModeratorDirtyState();
    setMapInfo(null);
    setIsReactivationDialogOpen(false);
    router.refresh();
  };

  const handleConfirmSendEmail = async () => {
    await onSubmit({ ...form.getValues(), user_id: targetUserId });
    setIsDialogOpen(false);
    await sendAcceptanceEmail();
  };

  const handleCancelSendEmail = async () => {
    await onSubmit({ ...form.getValues(), user_id: targetUserId });
    setIsDialogOpen(false);
  };

  const handleDeclineReactivation = async () => {
    setIsModeratorSubmitting(true);
    try {
      form.setValue("reactivation_status", "declined");
      await onSubmit({
        ...form.getValues(),
        user_id: targetUserId,
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
      router.refresh();
    } catch (error) {
      console.error("Error declining reactivation:", error);
      toast({
        title: "Error",
        description:
          "Failed to decline reactivation request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsModeratorSubmitting(false);
    }
  };

  const handleReconsiderRequest = () => {
    form.setValue("reactivation_status", "pending");
    onSubmit({
      ...form.getValues(),
      user_id: targetUserId,
      reactivation_status: "pending",
    });
  };

  const renderReactivationDetails = () => {
    if (!form.watch("reactivation_notes")) return null;

    const reactivationNotes = form.watch("reactivation_notes");

    return (
      <>
        {reactivationNotes?.plan_label && (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-sm">
              <strong>Plan:</strong> {reactivationNotes.plan_label}
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
      </>
    );
  };

  return {
    isModeratorSubmitting,
    isDialogOpen,
    isReactivationDialogOpen,
    setIsDialogOpen,
    setIsReactivationDialogOpen,
    handleModeratorSave,
    handleConfirmReactivation,
    handleCancelReactivation,
    handleConfirmSendEmail,
    handleCancelSendEmail,
    handleDeclineReactivation,
    handleReconsiderRequest,
    renderReactivationDetails,
  };
};
