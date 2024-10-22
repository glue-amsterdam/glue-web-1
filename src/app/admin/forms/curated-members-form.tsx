"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CuratedMember } from "@/utils/about-types";

export default function CuratedMembersForm() {
  const { register, control } = useFormContext<{
    aboutSection: { curatedMembers: CuratedMember[] };
  }>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "aboutSection.curatedMembers",
  });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="flex flex-col space-y-2 p-4 bg-yellow-50 rounded-lg"
        >
          <Label>Name</Label>
          <Input
            {...register(`aboutSection.curatedMembers.${index}.name`)}
            placeholder="Name"
          />
          <Label>Year</Label>
          <Input
            {...register(`aboutSection.curatedMembers.${index}.year`, {
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
          append({ id: Date.now(), name: "", year: new Date().getFullYear() })
        }
        className="bg-yellow-500 hover:bg-yellow-600"
      >
        Add Curated Member
      </Button>
    </div>
  );
}
