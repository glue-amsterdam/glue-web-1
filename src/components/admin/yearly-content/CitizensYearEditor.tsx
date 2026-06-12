"use client";

import { AboutCitizenWrapper } from "@/components/admin/about/citizens-of-honour/AboutCitizenWrapper";
import { CitizensYearHeaderForm } from "./CitizensYearHeaderForm";

type CitizensYearEditorProps = {
  year: number;
  isNewYear?: boolean;
  onChanged?: () => void;
};

export const CitizensYearEditor = ({
  year,
  isNewYear = false,
  onChanged,
}: CitizensYearEditorProps) => {
  return (
    <div className="space-y-8">
      <CitizensYearHeaderForm year={year} onSaved={onChanged} />
      <AboutCitizenWrapper
        selectedYear={String(year)}
        isNewYear={isNewYear}
        onChanged={onChanged}
        onYearDeleted={() => onChanged?.()}
        compact
      />
    </div>
  );
};
