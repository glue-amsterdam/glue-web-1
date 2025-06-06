"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import {
  citizensSectionSchema,
  type CitizensSection,
} from "@/schemas/citizenSchema";
import { EMPTY_CITIZEN } from "./constants";
import { MainInfoForm } from "./main-info-form";
import { YearSelector } from "./year-selector";
import { CitizensYearFormWrapper } from "./citizens-year-form-wrapper";

interface CitizensSectionFormProps {
  initialData: CitizensSection;
  years: string[];
}

export default function CitizensForm({
  initialData,
  years,
}: CitizensSectionFormProps) {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [isNewYear, setIsNewYear] = useState<boolean>(false);
  const { toast } = useToast();

  const methods = useForm<CitizensSection>({
    resolver: zodResolver(citizensSectionSchema),
    defaultValues: initialData,
    mode: "onChange",
  });

  const { setValue, reset } = methods;

  // Use effect to update form values when initialData changes
  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const handleYearChange = (year: string) => {
    setSelectedYear(year === "0" ? null : year);
    setIsNewYear(false);
  };

  const handleAddNewYear = (newYear: string) => {
    setSelectedYear(newYear);
    setIsNewYear(true);
    setValue(`citizensByYear.${newYear}`, [
      { ...EMPTY_CITIZEN, id: `${Date.now()}-1`, year: newYear },
      { ...EMPTY_CITIZEN, id: `${Date.now()}-2`, year: newYear },
      { ...EMPTY_CITIZEN, id: `${Date.now()}-3`, year: newYear },
    ]);
  };

  return (
    <FormProvider {...methods}>
      <MainInfoForm initialData={initialData} />

      <div className="mt-8 space-y-4">
        <YearSelector
          years={years}
          selectedYear={selectedYear}
          onYearChange={handleYearChange}
          onAddNewYear={handleAddNewYear}
          toast={toast}
        />
      </div>

      {selectedYear && (
        <CitizensYearFormWrapper
          selectedYear={selectedYear}
          isNewYear={isNewYear}
        />
      )}
    </FormProvider>
  );
}
