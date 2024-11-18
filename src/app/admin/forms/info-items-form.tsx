"use client";

import { useEffect } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusCircle, X } from "lucide-react";
import { z } from "zod";
import { EMPTY_IMAGE } from "@/constants";
import { placeholderImage } from "@/mockConstants";
import { infoItemsSectionSchema } from "@/schemas/baseSchema";

type InfoSection = z.infer<typeof infoItemsSectionSchema>;

export default function InfoItemsForm() {
  const methods = useForm<InfoSection>({
    resolver: zodResolver(infoItemsSectionSchema),
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
    name: "infoItems",
  });

  useEffect(() => {
    // Fetch info items section content
    fetch("/api/about")
      .then((res) => res.json())
      .then((data) => {
        setValue("title", data.infoItemsSection.title);
        setValue("description", data.infoItemsSection.description);
        setValue("infoItems", data.infoItemsSection.infoItems);
      });
  }, [setValue]);

  const onSubmit = async (data: InfoSection) => {
    console.log(data);
    // Uncomment when ready to submit to API
    /* await fetch("/api/info-items-section", {
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

  const watchedFields = watch("infoItems");

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
              currentImage?.imageUrl && currentImage.imageUrl !== "";

            return (
              <div
                key={field.id}
                className="flex flex-col space-y-2 p-4 bg-green-50 rounded-lg"
              >
                <Label>Title</Label>
                <Input
                  {...register(`infoItems.${index}.title`)}
                  placeholder="Title"
                />
                {errors.infoItems?.[index]?.title && (
                  <p className="text-red-500">
                    {errors.infoItems[index]?.title?.message}
                  </p>
                )}

                <div>
                  <Label>Image</Label>
                  <div className="relative">
                    {hasValidImage ? (
                      <>
                        <img
                          src={currentImage.imageUrl}
                          alt={currentImage.alt}
                          className="w-full h-40 object-cover rounded-md"
                        />
                        <Input
                          {...register(`infoItems.${index}.image.alt`)}
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
                  {...register(`infoItems.${index}.description`)}
                  placeholder="Description"
                />
                {errors.infoItems?.[index]?.description && (
                  <p className="text-red-500">
                    {errors.infoItems[index]?.description?.message}
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
