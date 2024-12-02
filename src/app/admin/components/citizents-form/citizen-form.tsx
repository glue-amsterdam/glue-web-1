import React, { useRef } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RichTextEditor } from "@/app/components/editor";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { generateAltText } from "./utils";

interface CitizenFormProps {
  selectedYear: string;
  index: number;
}

export function CitizenForm({ selectedYear, index }: CitizenFormProps) {
  const { register, control, setValue, watch } = useFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const citizen = watch(`citizensByYear.${selectedYear}.${index}`);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      const imageName = file.name;

      setValue(`citizensByYear.${selectedYear}.${index}.image_url`, imageUrl, {
        shouldDirty: true,
      });
      setValue(
        `citizensByYear.${selectedYear}.${index}.image_name`,
        imageName,
        { shouldDirty: true }
      );
      setValue(
        `citizensByYear.${selectedYear}.${index}.alt`,
        generateAltText(selectedYear, citizen.name),
        { shouldDirty: true }
      );
      setValue(`citizensByYear.${selectedYear}.${index}.file`, file, {
        shouldDirty: true,
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="border p-4 rounded-md w-full">
      <Input
        {...register(`citizensByYear.${selectedYear}.${index}.name` as const, {
          required: "Name is required",
        })}
        placeholder="Citizen Name"
        className="mb-2"
      />
      <div className="w-full h-40 relative mb-2">
        {citizen.image_url ? (
          <Image
            src={citizen.image_url}
            alt={citizen.alt || generateAltText(selectedYear, citizen.name)}
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

      <Button
        type="button"
        variant="secondary"
        onClick={triggerFileInput}
        className="w-full mb-2"
      >
        {citizen.image_url ? "Change Image" : "Upload Image"}
      </Button>
      <FormField
        control={control}
        name={`citizensByYear.${selectedYear}.${index}.description` as const}
        rules={{ required: "Description is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Citizen Description</FormLabel>
            <RichTextEditor value={field.value} onChange={field.onChange} />
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
