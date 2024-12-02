"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { CitizenForm } from "./citizen-form";
import { uploadImage } from "@/utils/supabase/storage/client";
import { generateAltText } from "./utils";
import { Citizen } from "@/schemas/citizenSchema";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { useToast } from "@/hooks/use-toast";

interface CitizensYearFormProps {
  selectedYear: string;
  initialCitizens: Citizen[];
}

export function CitizensYearForm({
  selectedYear,
  initialCitizens,
}: CitizensYearFormProps) {
  const { getValues, setValue } = useFormContext();
  const { toast } = useToast();

  const onSubmitCitizens = async () => {
    const citizens = getValues(`citizensByYear.${selectedYear}`) as Citizen[];

    const isValid = citizens.every(
      (citizen) =>
        citizen.name.trim() !== "" &&
        citizen.description.trim() !== "" &&
        citizen.image_url !== ""
    );

    if (!isValid) {
      toast({
        title: "Validation Error",
        description:
          "Please fill out all fields for all three citizens, including images.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const updatedCitizens = await Promise.all(
        citizens.map(async (citizen: Citizen) => {
          let newImageUrl = citizen.image_url;
          if (citizen.file) {
            const { imageUrl, error } = await uploadImage({
              file: citizen.file,
              bucket: "amsterdam-assets",
              folder: `about/citizens/${selectedYear}`,
            });
            if (error) {
              throw new Error(
                `Failed to upload image for ${citizen.name}: ${error}`
              );
            }
            newImageUrl = imageUrl;
          }
          return {
            ...citizen,
            image_url: newImageUrl,
            alt: generateAltText(selectedYear, citizen.name),
          };
        })
      );

      const response = await fetch(
        `/api/admin/about/citizens/${selectedYear}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedCitizens),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update citizens for year ${selectedYear}`);
      }

      toast({
        title: "Citizens updated",
        description: `Citizens for year ${selectedYear} have been successfully updated.`,
      });

      updatedCitizens.forEach((citizen, index) => {
        setValue(
          `citizensByYear.${selectedYear}.${index}.image_url`,
          citizen.image_url
        );
        setValue(`citizensByYear.${selectedYear}.${index}.file`, undefined);
      });

      return true;
    } catch (error) {
      console.error(
        `Citizens submission error for year ${selectedYear}:`,
        error
      );
      toast({
        title: "Error",
        description: `Failed to update citizens for year ${selectedYear}. Please try again.`,
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <div className="mt-8">
      <Label>Citizens for {selectedYear} (3 required)</Label>
      <div className="mt-2 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {initialCitizens.map((citizen, index) => (
          <CitizenForm
            key={citizen.id}
            selectedYear={selectedYear}
            index={index}
          />
        ))}
      </div>
      <SaveChangesButton
        onSubmit={onSubmitCitizens}
        watchFields={[`citizensByYear.${selectedYear}`]}
        className="w-full mt-4"
      >
        Save All Citizens for This Year
      </SaveChangesButton>
    </div>
  );
}
