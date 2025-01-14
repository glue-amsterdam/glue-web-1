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
import { InfoItem, InfoSection, infoSectionSchema } from "@/schemas/infoSchema";
import { mutate } from "swr";
import { config } from "@/env";

interface InfoSectionFormProps {
  initialData: InfoSection;
}

const DEFAULT_INFO_ITEMS: InfoItem[] = [
  {
    id: "mission-statement",
    title: "",
    description: "",
    image: { image_url: "", image_name: "" },
  },
  {
    id: "meet-the-team",
    title: "",
    description: "",
    image: { image_url: "", image_name: "" },
  },
  {
    id: "glue-foundation",
    title: "",
    description: "",
    image: { image_url: "", image_name: "" },
  },
];

const getFixedAltText = (id: string) => {
  switch (id) {
    case "mission-statement":
      return "Visual representation of our mission statement";
    case "meet-the-team":
      return "Group photo of our team members";
    case "glue-foundation":
      return "Illustration of the GLUE Foundation's core values";
    default:
      return "Informative image for GLUE project";
  }
};

export default function InfoSectionForm({ initialData }: InfoSectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const methods = useForm<InfoSection>({
    resolver: zodResolver(infoSectionSchema),
    defaultValues: {
      ...initialData,
      infoItems: mergeInfoItems(initialData.infoItems, DEFAULT_INFO_ITEMS),
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
      infoItems: mergeInfoItems(initialData.infoItems, DEFAULT_INFO_ITEMS),
    });
  }, [initialData, reset]);

  function mergeInfoItems(
    initialItems: InfoItem[],
    defaultItems: InfoItem[]
  ): InfoItem[] {
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

      // Store the old image URL before updating
      const oldImageUrl = methods.getValues(
        `infoItems.${index}.image.image_url`
      );

      methods.setValue(`infoItems.${index}.image.image_url`, imageUrl, {
        shouldDirty: true,
      });
      methods.setValue(`infoItems.${index}.image.file`, file, {
        shouldDirty: true,
      });
      methods.setValue(`infoItems.${index}.image.oldImageUrl`, oldImageUrl, {
        shouldDirty: true,
      });

      // Trigger rerender to show the new image immediately
      methods.trigger(`infoItems.${index}.image.image_url`);
    }
  };

  const onSubmitInfoItem = async (index: number) => {
    setIsSubmitting(true);
    const infoItem = methods.getValues(`infoItems.${index}`);
    try {
      let newImageUrl = infoItem.image.image_url;
      if (infoItem.image.file) {
        const { imageUrl, error } = await uploadImage({
          file: infoItem.image.file,
          bucket: config.bucketName,
          folder: "about/info-items",
        });
        if (error) {
          throw new Error(`Failed to upload image: ${error}`);
        }
        newImageUrl = imageUrl;
      }

      const response = await fetch(`/api/admin/about/info/${infoItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...infoItem,
          image: {
            ...infoItem.image,
            image_url: newImageUrl,
            oldImageUrl: infoItem.image.oldImageUrl,
          },
        }),
      });

      mutate("/api/admin/about/info");

      if (!response.ok) {
        throw new Error("Failed to update info item");
      }

      toast({
        title: "Info item updated",
        description: `${infoItem.title} has been successfully updated.`,
      });

      // Update the form state with the new image URL and clear oldImageUrl
      methods.setValue(`infoItems.${index}.image.image_url`, newImageUrl);
      methods.setValue(`infoItems.${index}.image.oldImageUrl`, undefined);
      methods.setValue(`infoItems.${index}.image.file`, undefined);
    } catch (error) {
      console.error(`${infoItem.title} submission error:`, error);
      toast({
        title: "Error",
        description: `Failed to update info item ${
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
      const response = await fetch("/api/admin/about/info", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      mutate("/api/admin/about/info");
      if (!response.ok) {
        throw new Error("Failed to update main info (title and description)");
      }

      toast({
        title: "Main info updated",
        description:
          "The main info (title and description) has been successfully updated.",
      });
    } catch (error) {
      console.error("Main info submission error:", error);
      toast({
        title: "Error",
        description:
          "Failed to update main info (title and description). Please try again.",
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
        <Label>Info Items (3 required)</Label>
        <div className="mt-2 grid grid-cols-1 lg:grid-cols-3 gap-5 justify-around">
          {methods.getValues().infoItems.map((field, index) => (
            <form
              key={field.id}
              onSubmit={(e) => {
                e.preventDefault();
                onSubmitInfoItem(index);
              }}
              className="border p-4 rounded-md w-full"
            >
              <Input
                {...register(`infoItems.${index}.title`)}
                placeholder="Item Title"
                className="mb-2"
              />
              {errors.infoItems?.[index]?.title && (
                <p className="text-red-500 text-sm mb-2">
                  {errors.infoItems[index]?.title?.message}
                </p>
              )}
              <div className="w-full h-40 object-cover rounded-md relative mb-2">
                {field.image.image_url ? (
                  <Image
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    src={field.image.image_url}
                    alt={getFixedAltText(field.id)}
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
                {field.image.image_url ? "Change Image" : "Upload Image"}
              </Button>
              <FormField
                control={control}
                name={`infoItems.${index}.description`}
                render={({ field }) => (
                  <FormItem className="max-h-[80vh] overflow-y-scroll">
                    <FormLabel>Item Description</FormLabel>
                    <RichTextEditor
                      value={field.value}
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
                  `infoItems.${index}.title`,
                  `infoItems.${index}.description`,
                  `infoItems.${index}.image.image_url`,
                  `infoItems.${index}.image.file`,
                  `infoItems.${index}.image.oldImageUrl`,
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
