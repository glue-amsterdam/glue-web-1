/* TODO ADD THE TEXT COLOR IN THE BACKEND */

"use client";

import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { SponsorsHeader, sponsorsHeaderSchema } from "@/schemas/sponsorsSchema";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { createSubmitHandler } from "@/utils/form-helpers";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { mutate } from "swr";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/app/components/editor";
import { ColorPicker } from "@/components/ui/color-picker";

export default function SponsorHeaderForm({
  initialData,
}: {
  initialData: SponsorsHeader;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<SponsorsHeader>({
    resolver: zodResolver(sponsorsHeaderSchema),
    defaultValues: initialData,
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sponsors_types",
  });

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = createSubmitHandler<SponsorsHeader>(
    "/api/admin/about/sponsors/header",
    async () => {
      toast({
        title: "Sponsors header updated",
        description: "The sponsors header have been successfully updated.",
      });
      await mutate("/api/admin/about/sponsors/header");
      router.refresh();
    },
    (error) => {
      toast({
        title: "Error",
        description:
          "Failed to update sponsors header. Please try again." + error,
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (data: SponsorsHeader) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          name="is_visible"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Visible</FormLabel>
                <FormDescription>
                  Toggle to show or hide the sponsors section part
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
                Pick the color of the text of the sponsors section
              </FormDescription>
              <FormControl>
                <ColorPicker
                  value={field.value || "#ffffff"}
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
                Pick the color of the background of the sponsors section
              </FormDescription>
              <FormControl>
                <ColorPicker
                  value={field.value || "#000000"}
                  onChange={field.onChange}
                  label="Pick background color"
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <Label>Sponsor Types</Label>
          {fields.map((field, index) => (
            <div
              key={field.label + index}
              className="flex items-center space-x-2 mt-2"
            >
              <Input
                {...register(`sponsors_types.${index}.label`)}
                placeholder="Sponsor type"
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {errors.sponsors_types && (
            <p className="text-red-500">
              {Array.isArray(errors.sponsors_types)
                ? errors.sponsors_types[0]?.label?.message
                : errors.sponsors_types.message}
            </p>
          )}
          {fields.length && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => append({ label: "" })}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Sponsor Type
            </Button>
          )}
        </div>

        <SaveChangesButton
          isSubmitting={isSubmitting}
          watchFields={[
            "title",
            "description",
            "sponsorsTypes",
            "is_visible",
            "text_color",
            "background_color",
          ]}
          className="w-full"
          disabled={!isDirty}
        />
      </form>
    </FormProvider>
  );
}
