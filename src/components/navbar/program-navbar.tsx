"use client";

import { useCallback, useId } from "react";
import { EVENT_TYPES } from "@/constants";
import { useEventsDays } from "@/app/context/MainContext";
import { useDebouncedUrlSearch } from "@/hooks/useDebouncedUrlSearch";
import { useProgramFiltersFromUrl } from "@/hooks/useProgramFiltersFromUrl";
import { useFilterPanel } from "@/hooks/useFilterPanel";
import type { ProgramFilterType } from "@/lib/program/program-filters";
import BaseSecondNavbar, { FilterButton } from "./base-second-navbar";
import { FilterDropdownPanel } from "./filter-dropdown-panel";

type ProgramFilterId = "date" | "type";

const SEARCH_DEBOUNCE_MS = 400;

const formatEventType = (type: string): string =>
  type
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const ProgramNavbar = () => {
  const { filters, updateFilters } = useProgramFiltersFromUrl();
  const eventsDays = useEventsDays();

  const handleSearchCommit = useCallback(
    (q: string) => updateFilters({ q }),
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

  const {
    openFilter,
    handleFilterToggle,
    handleFilterKeyDown,
    closeFilter,
  } = useFilterPanel<ProgramFilterId>();

  const datePanelId = useId();
  const typePanelId = useId();

  const handleDaySelect = (dayId: string) => {
    updateFilters({ day: dayId });
    closeFilter();
  };

  const handleTypeSelect = (type: ProgramFilterType) => {
    updateFilters({ type });
    closeFilter();
  };

  return (
    <section
      aria-label="Program filters"
      className="w-full h-(--nav-secondary-h) flex items-center relative overflow-visible border-b lg:border-b-2 border-(--black-color) bg-(--background-color) py-[12px]"
    >
      <BaseSecondNavbar
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onSearchKeyDown={handleSearchKeyDown}
        searchInputId="program-search-filter"
        searchAriaLabel="Search program events by name, organiser or co-organiser"
      >
        <FilterButton<ProgramFilterId>
          filterId="date"
          openFilter={openFilter}
          panelId={datePanelId}
          label="Date"
          onToggle={handleFilterToggle}
          onKeyDown={handleFilterKeyDown}
        />
        <FilterButton<ProgramFilterId>
          filterId="type"
          openFilter={openFilter}
          panelId={typePanelId}
          label="Event type"
          onToggle={handleFilterToggle}
          onKeyDown={handleFilterKeyDown}
        />
      </BaseSecondNavbar>

      <FilterDropdownPanel<ProgramFilterId>
        filterId="date"
        openFilter={openFilter}
        panelId={datePanelId}
        ariaLabel="Date options"
        className="py-[30px] lg:py-[25px] gap-[15px] lg:gap-[40px] min-h-[80px] lg:h-[81px]"
      >
        <button
          type="button"
          aria-pressed={filters.day === "all"}
          onClick={() => handleDaySelect("all")}
          className="text-left base-text-size"
        >
          All dates
        </button>
        {eventsDays.map((day) => (
          <button
            key={day.dayId}
            type="button"
            aria-pressed={filters.day === day.dayId}
            onClick={() => handleDaySelect(day.dayId)}
            className="text-left base-text-size"
          >
            {day.label}
          </button>
        ))}
      </FilterDropdownPanel>

      <FilterDropdownPanel<ProgramFilterId>
        filterId="type"
        openFilter={openFilter}
        panelId={typePanelId}
        ariaLabel="Event type options"
        className="py-[30px] lg:py-[25px] gap-[15px] lg:gap-[40px] min-h-[80px] lg:h-[81px]"
      >
        <button
          type="button"
          aria-pressed={filters.type === "all"}
          onClick={() => handleTypeSelect("all")}
          className="text-left base-text-size"
        >
          All types
        </button>
        {EVENT_TYPES.map((eventType) => (
          <button
            key={eventType}
            type="button"
            aria-pressed={filters.type === eventType}
            onClick={() => handleTypeSelect(eventType)}
            className="text-left base-text-size"
          >
            {formatEventType(eventType)}
          </button>
        ))}
      </FilterDropdownPanel>
    </section>
  );
};

export default ProgramNavbar;
