import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToastProps } from "@/types/toast";
import { EMPTY_CITIZEN } from "@/app/admin/components/citizents-form/constants";

interface YearSelectorProps {
  years: string[];
  selectedYear: string | null;
  onYearChange: (year: string) => void;
  setSelectedYear: React.Dispatch<React.SetStateAction<string | null>>;
  toast: (props: ToastProps) => void;
}

export function YearSelector({
  years,
  selectedYear,
  onYearChange,
  setSelectedYear,
  toast,
}: YearSelectorProps) {
  const [newYearInput, setNewYearInput] = useState<string>("");
  const { setValue } = useFormContext();

  const handleAddNewYear = () => {
    if (newYearInput && /^\d{4}$/.test(newYearInput)) {
      setSelectedYear(newYearInput);
      setValue(`citizensByYear.${newYearInput}`, [
        { ...EMPTY_CITIZEN, id: `${Date.now()}-1`, year: newYearInput },
        { ...EMPTY_CITIZEN, id: `${Date.now()}-2`, year: newYearInput },
        { ...EMPTY_CITIZEN, id: `${Date.now()}-3`, year: newYearInput },
      ]);
      setNewYearInput("");
    } else {
      toast({
        title: "Invalid Year",
        description: "Please enter a valid 4-digit year.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <Label htmlFor="yearSelect">Select Year</Label>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            value={newYearInput}
            onChange={(e) => setNewYearInput(e.target.value)}
            placeholder="YYYY"
            className="w-20"
          />
          <Button type="button" onClick={handleAddNewYear}>
            Add New Year
          </Button>
        </div>
      </div>
      <select
        id="yearSelect"
        value={selectedYear || "0"}
        onChange={(e) => onYearChange(e.target.value)}
        className="w-full p-2 border rounded"
      >
        <option value="0">Select a year</option>
        {years.length > 0 ? (
          years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))
        ) : (
          <option value="" disabled>
            Loading years...
          </option>
        )}
      </select>
    </>
  );
}
