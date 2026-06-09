"use client";

import React, { useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/utils/supabase/storage/client";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RichTextEditor } from "@/app/components/editor";
import { Switch } from "@/components/ui/switch";
import { config } from "@/config";
import { AdminImagePreview } from "@/components/admin/admin-image-preview";
import {
  createUploadProgressHandler,
  type UploadState,
} from "@/components/image-upload-overlay";
import { z } from "zod";
import type { PressItem } from "@/schemas/pressSchema";
import { mutate } from "swr";

const pressItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  image_url: z.string().optional(),
  isVisible: z.boolean(),
  file: z.any().optional(),
  oldImageUrl: z.string().optional(),
});

const pressItemsSchema = z.array(pressItemSchema);

const DEFAULT_PRESS_ITEMS: PressItem[] = [
  {
    id: "press-item-1",
    title: "",
    description: "",
    image_url: "",
    isVisible: false,
  },
  {
    id: "press-item-2",
    title: "",
    description: "",
    image_url: "",
    isVisible: false,
  },
];

interface PressItemsFormProps {
  initialItems: PressItem[];
}

export function PressItemsForm({ initialItems }: PressItemsFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadState, setUploadState] = React.useState<UploadState | null>(null);
  const [uploadingIndex, setUploadingIndex] = React.useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const handleUploadProgress = createUploadProgressHandler(setUploadState);

  const form = useForm<{ pressItems: PressItem[] }>({
    resolver: zodResolver(z.object({ pressItems: pressItemsSchema })),
    defaultValues: {
      pressItems: mergePressItems(initialItems, DEFAULT_PRESS_ITEMS),
    },
  });

  useEffect(() => {
    const mergedItems = mergePressItems(initialItems, DEFAULT_PRESS_ITEMS);
    form.reset({ pressItems: mergedItems });
  }, [initialItems, form]);

  function mergePressItems(
    initialItems: PressItem[],
    defaultItems: PressItem[]
  ): PressItem[] {
    const mergedItems = [...defaultItems];
    initialItems.forEach((item) => {
      const index = mergedItems.findIndex(
        (defaultItem) => defaultItem.id === item.id
      );
      if (index !== -1) {
        mergedItems[index] = { ...mergedItems[index], ...item };
      }
    });
    return mergedItems;
  }

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);

      const oldImageUrl = form.getValues(`pressItems.${index}.image_url`);

      form.setValue(`pressItems.${index}.image_url`, imageUrl, {
        shouldDirty: true,
      });
      form.setValue(`pressItems.${index}.file`, file, {
        shouldDirty: true,
      });
      form.setValue(`pressItems.${index}.oldImageUrl`, oldImageUrl, {
        shouldDirty: true,
      });

      form.trigger(`pressItems.${index}.image_url`);
    }
  };

  const onSubmitPressItem = async (index: number) => {
    setIsSubmitting(true);
    setUploadingIndex(index);
    const pressItem = form.getValues(`pressItems.${index}`);
    try {
      let newImageUrl = pressItem.image_url;
      if (pressItem.file) {
        setUploadState({ stage: "compressing", progress: 5 });

        const { imageUrl, error } = await uploadImage({
          file: pressItem.file,
          bucket: config.bucketName,
          folder: "about/press-items",
          onProgress: handleUploadProgress,
        });
        if (error) {
          throw new Error(`Failed to upload image: ${error}`);
        }
        newImageUrl = imageUrl;
      }

      setUploadState({ stage: "saving", progress: 96 });

      const response = await fetch(`/api/admin/about/press/${pressItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...pressItem,
          image_url: newImageUrl,
          oldImageUrl: pressItem.oldImageUrl,
        }),
      });

      mutate("/api/admin/about/press");

      if (!response.ok) {
        throw new Error("Failed to update press item");
      }

      toast({
        title: "Press item updated",
        description: `${pressItem.title} has been successfully updated.`,
      });

      form.setValue(`pressItems.${index}.image_url`, newImageUrl);
      form.setValue(`pressItems.${index}.oldImageUrl`, undefined);
      form.setValue(`pressItems.${index}.file`, undefined);
    } catch (error) {
      console.error(`${pressItem.title} submission error:`, error);
      toast({
        title: "Error",
        description: `Failed to update press item ${index + 1
          }. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setUploadState(null);
      setUploadingIndex(null);
      setIsSubmitting(false);
    }
  };

  const isBusy = isSubmitting || uploadState !== null;

  return (
    <Form {...form}>
      <div className="mt-2 grid grid-cols-1 lg:grid-cols-2 gap-5 justify-around">
        {form.watch("pressItems").map((field, index) => (
          <form
            key={field.id}
            onSubmit={(e) => {
              e.preventDefault();
              onSubmitPressItem(index);
            }}
            className="border p-4 rounded-md w-full"
          >
            <FormField
              control={form.control}
              name={`pressItems.${index}.isVisible`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Visible</FormLabel>
                    <FormDescription>
                      Toggle to show or hide this info item
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
              name={`pressItems.${index}.title`}
              render={({ field }) => (
                <FormItem className="flex-grow mr-2 mb-4">
                  <FormControl>
                    <Input {...field} placeholder="Item Title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <AdminImagePreview
              src={field.image_url}
              alt={`Press item ${index + 1}`}
              uploadState={uploadingIndex === index ? uploadState : null}
            />
            {field.file && uploadingIndex !== index && (
              <p className="mb-2 text-xs text-muted-foreground">
                New file selected — save to apply
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBusy}
              onClick={() => fileInputRefs.current[index]?.click()}
              className="w-full mb-2"
            >
              {field.image_url ? "Change Image" : "Upload Image"}
            </Button>
            <FormField
              control={form.control}
              name={`pressItems.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Description</FormLabel>
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

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, index)}
              ref={(el) => {
                fileInputRefs.current[index] = el;
              }}
              className="hidden"
            />

            <SaveChangesButton
              isSubmitting={isSubmitting}
              watchFields={[
                `pressItems.${index}.title`,
                `pressItems.${index}.description`,
                `pressItems.${index}.image_url`,
                `pressItems.${index}.file`,
                `pressItems.${index}.oldImageUrl`,
                `pressItems.${index}.isVisible`,
              ]}
              className="w-full mt-4"
            />
          </form>
        ))}
      </div>
    </Form>
  );
}
