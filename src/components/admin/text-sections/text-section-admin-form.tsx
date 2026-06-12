"use client";

import { useEffect, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createActionSubmitHandler } from "@/utils/form-helpers";
import { saveTextSection } from "@/app/actions/admin/text-sections";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { RichTextEditor } from "@/components/editor";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { TextSectionData } from "@/lib/text-sections/types";
import type { TextSectionSlug, TextSectionVariant } from "@/schemas/textSectionSchema";
import { textSectionUpdateSchema, type TextSectionUpdate } from "@/schemas/textSectionSchema";

type Props = {
  slug: TextSectionSlug;
  sectionTitle: string;
  initialData: TextSectionData;
};

const TextSectionFields = ({ variant }: { variant: TextSectionVariant }) => {
  const { control, watch } = useFormContext<TextSectionUpdate>();
  const showButton = watch("show_button");

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input type="text" value={field.value || ""} onChange={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <RichTextEditor value={field.value || ""} onChange={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {variant === "block" && (
        <>
          <FormField
            name="show_button"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Show button</FormLabel>
                  <FormDescription>
                    Toggle to show or hide the call-to-action button
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          {showButton && (
            <>
              <FormField
                control={control}
                name="button_label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Button label</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="button_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Button link</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="/path or #anchor"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

const toFormValues = (data: TextSectionData): TextSectionUpdate => ({
  title: data.title,
  description: data.description,
  show_button: data.showButton,
  button_label: data.buttonLabel,
  button_link: data.buttonLink,
});

const TextSectionAdminForm = ({ slug, sectionTitle, initialData }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<TextSectionUpdate>({
    resolver: zodResolver(textSectionUpdateSchema),
    defaultValues: toFormValues(initialData),
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    reset(toFormValues(initialData));
  }, [initialData, reset]);

  const onSubmit = createActionSubmitHandler<TextSectionUpdate, TextSectionData>(
    (values) => saveTextSection(slug, values),
    async (updated) => {
      reset(toFormValues(updated));

      toast({
        title: "Section updated",
        description: `${sectionTitle} has been successfully updated.`,
      });
      router.refresh();
    },
    () => {
      toast({
        title: "Error",
        description: "Failed to update the section. Please try again.",
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (values: TextSectionUpdate) => {
    setIsSubmitting(true);
    await onSubmit(values);
    setIsSubmitting(false);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <TextSectionFields variant={initialData.variant} />
        <SaveChangesButton isSubmitting={isSubmitting} />
      </form>
    </FormProvider>
  );
};

export default TextSectionAdminForm;
