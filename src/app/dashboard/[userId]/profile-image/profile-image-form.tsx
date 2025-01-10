"use client";

import React, { useRef, useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import { uploadImage } from "@/utils/supabase/storage/client";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/env";

const imageSchema = z.object({
  id: z.string().optional(),
  image_url: z.string().url(),
});

interface ProfileImageFormProps {
  targetUserId: string;
  initialImages: { id: string; image_url: string }[];
  planId: string;
}

export function ProfileImageForm({
  targetUserId,
  initialImages,
  planId,
}: ProfileImageFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const [currentImages, setCurrentImages] = useState(initialImages);

  const getMaxImages = (planId: string) => {
    if (planId === "planId-0" || planId === "planId-1") return 0;
    if (planId === "planId-2") return 1;
    if (planId === "planId-3") return 2;
    return 3; // for plan_id 4 or more
  };

  const maxImages = getMaxImages(planId);

  const formSchema = z.object({
    images: z
      .array(imageSchema)
      .max(
        maxImages,
        `You can only upload up to ${maxImages} image${
          maxImages > 1 ? "s" : ""
        }`
      ),
  });

  type FormData = z.infer<typeof formSchema>;

  const { control, setValue, handleSubmit, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      images: initialImages,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "images",
  });

  // Watch for changes in the form's images
  const watchImages = watch("images");

  // Update currentImages when form images change
  useEffect(() => {
    setCurrentImages(
      watchImages.map((image) => ({
        id: image.id || "",
        image_url: image.image_url,
      }))
    );
  }, [watchImages]);

  useEffect(() => {
    if (initialImages.length > maxImages) {
      const trimmedImages = initialImages.slice(0, maxImages);
      setCurrentImages(trimmedImages);
      setValue("images", trimmedImages);
    }
  }, [initialImages, maxImages, setValue]);

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);

      try {
        const { imageUrl, error } = await uploadImage({
          file,
          bucket: config.bucketName,
          folder: `profile-images/${targetUserId}`,
        });

        if (error) {
          throw new Error(error);
        }

        setValue(`images.${index}`, {
          image_url: imageUrl,
        });

        // Update currentImages state
        setCurrentImages((prevImages) => {
          const newImages = [...prevImages];
          newImages[index] = { ...newImages[index], image_url: imageUrl };
          return newImages;
        });

        toast({
          title: "Image uploaded",
          description: "The image has been successfully uploaded.",
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        toast({
          title: "Error",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const triggerFileInput = (index: number) => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
      fileInputRef.current.onchange = (e) =>
        handleImageChange(
          e as unknown as React.ChangeEvent<HTMLInputElement>,
          index
        );
    }
  };

  const onSubmit = async (data: FormData) => {
    console.log(data);

    try {
      const response = await fetch(
        `/api/users/participants/${targetUserId}/profile-image`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data.images),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile images");
      }

      toast({
        title: "Success",
        description: "Profile images updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile images:", error);
      toast({
        title: "Error",
        description: "Failed to update profile images. Please try again.",
        variant: "destructive",
      });
    }
  };

  const maxImagesText =
    maxImages === 0
      ? "Your current plan does not allow image uploads."
      : `You can upload up to ${maxImages} image${
          maxImages > 1 ? "s" : ""
        } with your current plan.`;

  return (
    <>
      <p className="mb-4 text-sm text-gray-600">{maxImagesText}</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="border p-4 rounded-md">
            <div className="w-full h-60 relative mb-2 overflow-hidden">
              {currentImages[index]?.image_url ? (
                <img
                  src={currentImages[index].image_url}
                  alt={`Profile image ${index + 1}`}
                  className="rounded-md absolute inset-0 w-full h-full object-cover"
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
              onClick={() => triggerFileInput(index)}
              className="w-full mb-2"
              disabled={isUploading}
            >
              {isUploading
                ? "Uploading..."
                : currentImages[index]?.image_url
                ? "Change Image"
                : "Upload Image"}
            </Button>
            {currentImages[index]?.image_url && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  remove(index);
                  setCurrentImages((prevImages) => {
                    const newImages = [...prevImages];
                    newImages.splice(index, 1);
                    return newImages;
                  });
                }}
                className="w-full"
              >
                Delete Image
              </Button>
            )}
          </div>
        ))}

        {fields.length < maxImages && maxImages > 0 && (
          <Button
            type="button"
            onClick={() => {
              append({ image_url: "" });
              setCurrentImages((prevImages) => [
                ...prevImages,
                { id: "", image_url: "" },
              ]);
            }}
            className="w-full"
          >
            Add Another Image
          </Button>
        )}

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          aria-label="Upload profile image"
        />

        <Button type="submit" className="w-full">
          Save Changes
        </Button>
      </form>
    </>
  );
}
