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
  const handleYearDeleted = () => {
    onChanged?.();
  };

  return (
    <AboutCitizenWrapper
      selectedYear={String(year)}
      isNewYear={isNewYear}
      onYearDeleted={handleYearDeleted}
      compact
    />
  );
};
