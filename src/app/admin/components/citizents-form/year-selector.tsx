import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToastProps } from "@/types/toast";

interface YearSelectorProps {
  years: string[];
  selectedYear: string | null;
  onYearChange: (year: string) => void;
  onAddNewYear: (year: string) => void;
  toast: (props: ToastProps) => void;
}

export function YearSelector({
  years,
  selectedYear,
  onYearChange,
  onAddNewYear,
  toast,
}: YearSelectorProps) {
  const [newYearInput, setNewYearInput] = useState<string>("");

  const handleAddNewYear = () => {
    if (newYearInput && /^\d{4}$/.test(newYearInput)) {
      onAddNewYear(newYearInput);
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
        {years?.length > 0 ? (
          years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))
        ) : (
          <option value="" disabled>
            Add a year to get started
          </option>
        )}
      </select>
    </>
  );
}
