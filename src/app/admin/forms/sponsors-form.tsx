"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sponsor } from "@/utils/about-types";
import ImageUpload from "@/app/admin/components/image-upload";

export default function SponsorsForm() {
  const { register, control, setValue } = useFormContext<{
    aboutSection: { sponsors: Sponsor[] };
  }>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "aboutSection.sponsors",
  });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="flex flex-col space-y-2 p-4 bg-orange-50 rounded-lg"
        >
          <Label>Name</Label>
          <Input
            {...register(`aboutSection.sponsors.${index}.name`)}
            placeholder="Name"
          />
          <Label>Logo URL</Label>
          <Input
            {...register(`aboutSection.sponsors.${index}.logo`)}
            placeholder="Logo URL"
          />
          <ImageUpload
            onUpload={(imageUrl: string) => {
              setValue(`aboutSection.sponsors.${index}.logo`, imageUrl);
            }}
          />
          <Label>Website</Label>
          <Input
            {...register(`aboutSection.sponsors.${index}.website`)}
            placeholder="Website"
          />
          <Label>Sponsor Type</Label>
          <Input
            {...register(`aboutSection.sponsors.${index}.sponsorT`)}
            placeholder="Sponsor Type"
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
            logo: "",
            website: "",
            sponsorT: "",
          })
        }
        className="bg-orange-500 hover:bg-orange-600"
      >
        Add Sponsor
      </Button>
    </div>
  );
}
