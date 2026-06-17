"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import type { ParticipantDetailsInput } from "@/schemas/participantDetailsSchemas";
import { AlertCircle, RefreshCw, X } from "lucide-react";
import BigButton from "@/components/big-button";

type ModeratorActiveStatusProps = {
  onApproveReactivation: () => void;
  onDeclineReactivation: () => void;
  onReconsiderRequest: () => void;
  renderReactivationDetails: () => React.ReactNode;
};

export function ModeratorActiveStatus({
  onApproveReactivation,
  onDeclineReactivation,
  onReconsiderRequest,
  renderReactivationDetails,
}: ModeratorActiveStatusProps) {
  const { watch } = useFormContext<ParticipantDetailsInput>();
  const isActive = watch("is_active");
  const reactivationRequested = watch("reactivation_requested");
  const reactivationStatus = watch("reactivation_status");

  if (isActive || !reactivationRequested) {
    return null;
  }

  return (
    <div className="max-w-[600px] mini-padding space-y-2">
      <div className="flex items-center justify-between">
        <h5 className="font-medium">Reactivation Request</h5>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${reactivationStatus === "pending"
            ? "border border-yellow-300 bg-yellow-50 text-yellow-800"
            : reactivationStatus === "approved"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
            }`}
        >
          {reactivationStatus === "pending"
            ? "Pending"
            : reactivationStatus === "approved"
              ? "Approved"
              : reactivationStatus === "declined"
                ? "Declined"
                : "Unknown"}
        </span>
      </div>

      {reactivationStatus === "pending" && (
        <div
          className="flex gap-3 rounded-md border border-yellow-200 bg-yellow-50 p-4"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-yellow-600 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">Reactivation Requested</p>
            <p className="text-sm text-yellow-700">
              This participant has requested reactivation. Review their
              details and approve or deny the request.
            </p>
          </div>
        </div>
      )}

      {reactivationStatus === "declined" && (
        <div
          className="flex gap-3 rounded-md border border-red-200 bg-red-50 p-4"
          role="alert"
        >
          <X className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Reactivation Declined</p>
            <p className="text-sm text-red-700">
              This participant&apos;s reactivation request was declined.
            </p>
          </div>
        </div>
      )}

      {renderReactivationDetails()}

      {reactivationStatus === "pending" && (
        <div className="flex space-x-2 mt-4 flex-wrap gap-[15px]">
          <Button
            type="button"
            onClick={onApproveReactivation}
            className="bg-green-500 hover:bg-green-600"
          >
            Approve Reactivation
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onDeclineReactivation}
          >
            Decline Reactivation
          </Button>
        </div>
      )}

      {reactivationStatus === "declined" && (
        <Button
          type="button"
          variant="outline"
          onClick={onReconsiderRequest}
          className="mt-2"
        >
          Reconsider Request
        </Button>
      )}
    </div>
  );
}

type ParticipantActiveStatusProps = {
  onOpenReactivationModal: () => void;
};

export function ParticipantActiveStatus({
  onOpenReactivationModal,
}: ParticipantActiveStatusProps) {
  const { watch } = useFormContext<ParticipantDetailsInput>();
  const isActive = watch("is_active");
  const slug = watch("slug");
  const reactivationRequested = watch("reactivation_requested");
  const reactivationStatus = watch("reactivation_status");

  if (isActive) {
    return (<>
      <div className="base-text-size">
        <p>Your account is currently active. You can edit your profile info, profile images, visiting hours.</p>
        <div className="flex items-center gap-2 mini-padding"> <p className="">Your profile is available at:</p>
          <BigButton
            mode="navbar"
            fontSize="small"
            as="link"
            label="Go to profile"
            href={`/exhibitors/${slug}`}
          /></div>
      </div>
    </>
    );
  }

  return (
    <div className="space-y-4 max-w-[600px] mx-auto mini-padding">
      <div
        className="flex gap-3 rounded-md border border-red-500 bg-red-50 p-4"
        role="alert"
      >
        <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
        <div>
          <p className="font-medium text-red-600">Account Inactive</p>
          <p className="text-sm text-red-700">
            Your account is currently inactive for this year's tour. Profile editing is
            disabled until your account is reactivated.
          </p>
        </div>
      </div>

      {!reactivationRequested ? (
        <div className="flex justify-center">
          <BigButton
            mode="big"
            as="button"
            label="Apply for the new Design Route"
            onClick={onOpenReactivationModal}
          />
        </div>
      ) : (
        <div
          className={`flex gap-3 rounded-md border p-4 ${reactivationStatus === "pending"
            ? "border-blue-200 bg-blue-50"
            : reactivationStatus === "approved"
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
            }`}
          role="status"
        >
          <RefreshCw
            className={`h-4 w-4 shrink-0 mt-0.5 ${reactivationStatus === "pending"
              ? "text-blue-600"
              : reactivationStatus === "approved"
                ? "text-green-600"
                : "text-red-600"
              }`}
          />
          <div>
            <p
              className={`font-medium ${reactivationStatus === "pending"
                ? "text-blue-800"
                : reactivationStatus === "approved"
                  ? "text-green-800"
                  : "text-red-800"
                }`}
            >
              {reactivationStatus === "pending"
                ? "Reactivation Requested"
                : reactivationStatus === "approved"
                  ? "Reactivation Approved"
                  : "Reactivation Declined"}
            </p>
            <p
              className={`text-sm ${reactivationStatus === "pending"
                ? "text-blue-700"
                : reactivationStatus === "approved"
                  ? "text-green-700"
                  : "text-red-700"
                }`}
            >
              {reactivationStatus === "pending"
                ? "Your reactivation request has been submitted and is pending review by administrators."
                : reactivationStatus === "approved"
                  ? "Your reactivation request has been approved. Your account will be active soon."
                  : "Your reactivation request has been declined. You can submit a new request."}
            </p>
          </div>
        </div>
      )}

      {reactivationStatus === "declined" && (
        <Button
          type="button"
          onClick={onOpenReactivationModal}
          className="w-full mt-2"
        >
          Submit New Request
        </Button>
      )}
    </div>
  );
}
