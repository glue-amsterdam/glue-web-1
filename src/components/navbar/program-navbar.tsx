"use client";

import { useCallback, useId, useMemo, useRef } from "react";
import { EVENT_TYPES } from "@/constants";
import { useEventsDays } from "@/context/MainContext";
import { useDebouncedUrlSearch } from "@/hooks/useDebouncedUrlSearch";
import { useDesktopListFilterPanel } from "@/hooks/useDesktopListFilterPanel";
import { useFilterPanelHeight } from "@/hooks/useFilterPanelHeight";
import { useProgramFiltersFromUrl } from "@/hooks/useProgramFiltersFromUrl";
import { cn } from "@/lib/utils";
import {
  DEFAULT_PROGRAM_FILTERS,
  type ProgramFilterType,
  type ProgramFilters,
} from "@/lib/program/program-filters";
import BaseSecondNavbar, { FilterButton } from "./base-second-navbar";
import { FilterDropdownPanel } from "./filter-dropdown-panel";

type ProgramFilterId = "date" | "type";

const SEARCH_DEBOUNCE_MS = 400;

const formatEventType = (type: string): string =>
  type
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const isDateFilterActive = (filters: ProgramFilters) => filters.day !== "all";

const isTypeFilterActive = (filters: ProgramFilters) => filters.type !== "all";

const getActiveFilterId = (filters: ProgramFilters): ProgramFilterId | null => {
  if (isDateFilterActive(filters)) return "date";
  if (isTypeFilterActive(filters)) return "type";
  return null;
};

const ProgramNavbar = () => {
  const { filters, updateFilters } = useProgramFiltersFromUrl();
  const eventsDays = useEventsDays();

  const handleSearchCommit = useCallback(
    (q: string) => {
      if (q.trim()) {
        updateFilters({
          q,
          type: "all",
          day: "all",
        });
        return;
      }

      updateFilters({ q: "" });
    },
    [updateFilters]
  );

  const {
    inputValue: searchValue,
    onInputChange: handleSearchChange,
    onInputKeyDown: handleSearchKeyDown,
  } = useDebouncedUrlSearch({
    urlValue: filters.q,
    onCommit: handleSearchCommit,
    debounceMs: SEARCH_DEBOUNCE_MS,
  });

  const activeFilterId = useMemo(() => getActiveFilterId(filters), [filters]);

  const isFilterActive = useCallback(
    (filterId: ProgramFilterId) => {
      if (filterId === "date") return isDateFilterActive(filters);
      return isTypeFilterActive(filters);
    },
    [filters]
  );

  const handleClearFilter = useCallback(
    (filterId: ProgramFilterId) => {
      if (filterId === "date") {
        updateFilters({ day: DEFAULT_PROGRAM_FILTERS.day, q: "" });
        return;
      }

      updateFilters({ type: DEFAULT_PROGRAM_FILTERS.type, q: "" });
    },
    [updateFilters]
  );

  const {
    openFilter,
    handleFilterToggle,
    handleFilterKeyDown,
    isButtonOpen,
    afterSelect,
  } = useDesktopListFilterPanel<ProgramFilterId>({
    activeFilterId,
    isFilterActive,
    onClearFilter: handleClearFilter,
  });

  const datePanelId = useId();
  const typePanelId = useId();

  const datePanelRef = useRef<HTMLDivElement>(null);
  const typePanelRef = useRef<HTMLDivElement>(null);

  useFilterPanelHeight(
    datePanelRef,
    openFilter === "date" && activeFilterId === "date"
  );
  useFilterPanelHeight(
    typePanelRef,
    openFilter === "type" && activeFilterId === "type"
  );

  const handleDaySelect = (dayId: string) => {
    if (dayId === "all") {
      updateFilters({ day: "all", q: "" });
      afterSelect();
      return;
    }

    if (filters.day === dayId && activeFilterId === "date") {
      return;
    }

    updateFilters({ day: dayId, type: "all", q: "" });
    afterSelect();
  };

  const handleTypeSelect = (type: ProgramFilterType) => {
    if (type === "all") {
      updateFilters({ type: "all", q: "" });
      afterSelect();
      return;
    }

    if (filters.type === type && activeFilterId === "type") {
      return;
    }

    updateFilters({ type, day: "all", q: "" });
    afterSelect();
  };

  return (
    <section
      aria-label="Program filters"
      className="w-full h-(--nav-secondary-h) flex items-stretch lg:items-center relative overflow-visible border-b lg:border-b-2 border-(--black-color) bg-(--background-color) py-0 lg:py-[12px]"
    >
      <BaseSecondNavbar
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onSearchKeyDown={handleSearchKeyDown}
        searchInputId="program-search-filter"
        searchAriaLabel="Search program events by name, organiser, co-organiser or location address"
      >
        <FilterButton<ProgramFilterId>
          filterId="date"
          openFilter={openFilter}
          panelId={datePanelId}
          label="Date"
          isActive={activeFilterId === "date" && openFilter === "date"}
          isOpen={isButtonOpen("date")}
          onToggle={handleFilterToggle}
          onKeyDown={handleFilterKeyDown}
        />
        <FilterButton<ProgramFilterId>
          filterId="type"
          openFilter={openFilter}
          panelId={typePanelId}
          label="Event type"
          isActive={activeFilterId === "type" && openFilter === "type"}
          isOpen={isButtonOpen("type")}
          onToggle={handleFilterToggle}
          onKeyDown={handleFilterKeyDown}
        />
      </BaseSecondNavbar>

      <FilterDropdownPanel<ProgramFilterId>
        ref={datePanelRef}
        filterId="date"
        openFilter={openFilter}
        panelId={datePanelId}
        ariaLabel="Date options"
        className="py-[30px] lg:py-[25px] gap-[15px] lg:gap-[40px] min-h-[80px] lg:h-[81px]"
      >
        {eventsDays.map((day) => {
          const isSelected =
            activeFilterId === "date" && filters.day === day.dayId;

          return (
            <button
              key={day.dayId}
              type="button"
              aria-pressed={isSelected}
              onClick={() => handleDaySelect(day.dayId)}
              className={cn(
                "text-left base-text-size cursor-pointer",
                isSelected && "text-(--primary-color)"
              )}
            >
              {day.label}
            </button>
          );
        })}
      </FilterDropdownPanel>

      <FilterDropdownPanel<ProgramFilterId>
        ref={typePanelRef}
        filterId="type"
        openFilter={openFilter}
        panelId={typePanelId}
        ariaLabel="Event type options"
        className="py-[30px] lg:py-[25px] gap-[15px] lg:gap-[40px] min-h-[80px] lg:h-[81px]"
      >
        {EVENT_TYPES.map((eventType) => {
          const isSelected =
            activeFilterId === "type" && filters.type === eventType;

          return (
            <button
              key={eventType}
              type="button"
              aria-pressed={isSelected}
              onClick={() => handleTypeSelect(eventType)}
              className={cn(
                "text-left base-text-size cursor-pointer",
                isSelected && "text-(--primary-color)"
              )}
            >
              {formatEventType(eventType)}
            </button>
          );
        })}
      </FilterDropdownPanel>
    </section>
  );
};

export default ProgramNavbar;
