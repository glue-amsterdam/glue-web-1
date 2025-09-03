"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { mutate } from "swr";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { UserInfo, userInfoSchema } from "@/schemas/userInfoSchemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as z from "zod";
import { PlanType } from "@/schemas/plansSchema";
import { useToast } from "@/hooks/use-toast";
import { createSubmitHandler } from "@/utils/form-helpers";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePressKitLinks } from "@/app/context/MainContext";
import { Link as LinkIcon, ExternalLink } from "lucide-react";

// Update the userInfoSchema to include plan_label
const extendedUserInfoSchema = userInfoSchema.extend({
  plan_label: z.string().optional(),
});

type ExtendedUserInfo = z.infer<typeof extendedUserInfoSchema>;

const PressKitLinksSection = () => {
  const pressKitLinks = usePressKitLinks();

  if (
    !pressKitLinks?.pressKitLinks ||
    pressKitLinks.pressKitLinks.length === 0
  ) {
    return (
      <div className="text-center py-4 text-gray-500">
        <LinkIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No press kit links available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pressKitLinks.pressKitLinks.map((link) => (
        <div
          key={link.id}
          className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <LinkIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <a
                href={link.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline truncate"
              >
                {link.link}
              </a>
              <ExternalLink className="h-3 w-3 text-gray-400 flex-shrink-0" />
            </div>
            {link.description && (
              <p className="text-sm text-gray-600 mt-1 truncate">
                {link.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export function UserInfoForm({
  userInfo,
  isMod,
  targetUserId,
  plans,
}: {
  userInfo: UserInfo;
  isMod: boolean;
  targetUserId: string | undefined;
  plans: PlanType[];
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ExtendedUserInfo>({
    resolver: zodResolver(extendedUserInfoSchema),
    defaultValues: {
      ...userInfo,
      plan_label: plans.find((p) => p.plan_id === userInfo.plan_id)?.plan_label,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    form.reset(userInfo);
  }, [form, userInfo]);

  const onSubmit = createSubmitHandler<ExtendedUserInfo>(
    `/api/users/participants/${targetUserId}/info`,
    async () => {
      toast({
        title: "Success",
        description: "User information updated successfully.",
      });
      await mutate(`/api/users/participants/${targetUserId}/info`);
      router.refresh();
    },
    (error) => {
      toast({
        title: "Error",
        description:
          "Failed to update user information. Please try again. " + error,
        variant: "destructive",
      });
    }
  );

  const handleSubmit = async (values: ExtendedUserInfo) => {
    setIsSubmitting(true);
    // Check if the plan has changed
    if (values.plan_id !== userInfo.plan_id) {
      const currentPlan = plans.find((p) => p.plan_id === userInfo.plan_id);
      const newPlan = plans.find((p) => p.plan_id === values.plan_id);
      const confirmed = window.confirm(
        `Are you sure you want to change the user's plan from ${
          currentPlan?.plan_label || "current plan"
        } to ${newPlan?.plan_label || "new plan"}?`
      );
      if (!confirmed) {
        setIsSubmitting(false);
        return;
      }
    }
    await onSubmit(values);
    setIsSubmitting(false);
  };

  // Mostrar alerta si hay solicitud de upgrade
  const hasUpgradeRequest = userInfo.upgrade_requested;
  const requestedPlan = plans.find(
    (p) => p.plan_id === userInfo.upgrade_requested_plan_id
  );

  // Función para aprobar upgrade
  const handleApproveUpgrade = async () => {
    if (!targetUserId) return;
    setIsSubmitting(true);
    try {
      // 1. Actualizar user_info
      const res = await fetch(`/api/users/participants/${targetUserId}/info`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userInfo,
          plan_id: userInfo.upgrade_requested_plan_id,
          plan_type: userInfo.upgrade_requested_plan_type,
          upgrade_requested: false,
          upgrade_requested_plan_id: null,
          upgrade_requested_plan_type: null,
          upgrade_request_notes: null,
          upgrade_requested_at: null,
        }),
      });
      if (!res.ok) throw new Error("Failed to approve upgrade");

      // 2. Verificar si existe participant_details
      const detailsRes = await fetch(
        `/api/users/participants/${targetUserId}/details`
      );
      if (detailsRes.status === 404) {
        // Si no existe, crear uno con valores por defecto
        const slug = `${
          userInfo.user_name || "participant"
        }-${targetUserId.slice(0, 8)}`;
        const createRes = await fetch(
          `/api/users/participants/${targetUserId}/details`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: targetUserId,
              short_description: "",
              description: "",
              slug,
              special_program: false,
              status: "accepted",
              is_active: true,
              reactivation_requested: false,
              reactivation_notes: null,
              reactivation_status: null,
            }),
          }
        );
        if (!createRes.ok)
          throw new Error("Failed to create participant details");
      }

      toast({
        title: "Upgrade approved",
        description: "The user's plan has been updated.",
      });
      await mutate(`/api/users/participants/${targetUserId}/info`);
      router.refresh();
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to approve upgrade.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para rechazar upgrade
  const handleRejectUpgrade = async () => {
    if (!targetUserId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/users/participants/${targetUserId}/info`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userInfo,
          upgrade_requested: false,
          upgrade_requested_plan_id: null,
          upgrade_requested_plan_type: null,
          upgrade_request_notes: null,
          upgrade_requested_at: null,
        }),
      });
      if (!res.ok) throw new Error("Failed to reject upgrade");
      toast({
        title: "Upgrade rejected",
        description: "The upgrade request has been rejected.",
      });
      await mutate(`/api/users/participants/${targetUserId}/info`);
      router.refresh();
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to reject upgrade.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-[80%] mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">User Information</CardTitle>
      </CardHeader>
      <CardContent>
        {hasUpgradeRequest && (
          <Alert className="mb-4 bg-yellow-50 border-yellow-200">
            <AlertTitle className="text-yellow-800 flex items-center gap-2">
              <Badge variant="outline">Upgrade Requested</Badge>
              {requestedPlan
                ? requestedPlan.plan_label
                : userInfo.upgrade_requested_plan_type}
            </AlertTitle>
            <AlertDescription className="text-yellow-700">
              {userInfo.upgrade_request_notes && (
                <div className="mb-2">
                  <span className="font-medium">Notes:</span>{" "}
                  {userInfo.upgrade_request_notes}
                </div>
              )}
              <div>
                <span className="font-medium">Requested at:</span>{" "}
                {userInfo.upgrade_requested_at
                  ? new Date(userInfo.upgrade_requested_at).toLocaleString()
                  : "-"}
              </div>
              {isMod && (
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                    onClick={handleApproveUpgrade}
                    disabled={isSubmitting}
                  >
                    Approve Upgrade
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleRejectUpgrade}
                    disabled={isSubmitting}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="user_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      className="bg-white text-black"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isMod && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Moderator Settings</h3>
                  <FormField
                    control={form.control}
                    name="is_mod"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Moderator Status
                          </FormLabel>
                          <FormDescription>
                            This user will have moderator privileges if enabled.
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

                  <FormField
                    control={form.control}
                    name="plan_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan</FormLabel>

                        <Select
                          onValueChange={(value) => {
                            const selectedPlan = plans.find(
                              (p) => p.plan_id === value
                            );
                            if (selectedPlan) {
                              form.setValue("plan_id", selectedPlan.plan_id, {
                                shouldDirty: true,
                              });
                              form.setValue(
                                "plan_type",
                                selectedPlan.plan_type,
                                { shouldDirty: true }
                              );
                            }
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white text-black">
                              <SelectValue placeholder="Select a plan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {plans.map((plan) => (
                              <SelectItem
                                key={plan.plan_id}
                                value={plan.plan_id}
                              >
                                {plan.plan_label}
                              </SelectItem>
                            ))}
                            {!plans.some((p) => p.plan_id === field.value) && (
                              <SelectItem value={field.value}>
                                Unknown Plan
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        {!plans.some(
                          (p) => p.plan_id === form.getValues("plan_id")
                        ) && (
                          <p className="text-red-500 text-xs mt-2">
                            {`The user's current plan is not in the list of available plans.The plan must be deleted or unactive, please review these or select a different plan.`}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="plan_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan Type</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-white text-black"
                            readOnly
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            <Separator className="my-4" />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <FormField
                control={form.control}
                name="phone_numbers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Numbers</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value?.join(", ") || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.split(",").map((s) => s.trim())
                          )
                        }
                        className="bg-white text-black"
                      />
                    </FormControl>
                    <FormDescription>
                      Enter phone numbers separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-4" />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Social Media</h3>
              <FormField
                control={form.control}
                name="social_media.facebookLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook Link</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        className="bg-white text-black"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="social_media.linkedinLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn Link</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        className="bg-white text-black"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="social_media.instagramLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram Link</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        className="bg-white text-black"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-4" />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Visible Information</h3>
              <FormField
                control={form.control}
                name="visible_emails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visible Emails</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value?.join(", ") || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.split(",").map((s) => s.trim())
                          )
                        }
                        className="bg-white text-black"
                      />
                    </FormControl>
                    <FormDescription>
                      Enter visible email addresses separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visible_websites"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visible Websites</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value?.join(", ") || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.split(",").map((s) => s.trim())
                          )
                        }
                        className="bg-white text-black"
                      />
                    </FormControl>
                    <FormDescription>
                      Enter visible websites separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-4" />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Press Kit Links</h3>
              <PressKitLinksSection />
            </div>

            <div className="pt-6">
              <SaveChangesButton
                isDirty={form.formState.isDirty}
                watchFields={[
                  "visible_emails",
                  "visible_websites",
                  "plan_id",
                  "plan_type",
                  "phone_numbers",
                  "social_media.facebookLink",
                  "social_media.linkedinLink",
                  "social_media.instagramLink",
                  "user_name",
                  "is_mod",
                ]}
                isSubmitting={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Updating..." : "Update User Info"}
              </SaveChangesButton>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
