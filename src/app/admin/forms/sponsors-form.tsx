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
import { sponsorSchema, sponsorsSectionSchema } from "@/schemas/baseSchema";

const formSchema = z.object({
  sponsorsSection: sponsorsSectionSchema,
  sponsors: z.array(sponsorSchema),
});

type FormData = z.infer<typeof formSchema>;

export default function SponsorsForm() {
  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = methods;

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "sponsors",
  });

  useEffect(() => {
    // Fetch sponsors section content
    fetch("/api/about")
      .then((res) => res.json())
      .then((data) => {
        setValue("sponsorsSection", data.sponsorsSection);
      });

    // Fetch sponsors
    fetch("/api/sponsors")
      .then((res) => res.json())
      .then((data) => {
        setValue("sponsors", data);
      });
  }, [setValue]);

  const onSubmit = async (data: FormData) => {
    console.log("Submitting data:", data);

    try {
      // Update sponsors section content
      await fetch("/api/sponsors-section", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.sponsorsSection),
      });

      // Update sponsors
      await fetch("/api/sponsors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.sponsors),
      });

      console.log("Data submitted successfully");
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  const addImage = (index: number) => {
    const currentField = fields[index];
    update(index, {
      ...currentField,
      logo: placeholderImage,
    });
  };

  const removeImage = (index: number) => {
    const currentField = fields[index];
    update(index, {
      ...currentField,
      logo: EMPTY_IMAGE,
    });
  };

  const watchedFields = watch();

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("sponsorsSection.title")}
              placeholder="Section Title"
            />
            {errors.sponsorsSection?.title && (
              <p className="text-red-500">
                {errors.sponsorsSection.title.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("sponsorsSection.description")}
              placeholder="Section Description"
            />
            {errors.sponsorsSection?.description && (
              <p className="text-red-500">
                {errors.sponsorsSection.description.message}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-4">
          {fields.map((field, index) => {
            const currentImage = watchedFields.sponsors?.[index]?.logo;
            const hasValidImage =
              currentImage?.imageUrl && currentImage.imageUrl !== "";

            return (
              <div
                key={field.id}
                className="flex flex-col space-y-2 p-4 bg-green-50 rounded-lg"
              >
                <div>
                  <Label>Sponsor Name</Label>
                  <Input
                    {...register(`sponsors.${index}.name`)}
                    placeholder="Sponsor Name"
                  />
                  {errors.sponsors?.[index]?.name && (
                    <p className="text-red-500">
                      {errors.sponsors[index]?.name?.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Sponsor Website</Label>
                  <Input
                    {...register(`sponsors.${index}.website`)}
                    placeholder="Sponsor Website"
                  />
                  {errors.sponsors?.[index]?.website && (
                    <p className="text-red-500">
                      {errors.sponsors[index]?.website?.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Sponsor Type</Label>
                  <Input
                    {...register(`sponsors.${index}.sponsorT`)}
                    placeholder="Sponsor Type"
                  />
                  {errors.sponsors?.[index]?.sponsorT && (
                    <p className="text-red-500">
                      {errors.sponsors[index]?.sponsorT?.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Logo</Label>
                  <div className="relative">
                    {hasValidImage ? (
                      <>
                        <img
                          src={currentImage.imageUrl}
                          alt={currentImage.alt}
                          className="h-40 object-cover rounded-md aspect-square"
                        />
                        <Input
                          {...register(`sponsors.${index}.logo.alt`)}
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
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Logo
                      </Button>
                    )}
                  </div>
                  {errors.sponsors?.[index]?.logo && (
                    <p className="text-red-500">
                      {errors.sponsors[index]?.logo?.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={() => remove(index)}
                  variant="destructive"
                >
                  Remove Sponsor
                </Button>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2 items-center">
          <Button
            type="button"
            onClick={() =>
              append({
                name: "",
                website: "",
                sponsorT: "",
                logo: EMPTY_IMAGE,
                id: Date.now().toString(),
              })
            }
          >
            Add Sponsor
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </FormProvider>
  );
}
