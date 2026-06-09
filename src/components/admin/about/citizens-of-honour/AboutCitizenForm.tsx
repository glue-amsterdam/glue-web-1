"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { AboutCitizenYearSelector } from "./AboutCitizenYearSelector";
import { AboutCitizenWrapper } from "./AboutCitizenWrapper";

interface CitizensSectionFormProps {
  years: string[];
}

export default function AboutCitizensForm({ years }: CitizensSectionFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isNewYear, setIsNewYear] = useState<boolean>(false);
  const { toast } = useToast();

  const selectedYear = searchParams.get("year");

  useEffect(() => {
    if (selectedYear && years.includes(selectedYear)) {
      setIsNewYear(false);
    }
  }, [selectedYear, years]);

  const handleYearChange = (year: string) => {
    const newYear = year === "0" ? null : year;
    setIsNewYear(false);

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

    const params = new URLSearchParams(searchParams);
    params.set("year", newYear);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleYearDeleted = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("year");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <div className="space-y-4">
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
    </>
  );
}
