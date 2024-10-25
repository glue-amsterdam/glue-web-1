"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, X } from "lucide-react";
import { CarouselSectionContent } from "@/utils/about-types";

type FormData = {
  aboutSection: {
    carouselSection: CarouselSectionContent;
  };
};

export default function CarouselForm() {
  const { register, watch, setValue } = useFormContext<FormData>();

  const slides = watch("aboutSection.carouselSection.slides");

  const addSlide = () => {
    if (slides.length < 15) {
      setValue("aboutSection.carouselSection.slides", [
        ...slides,
        {
          id: slides.length + "1",
          src: `/placeholders/placeholder-${slides.length + 1}.jpg`,
          alt: "Carousel slide image from GLUE design route",
        },
      ]);
    }
  };

  const removeSlide = (id: string) => {
    setValue(
      "aboutSection.carouselSection.slides",
      slides.filter((slide) => slide.id !== id)
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...register("aboutSection.carouselSection.title")}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("aboutSection.carouselSection.description")}
          className="mt-1"
          rows={4}
        />
      </div>

      <div>
        <Label>Slides (Max 15)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          {slides.map((slide, index) => (
            <div key={slide.id} className="relative">
              <img
                src={slide.src}
                alt={slide.alt}
                className="w-full h-40 object-cover rounded-md"
              />
              <Input
                {...register(
                  `aboutSection.carouselSection.slides.${index}.alt`
                )}
                placeholder="Image alt text"
                className="mt-1"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => removeSlide(slide.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {slides.length < 15 && (
        <Button type="button" onClick={addSlide} className="mt-4">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Slide
        </Button>
      )}
    </div>
  );
}
