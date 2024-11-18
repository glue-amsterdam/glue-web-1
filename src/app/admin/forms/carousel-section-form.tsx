"use client";

import { useEffect } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, X } from "lucide-react";
import { z } from "zod";
import { carouselSectionSchema } from "@/schemas/baseSchema";
import { placeholderImage } from "@/mockConstants";

type CarouselSection = z.infer<typeof carouselSectionSchema>;

export default function CarouselForm() {
  const methods = useForm<CarouselSection>({
    resolver: zodResolver(carouselSectionSchema),
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = methods;

  const {
    fields: slides,
    append: appendSlide,
    remove: removeSlide,
  } = useFieldArray({
    control,
    name: "slides",
  });

  useEffect(() => {
    // Fetch carousel section content
    fetch("/api/about")
      .then((res) => res.json())
      .then((data) => {
        setValue("title", data.carouselSection.title);
        setValue("description", data.carouselSection.description);
        setValue("slides", data.carouselSection.slides);
      });
  }, [setValue]);

  const onSubmit = async (data: CarouselSection) => {
    console.log(data);
    // Uncomment when ready to submit to API
    /* await fetch("/api/carousel-section", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }); */
  };

  const addSlide = () => {
    if (slides.length < 15) {
      appendSlide(placeholderImage);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register("title")} className="mt-1" />
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

        <div>
          <Label>Slides (Max 15)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            {slides.map((slide, index) => (
              <div key={slide.id} className="relative">
                <img
                  src={slide.imageUrl}
                  alt={slide.alt}
                  className="w-full h-40 object-cover rounded-md"
                />
                <Input
                  {...register(`slides.${index}.alt`)}
                  placeholder="Image alt text"
                  className="mt-1"
                />
                {errors.slides?.[index]?.alt && (
                  <p className="text-red-500">
                    {errors.slides[index]?.alt?.message}
                  </p>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => removeSlide(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {slides.length < 15 && (
            <Button type="button" onClick={addSlide} className="">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Slide
            </Button>
          )}

          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </FormProvider>
  );
}
