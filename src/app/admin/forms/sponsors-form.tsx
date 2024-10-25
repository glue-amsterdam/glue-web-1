"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sponsor, SponsorsSectionContent } from "@/utils/about-types";
import { PlusCircle, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type FormData = {
  aboutSection: {
    sponsorsSection: SponsorsSectionContent;
  };
};

export default function SponsorsForm() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<FormData>();

  const { fields, update } = useFieldArray({
    control,
    name: "aboutSection.sponsorsSection.sponsors",
  });

  const addImage = (index: number) => {
    const newImage = {
      id: `${Date.now()}-${index}`,
      src: `/placeholders/user-placeholder-${index + 1}.jpg`,
      alt: "Image from GLUE sponsor",
    };

    const currentField = fields[index] as Sponsor;
    update(index, {
      ...currentField,
      logo: newImage,
    });
  };

  const removeImage = (index: number) => {
    const currentField = fields[index] as Sponsor;
    update(index, {
      ...currentField,
      logo: {
        id: "",
        src: "",
        alt: "",
      },
    });
  };

  const watchedFields = watch(`aboutSection.sponsorsSection.sponsors`);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...register("aboutSection.sponsorsSection.title", {
            required: "Title is required",
          })}
          placeholder="Section Title"
        />
        {errors.aboutSection?.sponsorsSection?.title && (
          <p className="text-red-500">
            {errors.aboutSection.sponsorsSection.title.message}
          </p>
        )}
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("aboutSection.sponsorsSection.description", {
            required: "Description is required",
          })}
          placeholder="Section Description"
        />
        {errors.aboutSection?.sponsorsSection?.description && (
          <p className="text-red-500">
            {errors.aboutSection.sponsorsSection.description.message}
          </p>
        )}
      </div>
      <div className="space-y-4">
        {fields.map((field, index) => {
          const currentImage = watchedFields?.[index]?.logo;
          const hasValidImage = currentImage?.src && currentImage.src !== "";

          return (
            <div
              key={field.id}
              className="flex flex-col space-y-2 p-4 bg-green-50 rounded-lg"
            >
              <div>
                <Label>Sponsor Name</Label>
                <Input
                  {...register(
                    `aboutSection.sponsorsSection.sponsors.${index}.name`
                  )}
                  placeholder="Sponsor Name"
                />
              </div>
              <div>
                <Label>Sponsor Web</Label>
                <Input
                  {...register(
                    `aboutSection.sponsorsSection.sponsors.${index}.website`
                  )}
                  placeholder="Sponsor Website"
                />
              </div>
              <div>
                <Label>Sponsor Type</Label>
                <Input
                  {...register(
                    `aboutSection.sponsorsSection.sponsors.${index}.sponsorT`
                  )}
                  placeholder="Sponsor Website"
                />
              </div>

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
                          `aboutSection.sponsorsSection.sponsors.${index}.logo.alt`
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
