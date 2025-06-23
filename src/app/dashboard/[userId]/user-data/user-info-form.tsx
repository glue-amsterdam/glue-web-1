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

// Update the userInfoSchema to include plan_label
const extendedUserInfoSchema = userInfoSchema.extend({
  plan_label: z.string().optional(),
});

type ExtendedUserInfo = z.infer<typeof extendedUserInfoSchema>;

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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">User Information</CardTitle>
      </CardHeader>
      <CardContent>
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
              <h3 className="text-lg font-semibold">System Information</h3>
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem className="sr-only">
                    <FormLabel>ID (Not Modifiable)</FormLabel>
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
