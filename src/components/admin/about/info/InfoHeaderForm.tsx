/* TODO ADD THE TEXT COLOR IN THE BACKEND */

"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormDescription,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { mutate } from "swr";
import { createSubmitHandler } from "@/utils/form-helpers";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/app/components/editor";
import { ColorPicker } from "@/components/ui/color-picker";

const mainInfoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  is_visible: z.boolean(),
  text_color: z.string().optional(),
  background_color: z.string().optional(),
});

type MainInfoFormData = z.infer<typeof mainInfoSchema>;

interface MainInfoFormProps {
  initialData: MainInfoFormData;
}

export function InfoHeaderForm({ initialData }: MainInfoFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();

  const form = useForm<MainInfoFormData>({
    resolver: zodResolver(mainInfoSchema),
    defaultValues: initialData,
  });

  useEffect(() => {
    form.reset(initialData);
  }, [initialData, form]);

  const onSubmit = createSubmitHandler<MainInfoFormData>(
    "/api/admin/about/info",
    async () => {
      toast({
        title: "Info header updated",
        description: "The Info header have been successfully updated.",
      });
      await mutate("/api/admin/about/info");
      router.refresh();
    },
    (error) => {
      toast({
        title: "Error",
        description: "Failed to update info header. Please try again." + error,
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (data: MainInfoFormData) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="is_visible"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Visible</Label>
                <FormDescription>
                  Toggle to show or hide the info section
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
          control={form.control}
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
          control={form.control}
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
          control={form.control}
          name="text_color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text Color</FormLabel>
              <FormDescription>Pick the color of the text</FormDescription>
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
          control={form.control}
          name="background_color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background Color</FormLabel>
              <FormDescription>
                Pick the color of the background
              </FormDescription>
              <FormControl>
                <ColorPicker
                  value={field.value || "#fff"}
                  onChange={field.onChange}
                  label="Pick background color"
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
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
    </Form>
  );
}
