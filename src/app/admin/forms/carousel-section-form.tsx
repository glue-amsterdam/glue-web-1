"use client";

import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createSubmitHandler } from "@/utils/form-helpers";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import {
  CarouselSectionContent,
  carouselSectionSchema,
} from "@/schemas/baseSchema";
import { PlusCircle, X } from "lucide-react";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface CarouselFormProps {
  initialData: CarouselSectionContent;
}

export default function CarouselForm({ initialData }: CarouselFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<CarouselSectionContent>({
    resolver: zodResolver(carouselSectionSchema),
    defaultValues: initialData,
  });

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "slides",
  });

  const onSubmit = createSubmitHandler<CarouselSectionContent>(
    "/api/admin/about/carousel",
    () => {
      console.log("Carousel form submitted successfully");
      toast({
        title: "Carousel updated",
        description: "The carousel has been successfully updated.",
      });
      router.refresh();
    },
    (error) => {
      console.error("Carousel form submission error:", error);
      toast({
        title: "Error",
        description: "Failed to update carousel. Please try again.",
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (data: CarouselSectionContent) => {
    console.log("handleFormSubmit called with data:", data);
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error in handleFormSubmit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    console.log("Form errors:", errors);
  }, [errors]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
            {fields.map((field, index) => (
              <div key={field.id} className="relative">
                <img
                  src={field.imageUrl}
                  alt={field.alt}
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
                <Input
                  {...register(`slides.${index}.imageUrl`)}
                  placeholder="Image URL"
                  className="mt-1"
                />
                {errors.slides?.[index]?.imageUrl && (
                  <p className="text-red-500">
                    {errors.slides[index]?.imageUrl?.message}
                  </p>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => remove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {fields.length < 15 && (
            <Button
              type="button"
              onClick={() =>
                append({
                  id: crypto.randomUUID(),
                  imageUrl: "",
                  alt: "",
                  imageName: "New Slide",
                })
              }
              className=""
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Slide
            </Button>
          )}

          <SaveChangesButton isSubmitting={isSubmitting} className="w-full" />
        </div>
      </form>
    </FormProvider>
  );
}
