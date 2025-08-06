"use client";

import { useState, useCallback, useEffect, useRef, memo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useDebounce } from "use-debounce";
import { EVENT_TYPES } from "@/constants";
import { useEventsDays } from "@/app/context/MainContext";
import { EventType } from "@/schemas/eventSchemas";

const formatEventType = (type: string): string => {
  return type
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const SearchAndFilter = memo(function SearchAndFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [type, setType] = useState<EventType | "all">("all");
  const [selectedDay, setSelectedDay] = useState<string>(
    searchParams.get("day") || "all"
  );

  const eventsDays = useEventsDays();
  const [debouncedSearch] = useDebounce(search, 300);
  const lastSearchRef = useRef<string>(searchParams.get("search") || "");

  const updateSearchParams = useCallback(
    (newParams: { [key: string]: string | null }) => {
      const params = new URLSearchParams(searchParams.toString());
      let hasChanges = false;

      Object.entries(newParams).forEach(([key, value]) => {
        const currentValue = params.get(key);
        if (value === null || value === "") {
          if (currentValue !== null) {
            params.delete(key);
            hasChanges = true;
          }
        } else {
          if (currentValue !== value) {
            params.set(key, value.toLowerCase());
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        console.log(
          "SearchAndFilter: Updating URL with params:",
          params.toString()
        );
        router.push(`/events?${params.toString()}`, { scroll: false });
      } else {
        console.log(
          "SearchAndFilter: No changes detected, skipping URL update"
        );
      }
    },
    [router, searchParams]
  );

  useEffect(() => {
    if (debouncedSearch !== lastSearchRef.current) {
      lastSearchRef.current = debouncedSearch;
      updateSearchParams({ search: debouncedSearch });
    }
  }, [debouncedSearch, updateSearchParams]);

  useEffect(() => {
    const typeFromUrl = searchParams.get("type")?.toLowerCase();
    if (
      typeFromUrl &&
      EVENT_TYPES.map((t) => t.toLowerCase()).includes(typeFromUrl)
    ) {
      setType(
        EVENT_TYPES.find((t) => t.toLowerCase() === typeFromUrl) || "all"
      );
    } else {
      setType("all");
    }
  }, [searchParams]);

  const handleTypeChange = useCallback(
    (value: string) => {
      setType(value as EventType | "all");
      updateSearchParams({ type: value === "all" ? null : value });
    },
    [updateSearchParams]
  );

  const handleDayChange = useCallback(
    (value: string) => {
      setSelectedDay(value);
      updateSearchParams({ day: value === "all" ? null : value });
    },
    [updateSearchParams]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    },
    []
  );

  return (
    <div className="mb-8 space-y-4 relative z-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <Input
          type="text"
          placeholder="Search events/ members..."
          value={search}
          onChange={handleSearchChange}
          className="flex-grow text-uiblack bg-uiwhite/80"
        />
        <Select value={type} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-full sm:w-[180px] text-uiblack bg-uiwhite/80">
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent className="absolute bg-white z-50 max-h-60 overflow-auto">
            <SelectItem value="all">All Types</SelectItem>
            {EVENT_TYPES.map((eventType) => (
              <SelectItem key={eventType} value={eventType}>
                {formatEventType(eventType)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedDay} onValueChange={handleDayChange}>
          <SelectTrigger className="w-full sm:w-[180px] text-uiblack bg-uiwhite/80">
            <SelectValue placeholder="Select Day" />
          </SelectTrigger>
          <SelectContent className="absolute bg-white z-50 max-h-60 overflow-auto">
            <SelectItem value="all">All Days</SelectItem>
            {eventsDays.map((day) => (
              <SelectItem key={day.dayId} value={day.dayId}>
                {day.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});

export default SearchAndFilter;
