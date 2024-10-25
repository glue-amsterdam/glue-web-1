"use client";

import { Input } from "@/components/ui/input";
import { GlueInternationalContent } from "@/utils/about-types";
import { Label } from "@radix-ui/react-dropdown-menu";
import { useFormContext } from "react-hook-form";

type FormData = {
  aboutSection: {
    glueInternationalSection: GlueInternationalContent;
  };
};

export default function InternationalForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormData>();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Title</Label>
        <Input
          id="buttonColor"
          {...register("aboutSection.glueInternationalSection.buttonColor", {
            required: "ButtonColor is required",
          })}
          placeholder="Select a color"
        />
        <p>{`Use a hexadecimal color code, for example: #10069f.`}</p>
        {errors.aboutSection?.glueInternationalSection?.buttonColor && (
          <p className="text-red-500">
            {errors.aboutSection.glueInternationalSection.buttonColor.message}
          </p>
        )}
      </div>
    </div>
  );
}
