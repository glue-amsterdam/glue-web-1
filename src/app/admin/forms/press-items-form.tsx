"use client";

import { useEffect } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, X } from "lucide-react";
import { z } from "zod";
import { placeholderImage } from "@/mockConstants";
import { EMPTY_IMAGE } from "@/constants";
import { pressItemsSectionSchema } from "@/schemas/baseSchema";

type PressItemsSection = z.infer<typeof pressItemsSectionSchema>;

export default function PressItemsForm() {
  const methods = useForm<PressItemsSection>({
    resolver: zodResolver(pressItemsSectionSchema),
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = methods;

  const { fields, update } = useFieldArray({
    control,
    name: "pressItems",
  });

  useEffect(() => {
    // Fetch press items section content
    fetch("/api/about")
      .then((res) => res.json())
      .then((data) => {
        setValue("title", data.pressItemsSection.title);
        setValue("description", data.pressItemsSection.description);
        setValue("pressItems", data.pressItemsSection.pressItems);
      });
  }, [setValue]);

  const onSubmit = async (data: PressItemsSection) => {
    console.log(data);
    // Uncomment when ready to submit to API
    /* await fetch("/api/press-items-section", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }); */
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

  const watchedFields = watch("pressItems");

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
          {fields.map((field, index) => {
            const currentImage = watchedFields[index]?.image;
            const hasValidImage =
              currentImage?.image_url && currentImage.image_url !== "";

            return (
              <div
                key={field.id}
                className="flex flex-col space-y-2 p-4 bg-green-50 rounded-lg"
              >
                <Label>Title</Label>
                <Input
                  {...register(`pressItems.${index}.title`)}
                  placeholder="Title"
                />
                {errors.pressItems?.[index]?.title && (
                  <p className="text-red-500">
                    {errors.pressItems[index]?.title?.message}
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
                          className="w-full h-40 object-cover rounded-md"
                        />
                        <Input
                          {...register(`pressItems.${index}.image.alt`)}
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
                  {...register(`pressItems.${index}.description`)}
                  placeholder="Description"
                />
                {errors.pressItems?.[index]?.description && (
                  <p className="text-red-500">
                    {errors.pressItems[index]?.description?.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <Button type="submit">Save Changes</Button>
      </form>
    </FormProvider>
  );
}
