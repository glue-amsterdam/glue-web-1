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
import {
  citizensSectionSchema,
  CitizensSection,
  Citizen,
} from "@/schemas/citizenSchema";
import { EMPTY_IMAGE } from "@/constants";

interface CitizensSectionFormProps {
  initialData: CitizensSection;
}

export default function CitizensForm({
  initialData,
}: CitizensSectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [newYearInput, setNewYearInput] = useState<string>("");
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [selectedYearData, setSelectedYearData] = useState<Citizen[]>([]);
  const { toast } = useToast();
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const methods = useForm<CitizensSection>({
    resolver: zodResolver(citizensSectionSchema),
    defaultValues: initialData,
  });

  const {
    control,
    handleSubmit,
    register,
    setValue,
    formState: { errors },
    reset,
  } = methods;

  useEffect(() => {
    async function fetchAvailableYears() {
      try {
        const response = await fetch("/api/admin/about/citizens/years");
        if (!response.ok) {
          throw new Error("Failed to fetch available years");
        }
        const data = await response.json();
        setAvailableYears(data.years);
      } catch (error) {
        console.error("Error fetching available years:", error);
        toast({
          title: "Error",
          description: "Failed to fetch available years. Please try again.",
          variant: "destructive",
        });
      }
    }

    fetchAvailableYears();
    reset(initialData);
  }, [initialData, reset, toast]);

  const generateAltText = (year: string, name: string) => {
    return `GLUE ${process.env.MAIN_CITY_GLUE_EVENT} design routes citizen of honour from year ${year} - ${name}`;
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    year: string,
    index: number
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      const imageName = file.name;

      const oldImageUrl = methods.getValues(
        `citizensByYear.${year}.${index}.image.image_url`
      );

      methods.setValue(
        `citizensByYear.${year}.${index}.image.image_url`,
        imageUrl,
        { shouldDirty: true }
      );
      methods.setValue(`citizensByYear.${year}.${index}.image.file`, file, {
        shouldDirty: true,
      });
      methods.setValue(
        `citizensByYear.${year}.${index}.image.oldImageUrl`,
        oldImageUrl,
        { shouldDirty: true }
      );
      methods.setValue(
        `citizensByYear.${year}.${index}.image.alt`,
        generateAltText(
          year,
          methods.getValues(`citizensByYear.${year}.${index}.name`)
        ),
        { shouldDirty: true }
      );
      methods.setValue(
        `citizensByYear.${year}.${index}.image.image_name`,
        imageName,
        { shouldDirty: true }
      );
      methods.trigger(`citizensByYear.${year}.${index}.image.image_url`);
    }
  };

  const handleAddNewYear = () => {
    if (newYearInput && /^\d{4}$/.test(newYearInput)) {
      setSelectedYear(newYearInput);
      setValue(`citizensByYear.${newYearInput}`, [
        {
          id: `${Date.now()}-1`,
          name: "",
          image: EMPTY_IMAGE,
          description: "",
        },
        {
          id: `${Date.now()}-2`,
          name: "",
          image: EMPTY_IMAGE,
          description: "",
        },
        {
          id: `${Date.now()}-3`,
          name: "",
          image: EMPTY_IMAGE,
          description: "",
        },
      ]);
      setNewYearInput("");
    } else {
      toast({
        title: "Invalid Year",
        description: "Please enter a valid 4-digit year.",
        variant: "destructive",
      });
    }
  };

  const handleYearChange = async (year: string) => {
    if (year === "0") {
      setSelectedYear(null);
      setSelectedYearData([]);
      return;
    }

    setSelectedYear(year);
    try {
      const response = await fetch(`/api/admin/about/citizens/${year}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch citizens for year ${year}`);
      }
      const data = await response.json();
      setSelectedYearData(data.citizens);
    } catch (error) {
      console.error(`Error fetching citizens for year ${year}:`, error);
      toast({
        title: "Error",
        description: `Failed to fetch citizens for year ${year}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const onSubmitMainInfo = async (data: {
    title: string;
    description: string;
  }) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/about/citizens", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

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

  const onSubmitCitizens = async (year: string) => {
    setIsSubmitting(true);
    const citizens = methods.getValues(`citizensByYear.${year}`);

    // Validate that all three citizens are filled out
    const isValid = citizens.every(
      (citizen) =>
        citizen.name.trim() !== "" &&
        citizen.description.trim() !== "" &&
        citizen.image.image_url !== ""
    );

    if (!isValid) {
      toast({
        title: "Validation Error",
        description:
          "Please fill out all fields for all three citizens, including images.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const updatedCitizens = await Promise.all(
        citizens.map(async (citizen) => {
          let newImageUrl = citizen.image.image_url;
          let newImageName = citizen.image.image_name;
          if (citizen.image.file) {
            const { imageUrl, error } = await uploadImage({
              file: citizen.image.file,
              bucket: "amsterdam-assets",
              folder: `about/citizens/${year}`,
            });
            if (error) {
              throw new Error(
                `Failed to upload image for ${citizen.name}: ${error}`
              );
            }
            newImageUrl = imageUrl;
            newImageName = citizen.image.file.name;
          }
          return {
            ...citizen,
            image: {
              ...citizen.image,
              image_url: newImageUrl,
              image_name: newImageName,
              oldImageUrl: citizen.image.oldImageUrl,
              alt: generateAltText(year, citizen.name),
            },
          };
        })
      );

      const response = await fetch(`/api/admin/about/citizens/${year}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedCitizens),
      });

      if (!response.ok) {
        throw new Error(`Failed to update citizens for year ${year}`);
      }

      toast({
        title: "Citizens updated",
        description: `Citizens for year ${year} have been successfully updated.`,
      });

      // Update the form state with the new image URLs and clear oldImageUrl and file
      updatedCitizens.forEach((citizen, index) => {
        methods.setValue(
          `citizensByYear.${year}.${index}.image.image_url`,
          citizen.image.image_url
        );
        methods.setValue(
          `citizensByYear.${year}.${index}.image.oldImageUrl`,
          undefined
        );
        methods.setValue(
          `citizensByYear.${year}.${index}.image.file`,
          undefined
        );
      });
    } catch (error) {
      console.error(`Citizens submission error for year ${year}:`, error);
      toast({
        title: "Error",
        description: `Failed to update citizens for year ${year}. Please try again.`,
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
          {errors.description && (
            <p className="text-red-500">{errors.description.message}</p>
          )}
        </div>

        <SaveChangesButton
          isSubmitting={isSubmitting}
          watchFields={["title", "description"]}
          className="w-full"
        />
      </form>

      <div className="mt-8 space-y-4">
        <div className="flex justify-between items-center">
          <Label htmlFor="yearSelect">Select Year</Label>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              value={newYearInput}
              onChange={(e) => setNewYearInput(e.target.value)}
              placeholder="YYYY"
              className="w-20"
            />
            <Button type="button" onClick={handleAddNewYear}>
              Add New Year
            </Button>
          </div>
        </div>
        <select
          id="yearSelect"
          value={selectedYear || "0"}
          onChange={(e) => handleYearChange(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="0">Select a year</option>
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {selectedYear && (
        <div className="mt-8">
          <Label>Citizens for {selectedYear} (3 required)</Label>
          <div className="mt-2 grid grid-cols-1 lg:grid-cols-3 gap-5">
            {selectedYearData.map((citizen: Citizen, index: number) => (
              <div key={citizen.id} className="border p-4 rounded-md w-full">
                <Input
                  {...register(`citizensByYear.${selectedYear}.${index}.name`, {
                    required: "Name is required",
                  })}
                  placeholder="Citizen Name"
                  className="mb-2"
                />
                {errors.citizensByYear?.[selectedYear]?.[index]?.name && (
                  <p className="text-red-500 text-sm mb-2">
                    {errors.citizensByYear[selectedYear][index]?.name?.message}
                  </p>
                )}

                <FormField
                  control={control}
                  name={`citizensByYear.${selectedYear}.${index}.description`}
                  rules={{ required: "Description is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Citizen Description</FormLabel>
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="w-full h-40 object-cover rounded-md relative mb-2">
                  {citizen.image.image_url ? (
                    <Image
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      src={citizen.image.image_url}
                      alt={generateAltText(selectedYear, citizen.name)}
                      className="object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-md">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                {!citizen.image.image_url && (
                  <p className="text-red-500 text-sm mt-2">Image is required</p>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, selectedYear, index)}
                  ref={(el) => {
                    fileInputRefs.current[index] = el;
                  }}
                  className="hidden"
                />

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRefs.current[index]?.click()}
                  className="w-full mb-2"
                >
                  {citizen.image.image_url ? "Change Image" : "Upload Image"}
                </Button>
              </div>
            ))}
          </div>
          <Button
            onClick={handleSubmit(
              () => onSubmitCitizens(selectedYear),
              (errors) => {
                console.log(errors);
                toast({
                  title: "Validation Error",
                  description:
                    "Please fill out all required fields for all three citizens.",
                  variant: "destructive",
                });
              }
            )}
            className="w-full mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save All Citizens for This Year"}
          </Button>
        </div>
      )}
    </FormProvider>
  );
}
