"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, X } from "lucide-react";
import { z } from "zod";
import { EMPTY_IMAGE } from "@/constants";
import { placeholderImage } from "@/mockConstants";
import { citizensSectionSchema } from "@/schemas/baseSchema";

type CitizensSection = z.infer<typeof citizensSectionSchema>;

export default function CitizensForm() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const methods = useForm<CitizensSection>({
    resolver: zodResolver(citizensSectionSchema),
    defaultValues: {
      title: "",
      description: "",
      citizens: [],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = methods;

  const { fields, append, update } = useFieldArray({
    control,
    name: "citizens",
  });

  useEffect(() => {
    // Fetch citizens section content
    fetch("/api/about")
      .then((res) => res.json())
      .then((data) => {
        setValue("title", data.citizensSection.title);
        setValue("description", data.citizensSection.description);
        setValue("citizens", data.citizensSection.citizens);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [setValue]);

  const onSubmit = async (data: CitizensSection) => {
    console.log(data);
    // Uncomment when ready to submit to API
    /* try {
      await fetch("/api/citizens-section", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      console.log("Data submitted successfully");
    } catch (error) {
      console.error("Error submitting data:", error);
    } */
  };

  const addImage = (index: number) => {
    const currentField = fields[index];
    update(index, {
      ...currentField,
      image: placeholderImage,
    });
  };

  const removeImage = (index: number) => {
    const currentField = fields[index];
    update(index, {
      ...currentField,
      image: EMPTY_IMAGE,
    });
  };

  const watchedFields = watch("citizens");

  const years = useMemo(() => {
    if (!watchedFields || watchedFields.length === 0) return [];
    const uniqueYears = Array.from(new Set(watchedFields.map((c) => c.year)));
    return uniqueYears.sort((a, b) => b - a);
  }, [watchedFields]);

  const handleAddNewYear = useCallback(() => {
    const newYear = new Date().getFullYear();
    setSelectedYear(newYear);
    const newCitizens = Array(3)
      .fill(null)
      .map(() => ({
        id: `${Date.now()}-${Math.random()}`,
        name: "",
        image: EMPTY_IMAGE,
        description: "",
        year: newYear,
      }));
    append(newCitizens);
  }, [append]);

  const handleYearChange = useCallback((year: number) => {
    setSelectedYear(year === 0 ? null : year);
  }, []);

  const citizensForSelectedYear = useMemo(() => {
    return fields.filter((field) => field.year === selectedYear).slice(0, 3);
  }, [fields, selectedYear]);

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
            value={selectedYear || 0}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            className="w-full p-2 border rounded"
          >
            <option value={0}>Select a year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {selectedYear && (
          <div className="space-y-6">
            {citizensForSelectedYear.map((field) => {
              const fieldIndex = fields.findIndex((f) => f.id === field.id);
              const currentImage = watchedFields[fieldIndex]?.image;
              const hasValidImage =
                currentImage?.image_url && currentImage.image_url !== "";
              return (
                <div
                  key={field.id}
                  className="flex flex-col space-y-2 p-4 bg-purple-50 rounded-lg"
                >
                  <Label htmlFor={`name-${fieldIndex}`}>Name</Label>
                  <Input
                    id={`name-${fieldIndex}`}
                    {...register(`citizens.${fieldIndex}.name`)}
                    placeholder="Name"
                  />
                  {errors.citizens?.[fieldIndex]?.name && (
                    <p className="text-red-500">
                      {errors.citizens[fieldIndex]?.name?.message}
                    </p>
                  )}
                  <div>
                    <Label>Image</Label>
                    <div className="relative">
                      {hasValidImage ? (
                        <>
                          <img
                            src={currentImage.image_url}
                            alt={currentImage.alt}
                            className="h-40 object-cover rounded-md aspect-square"
                          />
                          <Input
                            {...register(`citizens.${fieldIndex}.image.alt`)}
                            placeholder="Image alt text"
                            className="mt-1"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => removeImage(fieldIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => addImage(fieldIndex)}
                          className="w-full h-40 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" /> Add Image
                        </Button>
                      )}
                    </div>
                  </div>
                  <Label htmlFor={`description-${fieldIndex}`}>
                    Description
                  </Label>
                  <Textarea
                    id={`description-${fieldIndex}`}
                    {...register(`citizens.${fieldIndex}.description`)}
                    placeholder="Description"
                  />
                  {errors.citizens?.[fieldIndex]?.description && (
                    <p className="text-red-500">
                      {errors.citizens[fieldIndex]?.description?.message}
                    </p>
                  )}
                  <input
                    type="hidden"
                    {...register(`citizens.${fieldIndex}.year`)}
                    value={selectedYear}
                  />
                </div>
              );
            })}
          </div>
        )}
        <Button type="submit">Save Changes</Button>
      </form>
    </FormProvider>
  );
}
