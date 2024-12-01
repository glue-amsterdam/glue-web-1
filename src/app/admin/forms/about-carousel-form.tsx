"use client";

import { useState, useRef } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  CarouselSectionContent,
  carouselSectionSchema,
  ImageData,
} from "@/schemas/baseSchema";
import { PlusCircle, X, ImageIcon } from "lucide-react";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { uploadImage } from "@/utils/supabase/storage/client";

interface CarouselFormProps {
  initialData: CarouselSectionContent;
}

export default function AboutCarouselSectionForm({
  initialData,
}: CarouselFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const methods = useForm<CarouselSectionContent>({
    resolver: zodResolver(carouselSectionSchema),
    defaultValues: initialData,
  });

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "slides",
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);

      append({
        id: crypto.randomUUID(),
        image_url: imageUrl,
        alt: "",
        image_name: file.name,
        file: file,
      });
    }
  };

  const onSubmit = async (data: CarouselSectionContent) => {
    setIsSubmitting(true);
    try {
      // Upload images before submitting form data
      for (let i = 0; i < data.slides.length; i++) {
        const slide = data.slides[i] as ImageData & { file?: File };
        if (slide.file) {
          const { imageUrl, error } = await uploadImage({
            file: slide.file,
            bucket: "amsterdam-assets",
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
        throw new Error("Failed to update carousel");
      }

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
          {errors.description && (
            <p className="text-red-500">{errors.description.message}</p>
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
                      alt={field.alt || "Slide image"}
                      className="object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-md">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <Input
                  {...register(`slides.${index}.alt`)}
                  placeholder="Image alt text"
                  className="mb-2"
                />
                {errors.slides?.[index]?.alt && (
                  <p className="text-red-500 text-sm mb-2">
                    {errors.slides[index]?.alt?.message}
                  </p>
                )}

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => remove(index)}
                >
                  <X className="mr-2 h-4 w-4" /> Remove Slide
                </Button>
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
                }
              }}
              className="flex-1"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Slide
            </Button>
          )}
          <SaveChangesButton
            isSubmitting={isSubmitting}
            watchFields={["title", "description", "slides"]}
            className="flex-1"
          />
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={fileInputRef}
          className="hidden"
        />
      </form>
    </FormProvider>
  );
}
