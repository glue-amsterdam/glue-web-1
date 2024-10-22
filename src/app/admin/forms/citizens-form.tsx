"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Citizen } from "@/utils/about-types";
import ImageUpload from "@/app/admin/components/image-upload";

export default function CitizensForm() {
  const { register, control, setValue } = useFormContext<{
    aboutSection: { citizens: Citizen[] };
  }>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "aboutSection.citizens",
  });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="flex flex-col space-y-2 p-4 bg-purple-50 rounded-lg"
        >
          <Label>Name</Label>
          <Input
            {...register(`aboutSection.citizens.${index}.name`)}
            placeholder="Name"
          />
          <Label>Image URL</Label>
          <Input
            {...register(`aboutSection.citizens.${index}.image`)}
            placeholder="Image URL"
          />
          <ImageUpload
            onUpload={(imageUrl: string) => {
              setValue(`aboutSection.citizens.${index}.image`, imageUrl);
            }}
          />
          <Label>Description</Label>
          <Textarea
            {...register(`aboutSection.citizens.${index}.description`)}
            placeholder="Description"
          />
          <Label>Year</Label>
          <Input
            {...register(`aboutSection.citizens.${index}.year`, {
              valueAsNumber: true,
            })}
            type="number"
            placeholder="Year"
          />
          <Button
            type="button"
            onClick={() => remove(index)}
            className="bg-red-500 hover:bg-red-600"
          >
            Remove
          </Button>
        </div>
      ))}
      <Button
        type="button"
        onClick={() =>
          append({
            id: Date.now(),
            name: "",
            image: "",
            description: "",
            year: new Date().getFullYear(),
          })
        }
        className="bg-purple-500 hover:bg-purple-600"
      >
        Add Citizen
      </Button>
    </div>
  );
}
