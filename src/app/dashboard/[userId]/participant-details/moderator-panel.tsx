"use client";

import { useFormContext } from "react-hook-form";
import type { ParticipantDetails } from "@/schemas/participantDetailsSchemas";
import { ModeratorSettings } from "@/app/dashboard/[userId]/participant-details/moderator-settings";
import { ParticipantSection } from "@/app/dashboard/[userId]/participant-details/participant-section";
import { ConfirmationDialog } from "@/app/dashboard/[userId]/participant-details/confirmation-dialog";
import { ReactivationDialog } from "@/app/dashboard/[userId]/participant-details/reactivation-dialog";
import { useModeratorActions } from "@/app/dashboard/[userId]/participant-details/use-moderator-actions";

type ModeratorPanelProps = {
  targetUserId: string;
  participantDetails: ParticipantDetails | null;
  hasExistingRecord: boolean;
};

export function ModeratorPanel({
  targetUserId,
  participantDetails,
  hasExistingRecord,
}: ModeratorPanelProps) {
  const form = useFormContext<ParticipantDetails>();
  const status = form.watch("status");
  const isActive = form.watch("is_active");

  const {
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
  } = useModeratorActions({
    form,
    targetUserId,
    participantDetails,
    hasExistingRecord,
  });

  return (
    <>
      <ParticipantSection title="Moderation">
        <div className="space-y-6">
          {status === "pending" && (
            <div
              className="rounded-md border border-yellow-300 bg-yellow-50 p-4 text-yellow-800"
              role="alert"
            >
              <p className="font-bold">Pending Approval</p>
              <p className="text-sm">
                This participant is waiting for approval.
              </p>
            </div>
          )}

          {status === "accepted" && !isActive && (
            <div
              className="rounded-md border border-red-300 bg-red-50 p-4 text-red-800"
              role="alert"
            >
              <p className="font-bold">Not in current tour</p>
              <p className="text-sm">
                This participant is approved but not participating in this
                year&apos;s Design Route.
              </p>
            </div>
          )}
          <ModeratorSettings
            targetUserId={targetUserId}
            onApproveReactivation={() => setIsReactivationDialogOpen(true)}
            onDeclineReactivation={handleDeclineReactivation}
            onReconsiderRequest={handleReconsiderRequest}
            renderReactivationDetails={renderReactivationDetails}
            onSave={form.handleSubmit(handleModeratorSave)}
            isSubmitting={isModeratorSubmitting}
          />
        </div>
      </ParticipantSection>

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
    </>
  );
}
