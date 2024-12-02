"use client";

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import {
  citizensSectionSchema,
  CitizensSection,
} from "@/schemas/citizenSchema";
import { MainInfoForm } from "@/app/admin/components/citizents-form/main-info-form";
import { YearSelector } from "@/app/admin/components/citizents-form/year-selector";
import { CitizensYearFormWrapper } from "@/app/admin/components/citizents-form/citizens-year-form-wrapper";

interface CitizensSectionFormProps {
  initialData: CitizensSection;
  years: string[];
}

export default function CitizensForm({
  initialData,
  years,
}: CitizensSectionFormProps) {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const { toast } = useToast();

  const methods = useForm<CitizensSection>({
    resolver: zodResolver(citizensSectionSchema),
    defaultValues: initialData,
  });

  const handleYearChange = (year: string) => {
    setSelectedYear(year === "0" ? null : year);
  };

  return (
    <FormProvider {...methods}>
      <MainInfoForm />

      <div className="mt-8 space-y-4">
        <YearSelector
          years={years}
          selectedYear={selectedYear}
          onYearChange={handleYearChange}
          setSelectedYear={setSelectedYear}
          toast={toast}
        />
      </div>

      {selectedYear && <CitizensYearFormWrapper selectedYear={selectedYear} />}
    </FormProvider>
  );
}
