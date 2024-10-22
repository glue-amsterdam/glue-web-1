"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MainSection } from "@/utils/menu-types";

export default function MainSectionForm() {
  const { register, control } = useFormContext<{ mainSection: MainSection }>();
  const { fields: menuFields } = useFieldArray({
    control,
    name: "mainSection.mainMenu",
  });

  return (
    <div className="space-y-4">
      <div>
        <Label>Main Colors</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label>Box 1 Color</label>
            <Input
              {...register("mainSection.mainColors.box1")}
              placeholder="Box 1 Color"
            />
          </div>
          <div>
            <label>Box 2 Color</label>
            <Input
              {...register("mainSection.mainColors.box2")}
              placeholder="Box 2 Color"
            />
          </div>
          <div>
            <label>Box 3 Color</label>
            <Input
              {...register("mainSection.mainColors.box3")}
              placeholder="Box 3 Color"
            />
          </div>
          <div>
            <label>Box 4 Color</label>
            <Input
              {...register("mainSection.mainColors.box4")}
              placeholder="Box 4 Color"
            />
          </div>
          <div>
            <label>Triangle</label>
            <Input
              {...register("mainSection.mainColors.triangle")}
              placeholder="Triangle Color"
            />
          </div>
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
          </div>
        ))}
      </div>

      <div>
        <Label>Main Links</Label>
        <div className="space-y-2">
          <Input
            required
            {...register("mainSection.mainLinks.linkedin.link")}
            placeholder="LinkedIn Link"
          />
          <Input
            {...register("mainSection.mainLinks.instagram.link")}
            placeholder="Instagram Link"
          />
        </div>
      </div>
    </div>
  );
}
