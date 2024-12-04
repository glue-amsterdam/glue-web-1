"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GlueInternationalContent,
  glueInternationalSectionSchema,
} from "@/schemas/internationalSchema";
import { createSubmitHandler } from "@/utils/form-helpers";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";

export default function InternationalForm({
  initialData,
}: {
  initialData: GlueInternationalContent;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<GlueInternationalContent>({
    resolver: zodResolver(glueInternationalSectionSchema),
    defaultValues: initialData,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = createSubmitHandler<GlueInternationalContent>(
    "/api/admin/about/international",
    async () => {
      toast({
        title: "International section updated",
        description: "The International section has been successfully updated.",
      });
      await mutate("/api/admin/about/international");
      router.refresh();
    },
    (error) => {
      toast({
        title: "Error",
        description:
          "Failed to update international section. Please try again. " + error,
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (data: GlueInternationalContent) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-red-500">{errors.title.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input id="subtitle" {...register("subtitle")} />
            {errors.subtitle && (
              <p className="text-red-500">{errors.subtitle.message}</p>
            )}
          </div>
          <div className="sr-only">
            <Label htmlFor="website">Website - not editable / hidden</Label>
            <Input
              id="website"
              {...register("website")}
              readOnly
              className="bg-gray-100"
            />
            {errors.website && (
              <p className="text-red-500">{errors.website.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="button_text">Button Text</Label>
            <Input
              id="button_text"
              {...register("button_text")}
              placeholder="Enter button text"
            />
            {errors.button_text && (
              <p className="text-red-500">{errors.button_text.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="button_color">Button Color</Label>
            <Input
              id="button_color"
              {...register("button_color")}
              placeholder="Enter hex color code (e.g., #10069f)"
            />
            {errors.button_color && (
              <p className="text-red-500">{errors.button_color.message}</p>
            )}
            <p className="text-sm text-gray-500">
              Use a hexadecimal color code, for example: #10069f
            </p>
          </div>
        </div>
        <SaveChangesButton
          isSubmitting={isSubmitting}
          watchFields={[
            "title",
            "subtitle",
            "button_text",
            "website",
            "button_color",
          ]}
          className="w-full"
        />
      </form>
    </FormProvider>
  );
}
