"use client";

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { glueInternationalSectionSchema } from "@/schemas/baseSchema";

type GlueInternational = z.infer<typeof glueInternationalSectionSchema>;

export default function InternationalForm() {
  const methods = useForm<GlueInternational>({
    resolver: zodResolver(glueInternationalSectionSchema),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = methods;

  useEffect(() => {
    // Fetch international section content
    fetch("/api/about")
      .then((res) => res.json())
      .then((data) => {
        setValue("buttonColor", data.glueInternationalSection.buttonColor);
      });
  }, [setValue]);

  const onSubmit = async (data: GlueInternational) => {
    console.log(data);
    // Uncomment when ready to submit to API
    /* await fetch("/api/international-section", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }); */
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Label htmlFor="buttonColor">Button Color</Label>
          <Input
            id="buttonColor"
            {...register("buttonColor")}
            placeholder="Enter hex color code (e.g., #10069f)"
          />
          {errors.buttonColor && (
            <p className="text-red-500">{errors.buttonColor.message}</p>
          )}
          <p className="text-sm text-gray-500">
            Use a hexadecimal color code, for example: #10069f.
          </p>
        </div>
        <Button type="submit">Save Changes</Button>
      </form>
    </FormProvider>
  );
}
