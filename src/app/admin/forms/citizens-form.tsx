"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useCallback, useMemo } from "react";
import { Citizen, CitizensSectionContent } from "@/utils/about-types";
import { PlusCircle, X } from "lucide-react";

type FormData = {
  aboutSection: {
    citizensSection: CitizensSectionContent;
  };
};

export default function CitizensForm() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const {
    register,
    control,
    formState: { errors },
    watch,
  } = useFormContext<FormData>();

  const { fields, append, update } = useFieldArray({
    control,
    name: "aboutSection.citizensSection.citizens",
  });

  const addImage = (index: number) => {
    const newImage = {
      id: `${Date.now()}-${index}`,
      src: `/placeholders/user-placeholder-${index + 1}.jpg`,
      alt: "Image for GLUE citizen",
    };

    const currentField = fields[index] as Citizen;
    update(index, {
      ...currentField,
      image: newImage,
    });
  };

  const removeImage = (index: number) => {
    const currentField = fields[index] as Citizen;
    update(index, {
      ...currentField,
      image: {
        id: "",
        src: "",
        alt: "",
      },
    });
  };

  const watchedFields = watch(`aboutSection.citizensSection.citizens`);

  const years = useMemo(() => {
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
        image: {
          id: "",
          src: "",
          alt: "",
        },
        description: "",
        year: newYear,
      }));
    append(newCitizens);
  }, [append]);

  const handleYearChange = useCallback((year: number) => {
    if (year === 0) {
      setSelectedYear(null);
    } else {
      setSelectedYear(year);
    }
  }, []);

  const citizensForSelectedYear = useMemo(() => {
    return fields.filter((field) => field.year === selectedYear).slice(0, 3);
  }, [fields, selectedYear]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...register("aboutSection.citizensSection.title", {
            required: "Title is required",
          })}
          placeholder="Section Title"
        />
        {errors.aboutSection?.citizensSection?.title && (
          <p className="text-red-500">
            {errors.aboutSection.citizensSection.title.message}
          </p>
        )}
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("aboutSection.citizensSection.description", {
            required: "Description is required",
          })}
          placeholder="Section Description"
        />
        {errors.aboutSection?.citizensSection?.description && (
          <p className="text-red-500">
            {errors.aboutSection.citizensSection.description.message}
          </p>
        )}
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
          {citizensForSelectedYear.map((field, index) => {
            const fieldIndex = fields.findIndex((f) => f.id === field.id);
            const currentImage = watchedFields?.[index]?.image;
            const hasValidImage = currentImage?.src && currentImage.src !== "";
            return (
              <div
                key={field.id}
                className="flex flex-col space-y-2 p-4 bg-purple-50 rounded-lg"
              >
                <Label htmlFor={`name-${fieldIndex}`}>Name</Label>
                <Input
                  id={`name-${fieldIndex}`}
                  {...register(
                    `aboutSection.citizensSection.citizens.${fieldIndex}.name`,
                    { required: "Name is required" }
                  )}
                  placeholder="Name"
                />
                {errors.aboutSection?.citizensSection?.citizens?.[fieldIndex]
                  ?.name && (
                  <p className="text-red-500">
                    {
                      errors.aboutSection.citizensSection.citizens[fieldIndex]
                        .name.message
                    }
                  </p>
                )}
                <div>
                  <Label>Image</Label>
                  <div className="relative">
                    {hasValidImage ? (
                      <>
                        <img
                          src={currentImage.src}
                          alt={currentImage.alt}
                          className="h-40 object-cover rounded-md aspect-square"
                        />
                        <Input
                          {...register(
                            `aboutSection.citizensSection.citizens.${index}.image.alt`
                          )}
                          placeholder="Image alt text"
                          className="mt-1"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => addImage(index)}
                        className="w-full h-40 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Image
                      </Button>
                    )}
                  </div>
                </div>
                <Label htmlFor={`description-${fieldIndex}`}>Description</Label>
                <Textarea
                  id={`description-${fieldIndex}`}
                  {...register(
                    `aboutSection.citizensSection.citizens.${fieldIndex}.description`,
                    { required: "Description is required" }
                  )}
                  placeholder="Description"
                />
                {errors.aboutSection?.citizensSection?.citizens?.[fieldIndex]
                  ?.description && (
                  <p className="text-red-500">
                    {
                      errors.aboutSection.citizensSection.citizens[fieldIndex]
                        .description.message
                    }
                  </p>
                )}
                <input
                  type="hidden"
                  {...register(
                    `aboutSection.citizensSection.citizens.${fieldIndex}.year`
                  )}
                  value={selectedYear}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
