"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { createSubmitHandler } from "@/utils/form-helpers";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import {
  type CitizensSection,
  citizensSectionSchema,
} from "@/schemas/citizenSchema";
import { mutate } from "swr";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { ColorPicker } from "@/components/ui/color-picker";
import { RichTextEditor } from "@/app/components/editor";

interface AboutCitizenHeaderFormProps {
  initialData: {
    title: string;
    description: string;
    is_visible: boolean;
  };
}

export function AboutCitizenHeaderForm({
  initialData,
}: AboutCitizenHeaderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<CitizensSection>({
    resolver: zodResolver(citizensSectionSchema),
    defaultValues: initialData,
  });

  const { handleSubmit, reset, control } = methods;

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = createSubmitHandler<CitizensSection>(
    "/api/admin/about/citizens",
    async () => {
      toast({
        title: "Citizens headers updated",
        description: "The citizens headers have been successfully updated.",
      });
      await mutate("/api/admin/about/citizens");
      router.refresh();
    },
    (error) => {
      toast({
        title: "Error",
        description:
          "Failed to update citizens headers. Please try again." + error,
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (data: CitizensSection) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            name="is_visible"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Visible</FormLabel>
                  <FormDescription>
                    Toggle to show or hide the curated citizens section
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <RichTextEditor
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <RichTextEditor
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
          name="text_color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text Color</FormLabel>
              <FormDescription>
                Pick the color of the text in the carousel
              </FormDescription>
              <FormControl>
                <ColorPicker
                  value={field.value || "#fff"}
                  onChange={field.onChange}
                  label="Pick text color"
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="background_color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background Color</FormLabel>
              <FormDescription>
                Pick the color of the background of the citizens of honour
                section
              </FormDescription>
              <FormControl>
                <ColorPicker
                  value={field.value || "#000000"}
                  onChange={field.onChange}
                  label="Pick background color"
                  className="w-full"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <SaveChangesButton
          isSubmitting={isSubmitting}
          watchFields={[
            "title",
            "description",
            "is_visible",
            "text_color",
            "background_color",
          ]}
          className="w-full"
        />
      </form>
    </FormProvider>
  );
}
