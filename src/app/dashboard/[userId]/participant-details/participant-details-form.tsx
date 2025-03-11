"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  type ParticipantDetails,
  participantDetailsSchema,
  type ReactivationNotes,
} from "@/schemas/participantDetailsSchemas";
import { RichTextEditor } from "@/app/components/editor";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { useDebouncedCallback } from "use-debounce";
import {
  AlertCircle,
  CalendarHeart,
  CheckCircle2,
  Power,
  RefreshCw,
  X,
  MapPin,
  FileText,
} from "lucide-react";
import { mutate } from "swr";
import { createSubmitHandler } from "@/utils/form-helpers";
import { ConfirmationDialog } from "@/app/dashboard/[userId]/participant-details/confirmation-dialog";
import { ReactivationDialog } from "@/app/dashboard/[userId]/participant-details/reactivation-dialog";
import { ReactivationRequestModal } from "@/app/dashboard/[userId]/participant-details/reactivation-request-modal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

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
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isSlugUnique, setIsSlugUnique] = useState<boolean | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReactivationDialogOpen, setIsReactivationDialogOpen] =
    useState(false);
  const [isReactivationRequestModalOpen, setIsReactivationRequestModalOpen] =
    useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const checkSlugUniqueness = useDebouncedCallback(async (slug: string) => {
    if (!slug) {
      setIsSlugUnique(null);
      return;
    }
    setIsCheckingSlug(true);
    try {
      const response = await fetch(
        `/api/check-slug?slug=${encodeURIComponent(slug)}`
      );
      const data = await response.json();
      setIsSlugUnique(data.isUnique);
      if (!data.isUnique) {
        form.setError("slug", {
          type: "manual",
          message:
            "This slug is already in use. Please choose a different one.",
        });
      } else {
        form.clearErrors("slug");
      }
    } catch (error) {
      console.error("Error checking slug uniqueness:", error);
      setIsSlugUnique(null);
    } finally {
      setIsCheckingSlug(false);
    }
  }, 600);

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

  const isSticky = form.watch("is_sticky");
  const status = form.watch("status");
  const isActive = form.watch("is_active");
  const reactivationRequested = form.watch("reactivation_requested");
  const reactivationStatus = form.watch("reactivation_status");
  const reactivationNotes = form.watch("reactivation_notes");

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

  const handleSubmit = async (values: ParticipantDetails) => {
    setIsSubmitting(true);

    // Check if this is a reactivation approval
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

      // If this is a reactivation approval, send the approval email
      if (isReactivationApproval) {
        await sendReactivationApprovedEmail();

        // Reset the reactivation_requested flag
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
    // Set reactivation_requested to true and update reactivation_notes
    form.setValue("reactivation_requested", true);
    form.setValue("reactivation_notes", reactivationData);
    form.setValue("reactivation_status", "pending");

    // Submit the form with the updated values
    await onSubmit({
      ...form.getValues(),
      user_id: targetUserId!,
      reactivation_requested: true,
      reactivation_notes: reactivationData,
      reactivation_status: "pending",
    });

    // Send the reactivation request email
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
    // Set is_active to true and reactivation_requested to false
    form.setValue("is_active", true);
    form.setValue("reactivation_requested", false);
    form.setValue("reactivation_status", "approved");

    // Submit the form
    await onSubmit({
      ...form.getValues(),
      user_id: targetUserId!,
      is_active: true,
      reactivation_requested: false,
      reactivation_status: "approved",
    });

    // Send the reactivation approval email
    await sendReactivationApprovedEmail();

    // Close the dialog
    setIsReactivationDialogOpen(false);
  };

  const handleCancelReactivation = async () => {
    // Set is_active to true and reactivation_requested to false, but don't send email
    form.setValue("is_active", true);
    form.setValue("reactivation_requested", false);
    form.setValue("reactivation_status", "approved");

    // Submit the form
    await onSubmit({
      ...form.getValues(),
      user_id: targetUserId!,
      is_active: true,
      reactivation_requested: false,
      reactivation_status: "approved",
    });

    // Close the dialog
    setIsReactivationDialogOpen(false);
  };

  const handleDeclineReactivation = async () => {
    // Set reactivation_status to declined but keep reactivation_requested true
    form.setValue("reactivation_status", "declined");

    // Submit the form
    await onSubmit({
      ...form.getValues(),
      user_id: targetUserId!,
      reactivation_status: "declined",
    });

    toast({
      title: "Reactivation Declined",
      description: "The reactivation request has been declined.",
    });
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

  // Function to render reactivation notes details
  const renderReactivationDetails = () => {
    if (!reactivationNotes) return null;

    return (
      <div className="space-y-2 mt-2 p-3 bg-gray-50 rounded-md">
        {reactivationNotes.plan_id && (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-sm">
              <strong>Plan ID:</strong> {reactivationNotes.plan_id}
            </span>
          </div>
        )}
        {reactivationNotes.plan_type && (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-sm">
              <strong>Plan Type:</strong> {reactivationNotes.plan_type}
            </span>
          </div>
        )}
        {reactivationNotes.formatted_address && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm">
              <strong>Address:</strong> {reactivationNotes.formatted_address}
            </span>
          </div>
        )}
        {reactivationNotes.no_address && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm">
              <strong>Address:</strong> Participant requested an address
            </span>
          </div>
        )}
        {reactivationNotes.notes && (
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-gray-500 mt-1" />
            <span className="text-sm">
              <strong>Notes:</strong> {reactivationNotes.notes}
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
        {status === "pending" && (
          <div
            className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4"
            role="alert"
          >
            <p className="font-bold">Pending Approval</p>
            <p>This participant is waiting for approval.</p>
          </div>
        )}
        {!isActive && (
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
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="short_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-white text-black" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-white text-black pr-10"
                        onChange={(e) => {
                          field.onChange(e);
                          checkSlugUniqueness(e.target.value);
                        }}
                      />
                    </FormControl>
                    {!isCheckingSlug && isSlugUnique && field.value && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                  </div>
                  {isCheckingSlug && (
                    <p className="text-sm text-gray-500">
                      Checking slug availability...
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            {isMod && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Moderator Settings</h3>
                  <Separator className="my-4" />
                  <FormField
                    name="special_program"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base flex gap-2 flex-wrap">
                            <span>Special Program</span> <CalendarHeart />
                          </FormLabel>
                          <FormDescription>
                            Enable the special program to display a special icon
                            on the map.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="is_sticky"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Is Sticky</FormLabel>
                          <FormDescription>
                            Set this participant as sticky
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {isSticky && (
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? Number(e.target.value) : null
                                )
                              }
                              value={field.value === null ? "" : field.value}
                              className="bg-white text-black"
                            />
                          </FormControl>
                          <FormDescription>
                            Required when Is Sticky is true
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <div className="flex space-x-4">
                          <Button
                            type="button"
                            variant={
                              field.value === "accepted" ? "default" : "outline"
                            }
                            onClick={() => field.onChange("accepted")}
                            className={
                              field.value === "accepted"
                                ? "bg-green-500 hover:bg-green-600"
                                : ""
                            }
                          >
                            {field.value === "accepted" ? "Accepted" : "Accept"}
                          </Button>
                          <Button
                            type="button"
                            variant={
                              field.value === "declined" ? "default" : "outline"
                            }
                            onClick={() => field.onChange("declined")}
                            className={
                              field.value === "declined"
                                ? "bg-red-500 hover:bg-red-600"
                                : ""
                            }
                          >
                            {field.value === "declined"
                              ? "Declined"
                              : "Decline"}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Active Status Section */}
                  <div className="rounded-lg border p-4 space-y-4">
                    <h4 className="font-medium text-base">Active Status</h4>
                    <FormField
                      control={form.control}
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
                                  form.setValue(
                                    "reactivation_requested",
                                    false
                                  );
                                  form.setValue("reactivation_notes", null);
                                  form.setValue("reactivation_status", null);
                                }
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Reactivation Request Section */}
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
                              This participant has requested reactivation.
                              Review their details and approve or deny the
                              request.
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

                        {reactivationStatus === "pending" && (
                          <div className="flex space-x-2 mt-4">
                            <Button
                              type="button"
                              onClick={() => setIsReactivationDialogOpen(true)}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              Approve Reactivation
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={handleDeclineReactivation}
                            >
                              Decline Reactivation
                            </Button>
                          </div>
                        )}

                        {reactivationStatus === "declined" && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              form.setValue("reactivation_status", "pending");
                              onSubmit({
                                ...form.getValues(),
                                user_id: targetUserId!,
                                reactivation_status: "pending",
                              });
                            }}
                            className="mt-2"
                          >
                            Reconsider Request
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {!isActive && (
              <div className="space-y-4 mt-6">
                <Alert className="bg-red-50 border-red-500">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-600">
                    Account Inactive
                  </AlertTitle>
                  <AlertDescription className="text-red-700">
                    Your account is currently inactive. Some features may be
                    limited.
                  </AlertDescription>
                </Alert>

                {!reactivationRequested ? (
                  <Button
                    type="button"
                    onClick={() => setIsReactivationRequestModalOpen(true)}
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
                    onClick={() => setIsReactivationRequestModalOpen(true)}
                    className="w-full mt-2"
                  >
                    Submit New Request
                  </Button>
                )}
              </div>
            )}

            <Separator className="my-4" />
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User ID (Not Modifiable)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled
                        className="bg-gray-100 text-gray-700"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                  "reactivation_requested",
                  "reactivation_notes",
                  "reactivation_status",
                ]}
                isSubmitting={isSubmitting}
                className="w-full"
                label={
                  isSubmitting ? "Updating..." : "Update Participant Details"
                }
              />
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
