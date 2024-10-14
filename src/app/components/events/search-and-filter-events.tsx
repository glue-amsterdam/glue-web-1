"use client";

import { useState, useCallback, useEffect } from "react";
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
import { EventType } from "@/utils/event-types";

const eventTypes: EventType[] = [
  "Lecture",
  "Workshop",
  "Drink",
  "Guided Tour",
  "Exhibition",
];

const getEventTypes = (): (EventType | "all")[] => {
  return ["all", ...eventTypes];
};

const formatEventType = (type: string): string => {
  return type
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function SearchAndFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [type, setType] = useState<EventType | "all">(
    (searchParams.get("type") as EventType) || "all"
  );
  const [date, setDate] = useState(searchParams.get("date") || "");

  const [debouncedSearch] = useDebounce(search, 300);

  const updateSearchParams = useCallback(
    (newParams: { [key: string]: string | null }) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value.toLowerCase());
        }
      });
      router.push(`/events?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  useEffect(() => {
    updateSearchParams({ search: debouncedSearch });
  }, [debouncedSearch, updateSearchParams]);

  const handleTypeChange = (value: string) => {
    setType(value as EventType | "all");
    updateSearchParams({ type: value === "all" ? null : value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
    updateSearchParams({ date: e.target.value });
  };

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <Input
          type="text"
          placeholder="Search events/ members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-grow text-uiblack bg-uiwhite/80"
        />
        <Select value={type} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-full sm:w-[180px] text-uiblack bg-uiwhite/80">
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            {getEventTypes().map((eventType) => (
              <SelectItem key={eventType} value={eventType}>
                {formatEventType(eventType)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={date}
          onChange={handleDateChange}
          className="w-full sm:w-[180px] text-uiblack bg-uiwhite/80"
        />
      </div>
    </div>
  );
}
