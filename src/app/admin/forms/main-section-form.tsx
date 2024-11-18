"use client";

import { useEffect } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import {
  mainColorsSchema,
  mainLinksSchema,
  mainSectionSchema,
} from "@/schemas/baseSchema";

type MainSection = z.infer<typeof mainSectionSchema>;

export default function MainSectionForm() {
  const methods = useForm<MainSection>({
    resolver: zodResolver(mainSectionSchema),
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = methods;

  const { fields: menuFields } = useFieldArray({
    control,
    name: "mainMenu",
  });

  useEffect(() => {
    // Fetch main section content
    fetch("/api/main")
      .then((res) => res.json())
      .then((data) => {
        setValue("mainColors", data.mainColors);
        setValue("mainMenu", data.mainMenu);
        setValue("mainLinks", data.mainLinks);
      });
  }, [setValue]);

  const onSubmit = async (data: MainSection) => {
    console.log(data);
    // Uncomment when ready to submit to API
    /* await fetch("/api/main-section", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }); */
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label className="h2-titles">Main Colors</Label>
          <div className="grid grid-cols-2 gap-2">
            {(
              Object.keys(mainColorsSchema.shape) as Array<
                keyof typeof mainColorsSchema.shape
              >
            ).map((key) => (
              <div key={key}>
                <Label>
                  {key.charAt(0).toUpperCase() + key.slice(1)} Color
                </Label>
                <Input
                  className="dashboard-input"
                  {...register(`mainColors.${key}`)}
                  placeholder={`${
                    key.charAt(0).toUpperCase() + key.slice(1)
                  } Color`}
                />
                {errors.mainColors?.[key] && (
                  <p className="text-red-500">
                    {errors.mainColors[key]?.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="h2-titles">Main Menu Labels</Label>
          {menuFields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-2 mb-2">
              <Input
                {...register(`mainMenu.${index}.label`)}
                placeholder={`Label ${index + 1}`}
                className="dashboard-input"
              />
            </div>
          ))}
        </div>

        <div>
          <Label className="h2-titles">Main Links</Label>
          <div className="space-y-2">
            {(
              Object.keys(mainLinksSchema.shape) as Array<
                keyof typeof mainLinksSchema.shape
              >
            ).map((key) => (
              <div key={key}>
                <Label>{key.charAt(0).toUpperCase() + key.slice(1)} Link</Label>
                <Input
                  className="dashboard-input"
                  {...register(`mainLinks.${key}.link`)}
                  placeholder={`${
                    key.charAt(0).toUpperCase() + key.slice(1)
                  } Link`}
                />
                {errors.mainLinks?.[key]?.link && (
                  <p className="text-red-500">
                    {errors.mainLinks[key]?.link?.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <Button type="submit">Save Changes</Button>
      </form>
    </FormProvider>
  );
}
