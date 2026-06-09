"use client";

import type React from "react";
import { useRef, useState } from "react";
import {
  useController,
  type Control,
  type UseFormSetValue,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/app/components/editor";
import type { CitizensSection } from "@/schemas/citizenSchema";
import { uploadImage } from "@/utils/supabase/storage/client";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/config";
import { generateAltText } from "@/lib/utils";
import { AdminImagePreview } from "@/components/admin/admin-image-preview";
import {
  createUploadProgressHandler,
  type UploadState,
} from "@/components/image-upload-overlay";

interface CitizenFormProps {
  control: Control<CitizensSection>;
  setValue: UseFormSetValue<CitizensSection>;
  selectedYear: string;
  index: number;
}

export function AboutCitForm({
  control,
  setValue,
  selectedYear,
  index,
}: CitizenFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const { toast } = useToast();
  const handleUploadProgress = createUploadProgressHandler(setUploadState);

  const { field: nameField, fieldState: nameFieldState } = useController({
    name: `citizensByYear.${selectedYear}.${index}.name`,
    control,
  });

  const { field: descriptionField, fieldState: descriptionFieldState } =
    useController({
      name: `citizensByYear.${selectedYear}.${index}.description`,
      control,
    });

  const { field: imageUrlField } = useController({
    name: `citizensByYear.${selectedYear}.${index}.image_url`,
    control,
  });

  const { field: fileField } = useController({
    name: `citizensByYear.${selectedYear}.${index}.file`,
    control,
  });

  const { field: oldImageUrlField } = useController({
    name: `citizensByYear.${selectedYear}.${index}.oldImageUrl`,
    control,
  });

  const citizen = {
    name: nameField.value,
    description: descriptionField.value,
    image_url: imageUrlField.value,
    file: fileField.value,
    oldImageUrl: oldImageUrlField.value,
    alt: nameField.value ? generateAltText(selectedYear, nameField.value) : "",
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) {
      return;
    }

    const file = e.target.files[0];

    try {
      setUploadState({ stage: "compressing", progress: 5 });

      const { imageUrl, error } = await uploadImage({
        file,
        bucket: config.bucketName,
        folder: `about/citizens/${selectedYear}`,
        onProgress: handleUploadProgress,
      });

      if (error) {
        throw new Error(error);
      }

      oldImageUrlField.onChange(citizen.image_url);
      imageUrlField.onChange(imageUrl);
      setValue(
        `citizensByYear.${selectedYear}.${index}.image_name`,
        file.name
      );
      fileField.onChange(file);

      toast({
        title: "Image uploaded",
        description:
          "The image has been successfully uploaded, please save the changes",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadState(null);
      e.target.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const isUploading = uploadState !== null;

  return (
    <div className="w-full space-y-2 border-t pt-4 first:border-t-0 first:pt-0">
      <Input {...nameField} placeholder="Citizen Name" />
      {nameFieldState.error && (
        <p className="text-red-500 text-sm">{nameFieldState.error.message}</p>
      )}

      <AdminImagePreview
        src={citizen.image_url}
        alt={generateAltText(selectedYear, citizen.name || "Citizen")}
        uploadState={uploadState}
      />
      {!citizen.image_url && (
        <p className="text-red-500 text-sm">Image is required</p>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        ref={fileInputRef}
        className="hidden"
        disabled={isUploading}
        aria-label="Upload citizen image"
      />

      <RichTextEditor
        value={descriptionField.value || ""}
        onChange={descriptionField.onChange}
      />
      {descriptionFieldState.error && (
        <p className="text-red-500 text-sm">
          {descriptionFieldState.error.message}
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={triggerFileInput}
        className="w-full"
        disabled={isUploading}
      >
        {citizen.image_url ? "Change Image" : "Upload Image"}
      </Button>
    </div>
  );
}
