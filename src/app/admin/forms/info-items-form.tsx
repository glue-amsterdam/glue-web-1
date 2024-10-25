"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InfoSectionContent, InfoItem } from "@/utils/about-types";
import { Button } from "@/components/ui/button";
import { PlusCircle, X } from "lucide-react";

type FormData = {
  aboutSection: {
    infoItemsSection: InfoSectionContent;
  };
};

export default function InfoItemsForm() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<FormData>();

  const { fields, update } = useFieldArray({
    control,
    name: "aboutSection.infoItemsSection.infoItems",
  });

  const addImage = (index: number) => {
    const newImage = {
      id: `${Date.now()}-${index}`,
      src: `/placeholders/placeholder-${index + 1}.jpg`,
      alt: "Image from GLUE design route",
    };

    const currentField = fields[index] as InfoItem;
    update(index, {
      ...currentField,
      image: newImage,
    });
  };

  const removeImage = (index: number) => {
    const currentField = fields[index] as InfoItem;
    update(index, {
      ...currentField,
      image: {
        id: "",
        src: "",
        alt: "",
      },
    });
  };

  /* Watch the fields to ensure reactive updates */
  const watchedFields = watch(`aboutSection.infoItemsSection.infoItems`);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...register("aboutSection.infoItemsSection.title", {
            required: "Title is required",
          })}
          placeholder="Section Title"
        />
        {errors.aboutSection?.infoItemsSection?.title && (
          <p className="text-red-500">
            {errors.aboutSection.infoItemsSection.title.message}
          </p>
        )}
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("aboutSection.infoItemsSection.description", {
            required: "Description is required",
          })}
          placeholder="Section Description"
        />
        {errors.aboutSection?.infoItemsSection?.description && (
          <p className="text-red-500">
            {errors.aboutSection.infoItemsSection.description.message}
          </p>
        )}
      </div>
      <div className="space-y-4">
        {fields.map((field, index) => {
          const currentImage = watchedFields?.[index]?.image;
          const hasValidImage = currentImage?.src && currentImage.src !== "";

          return (
            <div
              key={field.id}
              className="flex flex-col space-y-2 p-4 bg-green-50 rounded-lg"
            >
              <Label>Title</Label>
              <Input
                {...register(
                  `aboutSection.infoItemsSection.infoItems.${index}.title`
                )}
                placeholder="Title"
              />

              <div>
                <Label>Image</Label>
                <div className="relative">
                  {hasValidImage ? (
                    <>
                      <img
                        src={currentImage.src}
                        alt={currentImage.alt}
                        className="w-full h-40 object-cover rounded-md"
                      />
                      <Input
                        {...register(
                          `aboutSection.infoItemsSection.infoItems.${index}.image.alt`
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
              <Label>Description</Label>
              <Textarea
                {...register(
                  `aboutSection.infoItemsSection.infoItems.${index}.description`
                )}
                placeholder="Description"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
