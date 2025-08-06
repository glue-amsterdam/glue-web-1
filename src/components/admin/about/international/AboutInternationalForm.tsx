"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GlueInternationalContent,
  glueInternationalSectionSchema,
} from "@/schemas/internationalSchema";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createSubmitHandler } from "@/utils/form-helpers";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/app/components/editor";
import { ColorPicker } from "@/components/ui/color-picker";

export default function AboutInternationalForm({
  initialData,
}: {
  initialData: GlueInternationalContent;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<GlueInternationalContent>({
    resolver: zodResolver(glueInternationalSectionSchema),
    defaultValues: initialData,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = methods;

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = createSubmitHandler<GlueInternationalContent>(
    "/api/admin/about/international",
    async () => {
      toast({
        title: "International section updated",
        description: "The International section has been successfully updated.",
      });
      await mutate("/api/admin/about/international");
      router.refresh();
    },
    (error) => {
      toast({
        title: "Error",
        description:
          "Failed to update international section. Please try again. " + error,
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (data: GlueInternationalContent) => {
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
                    Toggle to show or hide the international section part
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
            name="subtitle"
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
          <div className="sr-only">
            <Label htmlFor="website">Website - not editable / hidden</Label>
            <Input
              id="website"
              {...register("website")}
              readOnly
              className="bg-gray-100"
            />
            {errors.website && (
              <p className="text-red-500">{errors.website.message}</p>
            )}
          </div>
          <FormField
            control={control}
            name="button_text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Button Text</FormLabel>
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
            name="button_color"
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
        </div>
        <SaveChangesButton
          isSubmitting={isSubmitting}
          watchFields={[
            "title",
            "subtitle",
            "button_text",
            "website",
            "button_color",
            "is_visible",
          ]}
          className="w-full"
        />
      </form>
    </FormProvider>
  );
}
