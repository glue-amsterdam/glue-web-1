"use client";

import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, PlusCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  CarouselSection,
  carouselSectionSchema,
} from "@/schemas/carouselSchema";
import { deleteImage, uploadImage } from "@/utils/supabase/storage/client";
import { ImageData } from "@/schemas/baseSchema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { config } from "@/env";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

interface CarouselFormProps {
  initialData: CarouselSection;
}

export default function AboutCarouselSectionForm({
  initialData,
}: CarouselFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const methods = useForm<CarouselSection>({
    resolver: zodResolver(carouselSectionSchema),
    defaultValues: initialData,
  });

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = methods;

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "slides",
  });

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index?: number
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);

      if (index !== undefined) {
        // Replace existing image
        update(index, {
          ...fields[index],
          image_url: imageUrl,
          image_name: file.name,
          file: file,
        });
      } else {
        // Add new image
        append({
          image_url: imageUrl,
          image_name: file.name,
          file: file,
        });
      }
    }
  };

  const handleDeleteImage = async (index: number) => {
    const slide = fields[index];
    if (slide.image_url && !slide.file) {
      // Only delete from storage if it's an existing image (not a newly added file)
      const { error } = await deleteImage(slide.image_url);

      if (error) {
        console.error("Failed to delete image:", error);
        toast({
          title: "Error",
          description: "Failed to delete image. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }
    remove(index);
  };

  const onSubmit = async (data: CarouselSection) => {
    setIsSubmitting(true);
    try {
      // Upload new images and update existing ones
      for (let i = 0; i < data.slides.length; i++) {
        const slide = data.slides[i] as ImageData & { file?: File };
        if (slide.file) {
          // If there's an existing image_url, delete it first
          if (slide.image_url && !slide.image_url.startsWith("blob:")) {
            await deleteImage(slide.image_url);
          }
          const { imageUrl, error } = await uploadImage({
            file: slide.file,
            bucket: config.bucketName,
            folder: "about/carousel-images",
          });
          if (error) {
            throw new Error(`Failed to upload image: ${error}`);
          }
          data.slides[i].image_url = imageUrl;
          delete data.slides[i].file; // Remove the file property before sending to API
        }
      }

      // Submit the form data with updated image URLs
      const response = await fetch("/api/admin/about/carousel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update carousel: ${errorData.error}`);
      }

      const result = await response.json();
      console.log("Server response:", result);

      toast({
        title: "Carousel updated",
        description: "The carousel has been successfully updated.",
      });
      router.refresh();
    } catch (error) {
      console.error("Carousel form submission error:", error);
      toast({
        title: "Error",
        description: "Failed to update carousel. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={control}
          name="is_visible"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Visible</FormLabel>
                <FormDescription>
                  Toggle to show or hide the carousel section
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
        <div>
          <Label htmlFor="title">Title</Label>
          <Input {...register("title")} id="title" placeholder="Title" />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            {...register("description")}
            id="description"
            placeholder="Description"
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
          )}
        </div>

        <div>
          <Label>Slides (Max 15)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            {fields.map((field, index) => (
              <div key={field.id} className="relative border p-4 rounded-md">
                <div className="w-full h-40 object-cover rounded-md relative mb-2">
                  {field.image_url ? (
                    <Image
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      src={field.image_url}
                      alt={""}
                      className="object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-md">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                        fileInputRef.current.onchange = (e) =>
                          handleImageChange(
                            e as unknown as React.ChangeEvent<HTMLInputElement>,
                            index
                          );
                      }
                    }}
                  >
                    Replace Image
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteImage(index)}
                  >
                    <X className="mr-2 h-4 w-4" /> Remove Slide
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {fields.length < 15 && (
            <Button
              type="button"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                  fileInputRef.current.onchange = (e) =>
                    handleImageChange(
                      e as unknown as React.ChangeEvent<HTMLInputElement>
                    );
                }
              }}
              className="flex-1"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Slide
            </Button>
          )}
          <SaveChangesButton
            isSubmitting={isSubmitting}
            watchFields={["title", "description", "slides", "is_visible"]}
            className="flex-1"
          />
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
        />
      </form>
    </FormProvider>
  );
}
