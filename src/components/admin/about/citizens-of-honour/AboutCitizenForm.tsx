"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import {
  citizensSectionSchema,
  type CitizensSection,
} from "@/schemas/citizenSchema";
import { AboutCitizenHeaderForm } from "./AboutCitizenHeaderForm";
import { AboutCitizenYearSelector } from "./AboutCitizenYearSelector";
import { AboutCitizenWrapper } from "./AboutCitizenWrapper";

interface CitizensSectionFormProps {
  initialData: CitizensSection;
  years: string[];
}

export default function AboutCitizensForm({
  initialData,
  years,
}: CitizensSectionFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isNewYear, setIsNewYear] = useState<boolean>(false);
  const { toast } = useToast();

  // Get selected year from URL params
  const selectedYear = searchParams.get("year");

  const methods = useForm<CitizensSection>({
    resolver: zodResolver(citizensSectionSchema),
    defaultValues: initialData,
    mode: "onChange",
  });

  const { setValue, reset } = methods;

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  // Reset isNewYear when year changes
  useEffect(() => {
    if (selectedYear && years.includes(selectedYear)) {
      setIsNewYear(false);
    }
  }, [selectedYear, years]);

  const handleYearChange = (year: string) => {
    const newYear = year === "0" ? null : year;
    setIsNewYear(false);

    // Update URL with new year, preserving other params
    const params = new URLSearchParams(searchParams);
    if (newYear) {
      params.set("year", newYear);
    } else {
      params.delete("year");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleAddNewYear = (newYear: string) => {
    setIsNewYear(true);
    setValue(`citizensByYear.${newYear}`, []);

    // Update URL with new year, preserving other params
    const params = new URLSearchParams(searchParams);
    params.set("year", newYear);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleYearDeleted = () => {
    // Remove year from URL and redirect to no year selected, preserving other params
    const params = new URLSearchParams(searchParams);
    params.delete("year");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <FormProvider {...methods}>
      <AboutCitizenHeaderForm initialData={initialData} />

      <div className="mt-8 space-y-4">
        <AboutCitizenYearSelector
          years={years}
          selectedYear={selectedYear}
          onYearChange={handleYearChange}
          onAddNewYear={handleAddNewYear}
          toast={toast}
        />
      </div>

      {selectedYear && (
        <AboutCitizenWrapper
          selectedYear={selectedYear}
          isNewYear={isNewYear}
          onYearDeleted={handleYearDeleted}
        />
      )}
    </FormProvider>
  );
}
