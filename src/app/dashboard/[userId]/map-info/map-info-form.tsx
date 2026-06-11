"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { MapInfoFields } from "@/components/participate/map-info-fields";

interface MapInfoFormProps {
  initialData: MapInfo | { error: string } | undefined;
  targetUserId: string;
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
    control,
    setValue,
    formState: { errors },
  } = form;

  return (
    <div className="px-[30px] mini-padding">
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6"
        >
          <ParticipantSection title="Location & exhibition space">
            <input type="hidden" {...form.register("user_id")} />
            <MapInfoFields
              control={control}
              setValue={setValue}
              errors={errors}
              className="mini-padding"
            />
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
