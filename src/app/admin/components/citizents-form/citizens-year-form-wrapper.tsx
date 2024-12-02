"use client";

import React, { Suspense, useEffect, useState } from "react";
import { CitizensYearForm } from "./citizens-year-form";
import { fetchCitizensByYear } from "@/utils/api/admin-api-calls";
import { ErrorBoundary } from "react-error-boundary";
import { useFormContext, FieldValues } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Citizen } from "@/schemas/citizenSchema";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";

interface CitizensYearFormWrapperProps {
  selectedYear: string;
  isNewYear: boolean;
}

function CitizensYearData({
  selectedYear,
  isNewYear,
}: CitizensYearFormWrapperProps) {
  const { getValues, handleSubmit, setValue } = useFormContext();
  const { toast } = useToast();
  const [citizens, setCitizens] = useState<Citizen[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isNewYear) {
        try {
          const fetchedCitizens = await fetchCitizensByYear(selectedYear);
          setCitizens(fetchedCitizens);
          setValue(`citizensByYear.${selectedYear}`, fetchedCitizens);
        } catch (error) {
          console.error(
            `Error fetching citizens for year ${selectedYear}:`,
            error
          );
          toast({
            title: "Error",
            description: `Failed to fetch citizens for year ${selectedYear}. Please try again.`,
            variant: "destructive",
          });
        }
      } else {
        const newYearCitizens = getValues(`citizensByYear.${selectedYear}`);
        setCitizens(newYearCitizens || []);
      }
    };

    fetchData();
  }, [selectedYear, isNewYear, setValue, getValues, toast]);

  const onSubmit = async (data: FieldValues) => {
    try {
      const citizensToSubmit = data.citizensByYear[selectedYear] as Citizen[];
      const response = await fetch(
        `/api/admin/about/citizens/${selectedYear}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(citizensToSubmit),
        }
      );

      if (!response.ok)
        throw new Error(`Failed to update citizens for year ${selectedYear}`);

      toast({
        title: "Citizens updated",
        description: `Citizens for year ${selectedYear} have been successfully updated.`,
      });
    } catch (error) {
      console.error(
        `Citizens submission error for year ${selectedYear}:`,
        error
      );
      toast({
        title: "Error",
        description: `Failed to update citizens for year ${selectedYear}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CitizensYearForm
        selectedYear={selectedYear}
        initialCitizens={citizens}
      />
      <SaveChangesButton
        className="mt-2"
        watchFields={[`citizensByYear.${selectedYear}`]}
      >
        Save Citizens for {selectedYear}
      </SaveChangesButton>
    </form>
  );
}

export function CitizensYearFormWrapper({
  selectedYear,
  isNewYear,
}: CitizensYearFormWrapperProps) {
  return (
    <ErrorBoundary
      fallback={<div>Error loading citizens data. Please try again.</div>}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <CitizensYearData selectedYear={selectedYear} isNewYear={isNewYear} />
      </Suspense>
    </ErrorBoundary>
  );
}
