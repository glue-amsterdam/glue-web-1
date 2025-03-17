"use client";

import React, { useRef, useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import { uploadImage, deleteImage } from "@/utils/supabase/storage/client";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/env";
import Image from "next/image";

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
    return 3;
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

  const { control, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      images: initialImages,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "images",
  });

  const watchImages = watch("images");

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

  const handleImageUpload = async (
    file: File,
    index: number
  ): Promise<{ id: string; image_url: string }> => {
    setIsUploading(true);
    try {
      const existingImage = currentImages[index];

      // Delete the old image if it exists
      if (existingImage?.image_url) {
        await deleteImage(existingImage.image_url);
      }

      const { imageUrl, error } = await uploadImage({
        file,
        bucket: config.bucketName,
        folder: `profile-images/${targetUserId}`,
      });

      if (error) {
        throw new Error(error);
      }

      // Update or create the database record
      const method = existingImage?.id ? "PUT" : "POST";
      const url = existingImage?.id
        ? `/api/users/participants/${targetUserId}/profile-image/${existingImage.id}`
        : `/api/users/participants/${targetUserId}/profile-image`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image_url: imageUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile image in database");
      }

      const { id } = await response.json();

      toast({
        title: "Image uploaded",
        description: "The image has been successfully uploaded and saved.",
      });

      return { id: id || existingImage?.id || "", image_url: imageUrl };
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const { id, image_url } = await handleImageUpload(file, index);

        // Update the form state
        setValue(`images.${index}`, {
          id,
          image_url,
        });

        // Update the currentImages state to trigger a re-render
        setCurrentImages((prevImages) => {
          const newImages = [...prevImages];
          newImages[index] = { id, image_url };
          return newImages;
        });
      } catch (error) {
        console.error("Error handling image change:", error);
      }
    }
  };

  const handleImageDelete = async (index: number) => {
    const imageToDelete = currentImages[index];
    if (!imageToDelete) return;

    try {
      // Delete from storage
      await deleteImage(imageToDelete.image_url);

      // Delete from database
      const response = await fetch(
        `/api/users/participants/${targetUserId}/profile-image/${imageToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete profile image from database");
      }

      // Remove the image from the form state
      remove(index);

      // Update the currentImages state to trigger a re-render
      setCurrentImages((prevImages) => {
        const newImages = [...prevImages];
        newImages.splice(index, 1);
        return newImages;
      });

      toast({
        title: "Image deleted",
        description: "The image has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Error",
        description: "Failed to delete image. Please try again.",
        variant: "destructive",
      });
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

  const maxImagesText =
    maxImages === 0
      ? "Your current plan does not allow image uploads."
      : `You can upload up to ${maxImages} image${
          maxImages > 1 ? "s" : ""
        } with your current plan.`;

  return (
    <>
      <p className="mb-4 text-sm text-gray-600">{maxImagesText}</p>
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="border p-4 rounded-md">
            <div className="w-full h-60 relative mb-2 overflow-hidden">
              {currentImages[index]?.image_url ? (
                <Image
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  fill
                  src={currentImages[index].image_url || "/placeholder.jpg"}
                  alt={`Profile image ${index + 1}`}
                  className="rounded-md object-cover"
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
                onClick={() => handleImageDelete(index)}
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
      </div>
    </>
  );
}
