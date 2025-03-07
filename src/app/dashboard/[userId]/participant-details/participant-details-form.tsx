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
} from "@/schemas/participantDetailsSchemas";
import { RichTextEditor } from "@/app/components/editor";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { useDebouncedCallback } from "use-debounce";
import { CalendarHeart, CheckCircle2 } from "lucide-react";
import { mutate } from "swr";
import { createSubmitHandler } from "@/utils/form-helpers";
import { ConfirmationDialog } from "@/app/dashboard/[userId]/participant-details/confirmation-dialog";

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
    },
    mode: "onBlur",
  });

  const isSticky = form.watch("is_sticky");
  const status = form.watch("status");

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
    if (
      values.status === "accepted" &&
      participantDetails.status !== "accepted"
    ) {
      setIsDialogOpen(true);
    } else {
      await onSubmit({ ...values, user_id: targetUserId! });
    }
    setIsSubmitting(false);
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
                </div>
              </>
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
    </Card>
  );
}
