"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

type YearSelectorBarProps = {
  years: number[];
  selectedYear: number | null;
  onSelectYear: (year: number) => void;
  onAddYear: (year: number) => void;
};

export const YearSelectorBar = ({
  years,
  selectedYear,
  onSelectYear,
  onAddYear,
}: YearSelectorBarProps) => {
  const [newYearInput, setNewYearInput] = useState("");
  const [showNewYearInput, setShowNewYearInput] = useState(false);

  const handleAddYear = () => {
    const year = Number(newYearInput);
    if (!Number.isFinite(year) || year < 2000 || year > 2100) {
      return;
    }

    onAddYear(year);
    setNewYearInput("");
    setShowNewYearInput(false);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {years.map((year) => {
        const isActive = selectedYear === year;

        return (
          <button
            key={year}
            type="button"
            onClick={() => onSelectYear(year)}
            className={cn(
              "rounded-md px-4 py-2 font-medium transition-colors duration-200 ease-in-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "bg-(--primary-color) text-(--white-color)"
                : "text-(--black-color) hover:text-(--primary-color)"
            )}
            aria-current={isActive ? "true" : undefined}
            aria-label={`Select year ${year}`}
          >
            {year}
          </button>
        );
      })}

      {showNewYearInput ? (
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            min={2000}
            max={2100}
            value={newYearInput}
            onChange={(e) => setNewYearInput(e.target.value)}
            placeholder="Year"
            className="w-24"
            aria-label="New year"
          />
          <Button type="button" size="sm" onClick={handleAddYear}>
            Add
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowNewYearInput(false);
              setNewYearInput("");
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowNewYearInput(true)}
        >
          <Plus className="w-4 h-4 mr-1" />
          New year
        </Button>
      )}
    </div>
  );
};
