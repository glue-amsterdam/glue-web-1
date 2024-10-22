"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InfoItem } from "@/utils/about-types";
import ImageUpload from "@/app/admin/components/image-upload";

export default function InfoItemsForm() {
  const { register, control, setValue } = useFormContext<{
    aboutSection: { infoItems: InfoItem[] };
  }>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "aboutSection.infoItems",
  });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="flex flex-col space-y-2 p-4 bg-green-50 rounded-lg"
        >
          <Label>Title</Label>
          <Input
            {...register(`aboutSection.infoItems.${index}.title`)}
            placeholder="Title"
          />
          <Label>Image URL</Label>
          <Input
            {...register(`aboutSection.infoItems.${index}.image`)}
            placeholder="Image URL"
          />
          <ImageUpload
            onUpload={(imageUrl: string) => {
              setValue(`aboutSection.infoItems.${index}.image`, imageUrl);
            }}
          />
          <Label>Description</Label>
          <Textarea
            {...register(`aboutSection.infoItems.${index}.description`)}
            placeholder="Description"
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
          append({ id: Date.now(), title: "", image: "", description: "" })
        }
        className="bg-green-500 hover:bg-green-600"
      >
        Add Info Item
      </Button>
    </div>
  );
}
