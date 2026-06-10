"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import type { ParticipantDetailsInput } from "@/schemas/participantDetailsSchemas";

const inputClassName =
  "bg-(--white-color) text-(--black-color) disabled:opacity-60";

type SocialMediaFieldsProps = {
  readOnly?: boolean;
};

export const SocialMediaFields = ({
  readOnly = false,
}: SocialMediaFieldsProps) => {
  const { control } = useFormContext<ParticipantDetailsInput>();

  return (
    <div className="mini-padding space-y-[15px]">
      <FormField
        control={control}
        name="social_media.facebookLink"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Facebook link</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={typeof field.value === "string" ? field.value : ""}
                disabled={readOnly}
                className={inputClassName}
                placeholder="https://facebook.com/..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="social_media.linkedinLink"
        render={({ field }) => (
          <FormItem>
            <FormLabel>LinkedIn link</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={typeof field.value === "string" ? field.value : ""}
                disabled={readOnly}
                className={inputClassName}
                placeholder="https://linkedin.com/in/..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="social_media.instagramLink"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Instagram link</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={typeof field.value === "string" ? field.value : ""}
                disabled={readOnly}
                className={inputClassName}
                placeholder="https://instagram.com/..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
