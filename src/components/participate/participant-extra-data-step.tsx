"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import BigButton from "@/components/big-button";
import { ParticipateFormField } from "@/components/participate/participate-form-field";
import {
  participantExtraDataSchema,
  type ParticipantExtraDataFormData,
} from "@/schemas/participantExtraDataSchema";

type ParticipantExtraDataStepProps = {
  onSubmit: (data: ParticipantExtraDataFormData) => void;
  onBack: () => void;
  defaultValues?: Partial<ParticipantExtraDataFormData>;
};

export const ParticipantExtraDataStep = ({
  onSubmit,
  onBack,
  defaultValues,
}: ParticipantExtraDataStepProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ParticipantExtraDataFormData>({
    resolver: zodResolver(participantExtraDataSchema),
    defaultValues: {
      phone_numbers: defaultValues?.phone_numbers ?? [],
      visible_emails: defaultValues?.visible_emails ?? [],
      glue_communication_email: defaultValues?.glue_communication_email ?? "",
      visible_websites: defaultValues?.visible_websites ?? [],
      social_media: defaultValues?.social_media ?? {},
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-(--field-max-width) lg:max-w-[1045px] mx-auto title-padding pb-[30px] w-full"
      noValidate
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[15px] lg:gap-[30px]">
        <Controller
          name="glue_communication_email"
          control={control}
          render={({ field }) => (
            <ParticipateFormField
              label="Email for Practical GLUE Communication"
              name="glue_communication_email"
              type="email"
              required
              value={typeof field.value === "string" ? field.value : ""}
              onChange={field.onChange}
              error={errors.glue_communication_email?.message}
              description="Used for practical GLUE communication"
            />
          )}
        />
        <Controller
          name="phone_numbers"
          control={control}
          render={({ field }) => (
            <ParticipateFormField
              label="Phone Number(s)"
              name="phone_numbers"
              value={field.value?.join(", ") || ""}
              onChange={(value) =>
                field.onChange(value.split(",").map((s) => s.trim()))
              }
              error={errors.phone_numbers?.message}
              description="Enter separated  by commas (max 3)"
            />
          )}
        />
        <Controller
          name="visible_emails"
          control={control}
          render={({ field }) => (
            <ParticipateFormField
              label="Public Email(s)"
              name="visible_emails"
              value={field.value?.join(", ") || ""}
              onChange={(value) =>
                field.onChange(value.split(",").map((s) => s.trim()))
              }
              error={errors.visible_emails?.message}
              description="Enter separated by commas (max 3)"
            />
          )}
        />
        <Controller
          name="visible_websites"
          control={control}
          render={({ field }) => (
            <ParticipateFormField
              label="Website(s)"
              name="visible_websites"
              value={field.value?.join(", ") || ""}
              onChange={(value) =>
                field.onChange(value.split(",").map((s) => s.trim()))
              }
              error={errors.visible_websites?.message}
              description="Enter separated by commas (max 3)"
            />
          )}
        />
        <Controller
          name="social_media.facebookLink"
          control={control}
          render={({ field }) => (
            <ParticipateFormField
              label="Facebook"
              name="social_media.facebookLink"
              value={field.value || ""}
              onChange={field.onChange}
              error={
                (errors.social_media as { facebookLink?: { message?: string } })
                  ?.facebookLink?.message
              }
            />
          )}
        />
        <Controller
          name="social_media.linkedinLink"
          control={control}
          render={({ field }) => (
            <ParticipateFormField
              label="LinkedIn"
              name="social_media.linkedinLink"
              value={field.value || ""}
              onChange={field.onChange}
              error={
                (errors.social_media as { linkedinLink?: { message?: string } })
                  ?.linkedinLink?.message
              }
            />
          )}
        />
        <Controller
          name="social_media.instagramLink"
          control={control}
          render={({ field }) => (
            <ParticipateFormField
              label="Instagram"
              name="social_media.instagramLink"
              value={field.value || ""}
              onChange={field.onChange}
              error={
                (errors.social_media as { instagramLink?: { message?: string } })
                  ?.instagramLink?.message
              }
            />
          )}
        />
      </div>

      <div className="flex justify-between pt-[30px] gap-4 pb-(--site-footer-h) lg:pb-0">
        <button
          type="button"
          onClick={onBack}
          className="body-text text-left hover:underline cursor-pointer"
        >
          Back
        </button>
        <BigButton as="submit" label="next step" mode="navbar" />
      </div>
    </form>
  );
};
