"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { uploadImage, deleteImage } from "@/utils/supabase/storage/client";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/config";
import Image from "next/image";
import {
  ImageUploadOverlay,
  createUploadProgressHandler,
  type UploadState,
} from "@/components/image-upload-overlay";

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

type ProfileImage = {
  id: string;
  image_url: string;
};

const ProfileImageCard = ({
  image,
  index,
  readOnly,
  isDeleting,
  canDelete,
  onDelete,
}: {
  image: ProfileImage;
  index: number;
  readOnly: boolean;
  isDeleting: boolean;
  canDelete: boolean;
  onDelete: (index: number) => void;
}) => (
  <div className="border-2 p-4">
    <div className="relative mb-2 h-60 w-full overflow-hidden">
      <Image
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        fill
        src={image.image_url}
        alt={`Profile image ${index + 1}`}
        className="object-cover"
      />
      {isDeleting && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/60"
          aria-live="polite"
          aria-busy="true"
        >
          <p className="text-sm font-medium text-white">Deleting…</p>
        </div>
      )}
    </div>
    {!readOnly && (
      <>
        <Button
          type="button"
          variant="destructive"
          onClick={() => onDelete(index)}
          className="w-full"
          disabled={isDeleting || !canDelete}
        >
          {isDeleting ? "Deleting…" : "Delete Image"}
        </Button>
        {!canDelete && (
          <p className="mt-2 text-xs text-muted-foreground">
            At least one profile image is required.
          </p>
        )}
      </>
    )}
  </div>
);

const AddImageCard = ({
  uploadState,
  disabled,
  onClick,
}: {
  uploadState: UploadState | null;
  disabled: boolean;
  onClick: () => void;
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled || uploadState) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled || uploadState ? -1 : 0}
      aria-label="Add profile image"
      aria-disabled={disabled || Boolean(uploadState)}
      onClick={() => {
        if (disabled || uploadState) return;
        onClick();
      }}
      onKeyDown={handleKeyDown}
      className="relative flex h-full min-h-74 cursor-pointer flex-col border-2 p-4 transition-colors hover:border-foreground/40 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
    >
      <div className="relative flex h-60 w-full flex-col items-center justify-center gap-2 rounded-md bg-muted/20">
        <Plus className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <span className="text-sm font-medium text-muted-foreground">
          Add image
        </span>
        {uploadState && (
          <ImageUploadOverlay
            stage={uploadState.stage}
            progress={uploadState.progress}
          />
        )}
      </div>
    </div>
  );
};

interface ProfileImageFormProps {
  targetUserId: string;
  initialImages: { id: string; image_url: string }[];
  planMaxImages: number;
  readOnly?: boolean;
  onImagesChange?: (images: ProfileImage[]) => void;
  preventDeleteLastImage?: boolean;
}

export function ProfileImageForm({
  targetUserId,
  initialImages,
  planMaxImages,
  readOnly = false,
  onImagesChange,
  preventDeleteLastImage = false,
}: ProfileImageFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const uploadLimit = planMaxImages;
  const maxImages = readOnly
    ? Math.max(uploadLimit, initialImages.length)
    : uploadLimit;

  const [images, setImages] = useState<ProfileImage[]>(initialImages);

  useEffect(() => {
    if (readOnly) return;

    if (initialImages.length > maxImages) {
      setImages(initialImages.slice(0, maxImages));
    }
  }, [initialImages, maxImages, readOnly]);

  useEffect(() => {
    onImagesChange?.(images);
  }, [images, onImagesChange]);

  const handleUploadProgress = createUploadProgressHandler(setUploadState);

  const handleImageUpload = async (
    file: File
  ): Promise<{ id: string; image_url: string }> => {
    if (readOnly) {
      throw new Error("Profile editing is disabled");
    }

    try {
      setUploadState({ stage: "compressing", progress: 5 });

      const { imageUrl, error } = await uploadImage({
        file,
        bucket: config.bucketName,
        folder: `profile-images/${targetUserId}`,
        onProgress: handleUploadProgress,
      });

      if (error) {
        throw new Error(error);
      }

      setUploadState({ stage: "saving", progress: 96 });

      const response = await fetch(
        `/api/users/participants/${targetUserId}/profile-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image_url: imageUrl }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save profile image");
      }

      const { id } = await response.json();

      setUploadState({ stage: "saving", progress: 100 });

      toast({
        title: "Image uploaded",
        description: "The image has been successfully uploaded and saved.",
      });

      return { id: id || "", image_url: imageUrl };
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setUploadState(null);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast({
        title: "File too large",
        description:
          "Large images are compressed automatically, but must be under 20 MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      const uploaded = await handleImageUpload(file);
      setImages((prev) => {
        const nextImages = [...prev, uploaded];
        return nextImages;
      });
    } catch (error) {
      console.error("Error handling image upload:", error);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImageDelete = async (index: number) => {
    if (readOnly) return;

    if (preventDeleteLastImage && images.length <= 1) {
      toast({
        title: "Cannot delete image",
        description: "At least one profile image is required.",
        variant: "destructive",
      });
      return;
    }

    const imageToDelete = images[index];
    if (!imageToDelete) return;

    setDeletingIndex(index);

    try {
      await deleteImage(imageToDelete.image_url);

      const response = await fetch(
        `/api/users/participants/${targetUserId}/profile-image/${imageToDelete.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error ?? "Failed to delete profile image from database");
      }

      setImages((prev) => prev.filter((_, i) => i !== index));

      toast({
        title: "Image deleted",
        description: "The image has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingIndex(null);
    }
  };

  const handleAddImageClick = () => {
    if (readOnly || uploadState || images.length >= uploadLimit) return;
    fileInputRef.current?.click();
  };

  const canAddImage =
    !readOnly && uploadLimit > 0 && images.length < uploadLimit;

  const helpText = readOnly
    ? initialImages.length > 0
      ? "Your profile is inactive. You can view your images but cannot edit them."
      : "Your profile is inactive. Image uploads are disabled until your account is reactivated."
    : uploadLimit === 0
      ? "Your current plan does not allow image uploads."
      : preventDeleteLastImage
        ? `At least one profile image is required. You can upload up to ${uploadLimit} image${uploadLimit > 1 ? "s" : ""}.`
        : `You can upload up to ${uploadLimit} image${uploadLimit > 1 ? "s" : ""}. To replace one, delete it and add a new image.`;

  return (
    <>
      <p className="mb-4 text-sm">{helpText}</p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[15px] max-w-[250px] lg:max-w-[600px] mx-auto">
        {images.map((image, index) => (
          <ProfileImageCard
            key={image.id}
            image={image}
            index={index}
            readOnly={readOnly}
            isDeleting={deletingIndex === index}
            canDelete={!preventDeleteLastImage || images.length > 1}
            onDelete={handleImageDelete}
          />
        ))}

        {canAddImage && (
          <AddImageCard
            uploadState={uploadState}
            disabled={deletingIndex !== null}
            onClick={handleAddImageClick}
          />
        )}

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          aria-label="Upload profile image"
          onChange={handleImageSelect}
        />
      </div>
    </>
  );
}
