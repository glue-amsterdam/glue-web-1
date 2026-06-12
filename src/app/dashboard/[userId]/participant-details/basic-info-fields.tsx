"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { RichTextEditor } from "@/components/editor";
import { useFormContext } from "react-hook-form";
import type { ParticipantDetailsInput } from "@/schemas/participantDetailsSchemas";

export function BasicInfoFields({ readOnly = false }: { readOnly?: boolean }) {
  const { control } = useFormContext<ParticipantDetailsInput>();

  return (
    <div className="mini-padding space-y-[15px]">
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <RichTextEditor
                maxLength={2500}
                value={field.value || ""}
                onChange={field.onChange}
                readOnly={readOnly}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
