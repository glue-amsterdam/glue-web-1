"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PressItem } from "@/utils/about-types";
import ImageUpload from "@/app/admin/components/image-upload";

export default function PressItemsForm() {
  const { register, control, setValue } = useFormContext<{
    aboutSection: { pressItems: PressItem[] };
  }>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "aboutSection.pressItems",
  });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="flex flex-col space-y-2 p-4 bg-pink-50 rounded-lg"
        >
          <Label>Title</Label>
          <Input
            {...register(`aboutSection.pressItems.${index}.title`)}
            placeholder="Title"
          />
          <Label>Image URL</Label>
          <Input
            {...register(`aboutSection.pressItems.${index}.image`)}
            placeholder="Image URL"
          />
          <ImageUpload
            onUpload={(imageUrl: string) => {
              setValue(`aboutSection.pressItems.${index}.image`, imageUrl);
            }}
          />
          <Label>Description</Label>
          <Textarea
            {...register(`aboutSection.pressItems.${index}.description`)}
            placeholder="Description"
          />
          <Label>Content</Label>
          <Textarea
            {...register(`aboutSection.pressItems.${index}.content`)}
            placeholder="Content"
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
            title: "",
            image: "",
            description: "",
            content: "",
          })
        }
        className="bg-pink-500 hover:bg-pink-600"
      >
        Add Press Item
      </Button>
    </div>
  );
}
