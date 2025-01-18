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
import { motion } from "framer-motion";
import { EVENT_TYPES } from "@/constants";
import { useEventsDays } from "@/app/context/MainContext";
import { EventType } from "@/schemas/eventSchemas";

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
  const [type, setType] = useState<EventType | "all">("all");
  const [selectedDay, setSelectedDay] = useState<string>(
    searchParams.get("day") || "all"
  );

  const eventsDays = useEventsDays();
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

  const handleTypeChange = (value: string) => {
    setType(value as EventType | "all");
    updateSearchParams({ type: value === "all" ? null : value });
  };

  const handleDayChange = (value: string) => {
    setSelectedDay(value);
    updateSearchParams({ day: value === "all" ? null : value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.3 }}
      className="mb-8 space-y-4 relative z-10"
    >
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
    </motion.div>
  );
}
