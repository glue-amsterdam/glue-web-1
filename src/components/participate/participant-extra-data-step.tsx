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
      className="max-w-[508px] lg:max-w-[1045px] mx-auto pt-[40px] lg:pt-[60px] pb-[30px] "
      noValidate
    >
      <h1 className="title-text pb-[30px] uppercase">Participant Information</h1>
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
              placeholder="Enter email for practical GLUE communication"
              description="This email will be used for practical GLUE communication"
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
              placeholder="Enter phone numbers separated by commas"
              description="Enter phone numbers separated by commas (max 3)"
            />
          )}
        />
        <Controller
          name="visible_emails"
          control={control}
          render={({ field }) => (
            <ParticipateFormField
              label="Visible Email(s)"
              name="visible_emails"
              value={field.value?.join(", ") || ""}
              onChange={(value) =>
                field.onChange(value.split(",").map((s) => s.trim()))
              }
              error={errors.visible_emails?.message}
              placeholder="Enter visible emails separated by commas"
              description="Enter visible email addresses separated by commas (max 3)"
            />
          )}
        />
        <Controller
          name="visible_websites"
          control={control}
          render={({ field }) => (
            <ParticipateFormField
              label="Visible Website(s)"
              name="visible_websites"
              value={field.value?.join(", ") || ""}
              onChange={(value) =>
                field.onChange(value.split(",").map((s) => s.trim()))
              }
              error={errors.visible_websites?.message}
              placeholder="Enter visible websites separated by commas"
              description="Enter visible websites separated by commas (max 3)"
            />
          )}
        />

        <p className="base-text-size lg:col-span-2">Social Media</p>

        <Controller
          name="social_media.facebookLink"
          control={control}
          render={({ field }) => (
            <ParticipateFormField
              label="Facebook Link"
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
              label="LinkedIn Link"
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
              label="Instagram Link"
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
          className="base-text-size text-left hover:underline cursor-pointer"
        >
          Back
        </button>
        <BigButton as="submit" label="Next Step" mode="navbar" />
      </div>
    </form>
  );
};
