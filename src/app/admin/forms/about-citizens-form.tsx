"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, X } from "lucide-react";
import {
  citizensSectionSchema,
  CitizensSection,
  Citizen,
} from "@/schemas/citizenSchema";
import { EMPTY_IMAGE } from "@/constants";
import { placeholderImage } from "@/mockConstants";

export default function CitizensForm({
  initialData,
}: {
  initialData: CitizensSection;
}) {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const methods = useForm<CitizensSection>({
    resolver: zodResolver(citizensSectionSchema),
    defaultValues: initialData,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = methods;

  useEffect(() => {
    // Fetch citizens section content
    fetch("/api/citizens")
      .then((res) => res.json())
      .then((data: CitizensSection) => {
        setValue("title", data.title);
        setValue("description", data.description);
        setValue("citizensByYear", data.citizensByYear);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [setValue]);

  const onSubmit = async (data: CitizensSection) => {
    try {
      const response = await fetch("/api/citizens", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update citizens");
      console.log("Data submitted successfully");
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  const watchedCitizensByYear = watch("citizensByYear");

  const years = Object.keys(watchedCitizensByYear).sort(
    (a, b) => Number(b) - Number(a)
  );

  const handleAddNewYear = () => {
    const newYear = new Date().getFullYear().toString();
    setSelectedYear(newYear);
    setValue(`citizensByYear.${newYear}`, [
      { id: `${Date.now()}-1`, name: "", image: EMPTY_IMAGE, description: "" },
      { id: `${Date.now()}-2`, name: "", image: EMPTY_IMAGE, description: "" },
      { id: `${Date.now()}-3`, name: "", image: EMPTY_IMAGE, description: "" },
    ]);
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year === "0" ? null : year);
  };

  const addImage = (year: string, index: number) => {
    const currentCitizens = [...watchedCitizensByYear[year]];
    currentCitizens[index] = {
      ...currentCitizens[index],
      image: placeholderImage,
    };
    setValue(`citizensByYear.${year}`, currentCitizens);
  };

  const removeImage = (year: string, index: number) => {
    const currentCitizens = [...watchedCitizensByYear[year]];
    currentCitizens[index] = { ...currentCitizens[index], image: EMPTY_IMAGE };
    setValue(`citizensByYear.${year}`, currentCitizens);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Section Title"
            />
            {errors.title && (
              <p className="text-red-500">{errors.title.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Section Description"
            />
            {errors.description && (
              <p className="text-red-500">{errors.description.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="yearSelect">Select Year</Label>
            <Button type="button" onClick={handleAddNewYear}>
              Add New Year
            </Button>
          </div>
          <select
            id="yearSelect"
            value={selectedYear || "0"}
            onChange={(e) => handleYearChange(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="0">Select a year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {selectedYear && (
          <div className="space-y-6">
            {watchedCitizensByYear[selectedYear].map(
              (citizen: Citizen, index: number) => (
                <div
                  key={citizen.id}
                  className="flex flex-col space-y-2 p-4 bg-purple-50 rounded-lg"
                >
                  <Label htmlFor={`name-${index}`}>Name</Label>
                  <Input
                    id={`name-${index}`}
                    {...register(
                      `citizensByYear.${selectedYear}.${index}.name`
                    )}
                    placeholder="Name"
                  />
                  {errors.citizensByYear?.[selectedYear]?.[index]?.name && (
                    <p className="text-red-500">
                      {
                        errors.citizensByYear[selectedYear][index]?.name
                          ?.message
                      }
                    </p>
                  )}
                  <div>
                    <Label>Image</Label>
                    <div className="relative">
                      {citizen.image.image_url ? (
                        <>
                          <img
                            src={citizen.image.image_url}
                            alt={citizen.image.alt}
                            className="h-40 object-cover rounded-md aspect-square"
                          />
                          <Input
                            {...register(
                              `citizensByYear.${selectedYear}.${index}.image.alt`
                            )}
                            placeholder="Image alt text"
                            className="mt-1"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => removeImage(selectedYear, index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => addImage(selectedYear, index)}
                          className="w-full h-40 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" /> Add Image
                        </Button>
                      )}
                    </div>
                  </div>
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Textarea
                    id={`description-${index}`}
                    {...register(
                      `citizensByYear.${selectedYear}.${index}.description`
                    )}
                    placeholder="Description"
                  />
                  {errors.citizensByYear?.[selectedYear]?.[index]
                    ?.description && (
                    <p className="text-red-500">
                      {
                        errors.citizensByYear[selectedYear][index]?.description
                          ?.message
                      }
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        )}
        <Button type="submit">Save Changes</Button>
      </form>
    </FormProvider>
  );
}
