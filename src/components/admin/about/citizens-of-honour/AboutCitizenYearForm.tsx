"use client";

import { useEffect, useState } from "react";
import type { CitizensSection } from "@/schemas/citizenSchema";
import { useFormContext, type FieldArrayWithId } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { AboutCitForm } from "./AboutCitForm";

interface CitizensYearFormProps {
  selectedYear: string;
  onAddCitizen: () => void;
  onRemoveCitizen: (index: number) => void;
  fields: FieldArrayWithId<CitizensSection, `citizensByYear.${string}`, "id">[];
}

export function AboutCitizenYearForm({
  selectedYear,
  onAddCitizen,
  onRemoveCitizen,
  fields,
}: CitizensYearFormProps) {
  const { control, setValue } = useFormContext<CitizensSection>();
  const [localFields, setLocalFields] = useState(fields);

  useEffect(() => {
    setLocalFields(fields);
  }, [fields]);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Citizens for {selectedYear}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {localFields.map((field, index) => (
          <div key={field.id} className="relative">
            <AboutCitForm
              control={control}
              setValue={setValue}
              index={index}
              selectedYear={selectedYear}
            />
            {index === localFields.length - 1 && localFields.length > 3 && (
              <Button
                type="button"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={() => onRemoveCitizen(index)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
      </div>
      {localFields.length < 4 && (
        <Button type="button" onClick={onAddCitizen} className="mt-4">
          Add Citizen
        </Button>
      )}
    </div>
  );
}
