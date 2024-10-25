"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";

// Definir el esquema Zod
const mainColorsSchema = z.object({
  box1: z.string().min(1, "Box 1 color is required"),
  box2: z.string().min(1, "Box 2 color is required"),
  box3: z.string().min(1, "Box 3 color is required"),
  box4: z.string().min(1, "Box 4 color is required"),
  triangle: z.string().min(1, "Triangle color is required"),
});

const menuItemSchema = z.object({
  label: z.string().min(1, "Label is required"),
  section: z.string(),
  className: z.string(),
});

const linkItemSchema = z.object({
  link: z.string().url("Invalid URL"),
  icon: z.string().optional(),
});

const mainLinksSchema = z.object({
  linkedin: linkItemSchema,
  instagram: linkItemSchema,
  youtube: linkItemSchema,
});

const mainSectionSchema = z.object({
  mainColors: mainColorsSchema,
  mainMenu: z.array(menuItemSchema),
  mainLinks: mainLinksSchema,
});

type MainSection = z.infer<typeof mainSectionSchema>;

export default function MainSectionForm() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<{ mainSection: MainSection }>();
  const { fields: menuFields } = useFieldArray({
    control,
    name: "mainSection.mainMenu",
  });

  return (
    <div className="space-y-4">
      <div>
        <Label>Main Colors</Label>
        <div className="grid grid-cols-2 gap-2">
          {(
            Object.keys(mainColorsSchema.shape) as Array<
              keyof typeof mainColorsSchema.shape
            >
          ).map((key) => (
            <div key={key}>
              <label>{key.charAt(0).toUpperCase() + key.slice(1)} Color</label>
              <Input
                {...register(`mainSection.mainColors.${key}`)}
                placeholder={`${
                  key.charAt(0).toUpperCase() + key.slice(1)
                } Color`}
              />
              {errors.mainSection?.mainColors?.[key] && (
                <p className="text-red-500">
                  {errors.mainSection.mainColors[key]?.message}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Main Menu</Label>
        {menuFields.map((field, index) => (
          <div key={field.id} className="flex space-x-2 mb-2">
            <Input
              {...register(`mainSection.mainMenu.${index}.label`)}
              placeholder={`Label ${index + 1}`}
            />
            {errors.mainSection?.mainMenu?.[index]?.label && (
              <p className="text-red-500">
                {errors.mainSection.mainMenu[index]?.label?.message}
              </p>
            )}
          </div>
        ))}
      </div>

      <div>
        <Label>Main Links</Label>
        <div className="space-y-2">
          {(
            Object.keys(mainLinksSchema.shape) as Array<
              keyof typeof mainLinksSchema.shape
            >
          ).map((key) => (
            <div key={key}>
              <Input
                {...register(`mainSection.mainLinks.${key}.link`)}
                placeholder={`${
                  key.charAt(0).toUpperCase() + key.slice(1)
                } Link`}
              />
              {errors.mainSection?.mainLinks?.[key]?.link && (
                <p className="text-red-500">
                  {errors.mainSection.mainLinks[key]?.link?.message}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
