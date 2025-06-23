"use client";

import type React from "react";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import type { ParticipantDetails } from "@/schemas/participantDetailsSchemas";
import { AlertCircle, Power, RefreshCw, X } from "lucide-react";

interface ActiveStatusSectionProps {
  isMod: boolean;
  onApproveReactivation: () => void;
  onDeclineReactivation: () => void;
  onReconsiderRequest: () => void;
  onOpenReactivationModal: () => void;
  renderReactivationDetails: () => React.ReactNode;
}

export function ActiveStatusSection({
  isMod,
  onApproveReactivation,
  onDeclineReactivation,
  onReconsiderRequest,
  onOpenReactivationModal,
  renderReactivationDetails,
}: ActiveStatusSectionProps) {
  const { control, watch, setValue } = useFormContext<ParticipantDetails>();
  const isActive = watch("is_active");
  const reactivationRequested = watch("reactivation_requested");
  const reactivationStatus = watch("reactivation_status");

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <h4 className="font-medium text-base">Active Status</h4>
      {isMod && (
        <FormField
          control={control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <FormLabel className="text-base flex gap-2 flex-wrap">
                  <span>Active Participant</span> <Power />
                </FormLabel>
                <FormDescription>
                  {field.value
                    ? "Participant is currently active and can access all features"
                    : "Participant is currently inactive with limited access"}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value || false}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (checked) {
                      // If activating, reset reactivation request
                      setValue("reactivation_requested", false);
                      setValue("reactivation_notes", null);
                      setValue("reactivation_status", null);
                    }
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}

      {!isActive && reactivationRequested && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <h5 className="font-medium">Reactivation Request</h5>
            <Badge
              variant={
                reactivationStatus === "pending"
                  ? "outline"
                  : reactivationStatus === "approved"
                  ? "default"
                  : "destructive"
              }
            >
              {reactivationStatus === "pending"
                ? "Pending"
                : reactivationStatus === "approved"
                ? "Approved"
                : reactivationStatus === "declined"
                ? "Declined"
                : "Unknown"}
            </Badge>
          </div>

          {reactivationStatus === "pending" && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">
                Reactivation Requested
              </AlertTitle>
              <AlertDescription className="text-yellow-700">
                This participant has requested reactivation. Review their
                details and approve or deny the request.
              </AlertDescription>
            </Alert>
          )}

          {reactivationStatus === "declined" && (
            <Alert variant="destructive">
              <X className="h-4 w-4" />
              <AlertTitle>Reactivation Declined</AlertTitle>
              <AlertDescription>{`This participant's reactivation request was declined.`}</AlertDescription>
            </Alert>
          )}

          {renderReactivationDetails()}

          {isMod && reactivationStatus === "pending" && (
            <div className="flex space-x-2 mt-4">
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

          {isMod && reactivationStatus === "declined" && (
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
      )}

      {!isActive && (
        <div className="space-y-4 mt-6">
          <Alert className="bg-red-50 border-red-500">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-600">Account Inactive</AlertTitle>
            <AlertDescription className="text-red-700">
              Your account is currently inactive. Some features may be limited.
            </AlertDescription>
          </Alert>

          {!reactivationRequested ? (
            <Button
              type="button"
              onClick={onOpenReactivationModal}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              Apply for the new Design Route
            </Button>
          ) : (
            <Alert
              className={
                reactivationStatus === "pending"
                  ? "bg-blue-50 border-blue-200"
                  : reactivationStatus === "approved"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }
            >
              <RefreshCw
                className={
                  reactivationStatus === "pending"
                    ? "h-4 w-4 text-blue-600"
                    : reactivationStatus === "approved"
                    ? "h-4 w-4 text-green-600"
                    : "h-4 w-4 text-red-600"
                }
              />
              <AlertTitle
                className={
                  reactivationStatus === "pending"
                    ? "text-blue-800"
                    : reactivationStatus === "approved"
                    ? "text-green-800"
                    : "text-red-800"
                }
              >
                {reactivationStatus === "pending"
                  ? "Reactivation Requested"
                  : reactivationStatus === "approved"
                  ? "Reactivation Approved"
                  : "Reactivation Declined"}
              </AlertTitle>
              <AlertDescription
                className={
                  reactivationStatus === "pending"
                    ? "text-blue-700"
                    : reactivationStatus === "approved"
                    ? "text-green-700"
                    : "text-red-700"
                }
              >
                {reactivationStatus === "pending"
                  ? "Your reactivation request has been submitted and is pending review by administrators."
                  : reactivationStatus === "approved"
                  ? "Your reactivation request has been approved. Your account will be active soon."
                  : "Your reactivation request has been declined. You can submit a new request."}
              </AlertDescription>
            </Alert>
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
      )}
    </div>
  );
}
