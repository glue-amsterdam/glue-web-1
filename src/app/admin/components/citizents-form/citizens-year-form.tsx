import React from "react";
import { CitizenForm } from "./citizen-form";
import { Citizen, CitizensSection } from "@/schemas/citizenSchema";
import { useFormContext } from "react-hook-form";

interface CitizensYearFormProps {
  selectedYear: string;
  initialCitizens: Citizen[];
}

export function CitizensYearForm({
  selectedYear,
  initialCitizens,
}: CitizensYearFormProps) {
  const { control, setValue } = useFormContext<CitizensSection>();

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Citizens for {selectedYear}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {initialCitizens.map((citizen, index) => (
          <CitizenForm
            key={citizen.id}
            control={control}
            setValue={setValue}
            index={index}
            selectedYear={selectedYear}
          />
        ))}
      </div>
    </div>
  );
}
