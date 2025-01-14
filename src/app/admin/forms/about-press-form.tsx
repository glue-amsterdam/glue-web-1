"use client";

import React, { useState, useRef, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon } from "lucide-react";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { uploadImage } from "@/utils/supabase/storage/client";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RichTextEditor } from "@/app/components/editor";
import { Textarea } from "@/components/ui/textarea";
import {
  PressItem,
  PressItemsSectionContent,
  pressItemsSectionSchema,
} from "@/schemas/pressSchema";
import { mutate } from "swr";
import { Switch } from "@/components/ui/switch";
import { config } from "@/env";

interface PressItemFormProps {
  initialData: PressItemsSectionContent;
}

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

export default function PressSectionForm({ initialData }: PressItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const methods = useForm<PressItemsSectionContent>({
    resolver: zodResolver(pressItemsSectionSchema),
    defaultValues: {
      ...initialData,
      pressItems: mergePressItems(initialData.pressItems, DEFAULT_PRESS_ITEMS),
    },
  });

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = methods;

  useEffect(() => {
    reset({
      ...initialData,
      pressItems: mergePressItems(
        initialData.pressItems || [],
        DEFAULT_PRESS_ITEMS
      ),
    });
  }, [initialData, reset]);

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

      const oldImageUrl = methods.getValues(`pressItems.${index}.image_url`);

      methods.setValue(`pressItems.${index}.image_url`, imageUrl, {
        shouldDirty: true,
      });
      methods.setValue(`pressItems.${index}.file`, file, {
        shouldDirty: true,
      });
      methods.setValue(`pressItems.${index}.oldImageUrl`, oldImageUrl, {
        shouldDirty: true,
      });

      methods.trigger(`pressItems.${index}.image_url`);
    }
  };

  const onSubmitPressItem = async (index: number) => {
    setIsSubmitting(true);
    const pressItem = methods.getValues(`pressItems.${index}`);
    try {
      let newImageUrl = pressItem.image_url;
      if (pressItem.file) {
        const { imageUrl, error } = await uploadImage({
          file: pressItem.file,
          bucket: config.bucketName,
          folder: "about/press-items",
        });
        if (error) {
          throw new Error(`Failed to upload image: ${error}`);
        }
        newImageUrl = imageUrl;
      }

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

      methods.setValue(`pressItems.${index}.image_url`, newImageUrl);
      methods.setValue(`pressItems.${index}.oldImageUrl`, undefined);
      methods.setValue(`pressItems.${index}.file`, undefined);
    } catch (error) {
      console.error(`${pressItem.title} submission error:`, error);
      toast({
        title: "Error",
        description: `Failed to update press item ${
          index + 1
        }. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitMainInfo = async (data: {
    title: string;
    description: string;
  }) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/about/press", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      mutate("/api/admin/about/press");
      if (!response.ok) {
        throw new Error("Failed to update main press info");
      }

      toast({
        title: "Main press info updated",
        description: "The main press info has been successfully updated.",
      });
    } catch (error) {
      console.error("Main press info submission error:", error);
      toast({
        title: "Error",
        description: "Failed to update main press info. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitMainInfo)} className="space-y-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register("title")} className="mt-1 bg-white" />
          {errors.title && (
            <p className="text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register("description")}
            className="mt-1"
            rows={4}
          />
        </div>

        <SaveChangesButton
          isSubmitting={isSubmitting}
          watchFields={["title", "description"]}
          className="w-full"
        />
      </form>

      <div className="mt-8">
        <Label>Press Items (2 optional)</Label>
        <div className="mt-2 grid grid-cols-1 lg:grid-cols-2 gap-5 justify-around">
          {methods.getValues().pressItems?.map((field, index) => (
            <form
              key={field.id}
              onSubmit={(e) => {
                e.preventDefault();
                onSubmitPressItem(index);
              }}
              className="border p-4 rounded-md w-full"
            >
              <div className="flex items-center justify-between mb-2">
                <Input
                  {...register(`pressItems.${index}.title`)}
                  placeholder="Item Title"
                  className="flex-grow mr-2"
                />
                <FormField
                  control={control}
                  name={`pressItems.${index}.isVisible`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mr-2">Visible</FormLabel>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormItem>
                  )}
                />
              </div>
              {errors.pressItems?.[index]?.title && (
                <p className="text-red-500 text-sm mb-2">
                  {errors.pressItems[index]?.title?.message}
                </p>
              )}
              <div className="w-full h-40 object-cover rounded-md relative mb-2">
                {field.image_url ? (
                  <Image
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    src={field.image_url}
                    alt={`Press item ${index + 1}`}
                    className="object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-md">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRefs.current[index]?.click()}
                className="w-full mb-2"
              >
                {field.image_url ? "Change Image" : "Upload Image"}
              </Button>
              <FormField
                control={control}
                name={`pressItems.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Description</FormLabel>
                    <RichTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
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
                  `pressItems.${index}.content`,
                  `pressItems.${index}.image_url`,
                  `pressItems.${index}.file`,
                  `pressItems.${index}.oldImageUrl`,
                  `pressItems.${index}.isVisible`,
                  `pressItems.${index}.alt`,
                ]}
                className="w-full mt-4"
              />
            </form>
          ))}
        </div>
      </div>
    </FormProvider>
  );
}
