"use client";

import { AboutCitizenWrapper } from "@/components/admin/about/citizens-of-honour/AboutCitizenWrapper";

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
    <AboutCitizenWrapper
      selectedYear={String(year)}
      isNewYear={isNewYear}
      onChanged={onChanged}
      onYearDeleted={() => onChanged?.()}
      compact
    />
  );
};
