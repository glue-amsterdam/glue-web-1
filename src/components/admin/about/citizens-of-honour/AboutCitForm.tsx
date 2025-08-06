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
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import type { CitizensSection } from "@/schemas/citizenSchema";
import { uploadImage } from "@/utils/supabase/storage/client";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/env";
import { generateAltText } from "@/lib/utils";

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
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

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
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);

      try {
        const { imageUrl, error } = await uploadImage({
          file,
          bucket: config.bucketName,
          folder: `about/citizens/${selectedYear}`,
        });

        if (error) {
          throw new Error(error);
        }

        // Store the current image_url as oldImageUrl
        oldImageUrlField.onChange(citizen.image_url);

        // Update the image_url with the new URL
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
        setIsUploading(false);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="border p-4 rounded-md w-full">
      <Input {...nameField} placeholder="Citizen Name" className="mb-2" />
      {nameFieldState.error && (
        <p className="text-red-500 text-sm">{nameFieldState.error.message}</p>
      )}

      <div className="w-full h-40 relative mb-2">
        {citizen.image_url ? (
          <Image
            src={citizen.image_url || "/placeholder.svg"}
            alt={generateAltText(selectedYear, citizen.name)}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover rounded-md"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-md">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>
      {!citizen.image_url && (
        <p className="text-red-500 text-sm mt-2">Image is required</p>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        ref={fileInputRef}
        className="hidden"
        aria-label="Upload citizen image"
      />
      <div className="mb-2">
        <RichTextEditor
          value={descriptionField.value}
          onChange={descriptionField.onChange}
        />
        {descriptionFieldState.error && (
          <p className="text-red-500 text-sm">
            {descriptionFieldState.error.message}
          </p>
        )}
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={triggerFileInput}
        className="w-full mb-2"
        disabled={isUploading}
      >
        {isUploading
          ? "Uploading..."
          : citizen.image_url
          ? "Change Image"
          : "Upload Image"}
      </Button>
    </div>
  );
}
