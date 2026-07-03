"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import type { ParticipantDetailsInput } from "@/schemas/participantDetailsSchemas";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { ModeratorActiveStatus } from "./active-status-section";
import { DisplayNumberField } from "./display-number-field";
import { MODERATOR_WATCH_FIELDS } from "./use-moderator-actions";
import { useParticipantCategories } from "@/context/ParticipantCategoriesContext";
import {
  getAssignableCategories,
  getDefaultCategory,
  isModeratorCategorySwitchChecked,
  resolveModeratorCategorySwitchChange,
} from "@/lib/participants/participant-categories";

export function ModeratorSettings({
  onApproveReactivation,
  onDeclineReactivation,
  onReconsiderRequest,
  renderReactivationDetails,
  targetUserId,
  onSave,
  isSubmitting,
}: {
  onApproveReactivation: () => void;
  onDeclineReactivation: () => void;
  onReconsiderRequest: () => void;
  renderReactivationDetails: () => React.ReactNode;
  targetUserId: string;
  onSave: () => void;
  isSubmitting: boolean;
}) {
  const { control, setValue } = useFormContext<ParticipantDetailsInput>();
  const { categories } = useParticipantCategories();
  const assignableCategories = getAssignableCategories(categories);
  const standardCategory = getDefaultCategory(categories);

  return (
    <div className="base-text-size mini-padding lg:grid lg:grid-cols-3 space-y-[50px] lg:space-y-0 lg:gap-[15px]">
      <FormField
        control={control}
        name="status"
        render={({ field }) => (
          <FormItem className="max-w-[300px] mx-auto">
            <FormLabel>Application status</FormLabel>
            <FormDescription>
              Whether this person is approved as a GLUE participant.
            </FormDescription>
            <div className="flex gap-[15px] flex-wrap">
              <Button
                type="button"
                variant={field.value === "accepted" ? "default" : "outline"}
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
                variant={field.value === "declined" ? "default" : "outline"}
                onClick={() => field.onChange("declined")}
                className={
                  field.value === "declined"
                    ? "bg-red-500 hover:bg-red-600"
                    : ""
                }
              >
                {field.value === "declined" ? "Declined" : "Decline"}
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="px-4 flex flex-col gap-[30px]">
        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Participant category</FormLabel>
              <FormDescription>
                Assignable categories appear in
                filters, badges, and map markers.
              </FormDescription>
              <p className="text-sm text-muted-foreground">
                Current:{" "}
                {assignableCategories.some(
                  (category) => category.slug === field.value
                )
                  ? assignableCategories.find(
                    (category) => category.slug === field.value
                  )?.label ?? field.value
                  : standardCategory.label}
              </p>
              <div className="flex flex-col gap-[20px] pt-[10px]">
                {assignableCategories.map((category) => (
                  <FormItem
                    key={category.slug}
                    className="flex gap-[15px] space-y-0"
                  >
                    <FormControl>
                      <Switch
                        checked={isModeratorCategorySwitchChecked(
                          field.value,
                          category.slug,
                          standardCategory.slug
                        )}
                        onCheckedChange={(checked) => {
                          field.onChange(
                            resolveModeratorCategorySwitchChange(
                              field.value,
                              category.slug,
                              checked,
                              standardCategory.slug
                            )
                          );
                        }}
                        aria-label={category.label}
                      />
                    </FormControl>
                    <div className="space-y-0.5">
                      <FormLabel className="translate-y-1 font-normal">
                        {category.label}
                      </FormLabel>
                    </div>
                  </FormItem>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="col-start-3 flex gap-[15px]">
              <FormControl>
                <Switch
                  checked={field.value || false}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (checked) {
                      setValue("reactivation_requested", false, {
                        shouldDirty: true,
                      });
                      setValue("reactivation_notes", null, { shouldDirty: true });
                      setValue("reactivation_status", null, { shouldDirty: true });
                    }
                  }}
                />
              </FormControl>
              <div className="space-y-0.5">
                <FormLabel className="flex-wrap translate-y-1">
                  <span>Active in current tour</span>
                </FormLabel>
                <FormDescription>
                  {field.value
                    ? "This participant is included in this year's Design Route."
                    : "Activating will make this participant part of this year's Design Route."}
                </FormDescription>
              </div>
            </FormItem>
          )}
        /></div>
      <DisplayNumberField isMod targetUserId={targetUserId} />
      <div className="col-span-3">
        <ModeratorActiveStatus
          onApproveReactivation={onApproveReactivation}
          onDeclineReactivation={onDeclineReactivation}
          onReconsiderRequest={onReconsiderRequest}
          renderReactivationDetails={renderReactivationDetails}
        />
      </div>

      <div className="col-span-3 flex justify-center mini-padding">
        <SaveChangesButton
          type="button"
          onClick={onSave}
          watchFields={[...MODERATOR_WATCH_FIELDS]}
          isSubmitting={isSubmitting}
          label={isSubmitting ? "Updating..." : "Update"}
        />
      </div>
    </div>
  );
}
