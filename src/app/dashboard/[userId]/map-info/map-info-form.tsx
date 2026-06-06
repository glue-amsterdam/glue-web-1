"use client";

import { useState, useEffect } from "react";
import {
  useForm,
  Controller,
  FormProvider,
  useFormContext,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  MapInfo,
  MapInfoInput,
  mapInfoSchema,
} from "@/schemas/mapInfoSchemas";
import { createSubmitHandler } from "@/utils/form-helpers";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { ParticipantSection } from "@/app/dashboard/[userId]/participant-details/participant-section";
import Separator from "@/components/separator";
import { AddressAutocompleteField } from "@/components/map/address-autocomplete-field";

interface MapInfoFormProps {
  initialData: MapInfo | { error: string } | undefined;
  targetUserId: string;
}

function FormFields() {
  const { control, watch, setValue } = useFormContext<MapInfoInput>();
  const noAddress = watch("no_address");

  useEffect(() => {
    if (noAddress) {
      setValue("formatted_address", null);
      setValue("latitude", null);
      setValue("longitude", null);
    }
  }, [noAddress, setValue]);

  return (
    <>
      <Controller
        name="no_address"
        control={control}
        render={({ field }) => (
          <div className="flex items-center space-x-2 mini-padding">
            <Checkbox
              id="no_address"
              checked={field.value || false}
              onCheckedChange={field.onChange}
            />
            <Label htmlFor="no_address">
              {`I don't have a location to present during GLUE, please provide me one`}
            </Label>
          </div>
        )}
      />

      {!noAddress && (
        <AddressAutocompleteField
          control={control}
          setValue={setValue}
          className="mini-padding"
        />
      )}

      <div className="mini-padding">
        <Label htmlFor="exhibition_space_preference">
          What sort of exhibition space would you like to have?
        </Label>
        <Controller
          name="exhibition_space_preference"
          control={control}
          render={({ field }) => (
            <Textarea
              id="exhibition_space_preference"
              {...field}
              value={field.value ?? ""}
              placeholder="Describe your preferred exhibition space (optional)"
              className="mt-1 min-h-[100px]"
            />
          )}
        />
      </div>
    </>
  );
}

export function MapInfoForm({ initialData, targetUserId }: MapInfoFormProps) {
  const isError = initialData && "error" in initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<MapInfoInput, unknown, MapInfo>({
    resolver: zodResolver(mapInfoSchema),
    defaultValues: {
      user_id: targetUserId,
      formatted_address: isError
        ? null
        : initialData?.formatted_address || null,
      latitude: isError ? null : initialData?.latitude || null,
      longitude: isError ? null : initialData?.longitude || null,
      no_address: isError ? true : initialData?.no_address || false,
      exhibition_space_preference: isError
        ? null
        : initialData?.exhibition_space_preference || null,
    },
  });

  useEffect(() => {
    if (!isError && initialData) {
      form.reset({ ...(initialData as MapInfo), user_id: targetUserId });
    }
  }, [form, initialData, isError, targetUserId]);

  const onSubmit = createSubmitHandler<MapInfo>(
    `/api/users/participants/${targetUserId}/map-info`,
    async () => {
      toast({
        title: "Success",
        description: "Map info updated successfully.",
      });
      await mutate(`/api/users/participants/${targetUserId}/map-info`);
      router.refresh();
    },
    (error) => {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: "Failed to update Map info. Please try again. " + error,
        variant: "destructive",
      });
    },
    isError ? "POST" : "PUT"
  );

  const handleSubmit = async (values: MapInfo) => {
    setIsSubmitting(true);
    await onSubmit({ ...values, user_id: targetUserId });
    setIsSubmitting(false);
  };

  const {
    formState: { errors },
  } = form;

  return (
    <div className="px-[30px] mini-padding">
      <h1 className="title-text">Map Information</h1>
      <Separator />
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6"
        >
          <ParticipantSection title="Location & exhibition space">
            <input type="hidden" {...form.register("user_id")} />
            <FormFields />
            {errors.user_id && (
              <p className="text-red-500">{errors.user_id.message}</p>
            )}
            <div className="flex justify-center mini-padding">
              <SaveChangesButton
                watchFields={[
                  "formatted_address",
                  "latitude",
                  "longitude",
                  "no_address",
                  "exhibition_space_preference",
                ]}
                isSubmitting={isSubmitting}
                label={
                  !isError && initialData
                    ? "Update map information"
                    : "Save map information"
                }
              />
            </div>
          </ParticipantSection>
        </form>
      </FormProvider>
    </div>
  );
}
