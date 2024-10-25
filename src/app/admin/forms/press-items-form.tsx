"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PressItem, PressItemsSectionContent } from "@/utils/about-types";
import { PlusCircle, X } from "lucide-react";

type FormData = {
  aboutSection: {
    pressItemsSection: PressItemsSectionContent;
  };
};

export default function PressItemsForm() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<FormData>();

  const { fields, update } = useFieldArray({
    control,
    name: "aboutSection.pressItemsSection.pressItems",
  });

  const addImage = (index: number) => {
    const newImage = {
      id: `${Date.now()}-${index}`,
      src: `/placeholders/placeholder-${index + 1}.jpg`,
      alt: "Image from GLUE design route",
    };

    const currentField = fields[index] as PressItem;
    update(index, {
      ...currentField,
      image: newImage,
    });
  };

  const removeImage = (index: number) => {
    const currentField = fields[index] as PressItem;
    update(index, {
      ...currentField,
      image: {
        id: "",
        src: "",
        alt: "",
      },
    });
  };

  const watchedFields = watch(`aboutSection.pressItemsSection.pressItems`);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...register("aboutSection.pressItemsSection.title", {
            required: "Title is required",
          })}
          placeholder="Section Title"
        />
        {errors.aboutSection?.pressItemsSection?.title && (
          <p className="text-red-500">
            {errors.aboutSection.pressItemsSection.title.message}
          </p>
        )}
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("aboutSection.pressItemsSection.description", {
            required: "Description is required",
          })}
          placeholder="Section Description"
        />
        {errors.aboutSection?.pressItemsSection?.description && (
          <p className="text-red-500">
            {errors.aboutSection.pressItemsSection.description.message}
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
                  `aboutSection.pressItemsSection.pressItems.${index}.title`
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
                          `aboutSection.pressItemsSection.pressItems.${index}.image.alt`
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
                  `aboutSection.pressItemsSection.pressItems.${index}.description`
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
