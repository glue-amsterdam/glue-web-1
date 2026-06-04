"use client";

import {
    useCallback,
    useId,
} from "react";
import type { ExhibitorSortField } from "@/lib/participants/exhibitor-types";
import {
    EXHIBITOR_TYPE_OPTIONS,
    type ExhibitorsFilterType,
    type ExhibitorsFilters,
} from "@/lib/participants/exhibitors-filters";
import { useDebouncedUrlSearch } from "@/hooks/useDebouncedUrlSearch";
import { useExhibitorsFiltersFromUrl } from "@/hooks/useExhibitorsFiltersFromUrl";
import { useFilterPanel } from "@/hooks/useFilterPanel";
import RoundedNumber from "../rounded-number";
import BaseSecondNavbar, { FilterButton } from "./base-second-navbar";
import { FilterDropdownPanel } from "./filter-dropdown-panel";

type ExhibitorFilterId = "category" | "sort";

type SortOption = {
    field: ExhibitorSortField;
    label: string;
    reverseLabel: string;
};

const SEARCH_DEBOUNCE_MS = 400;

const SORT_OPTIONS: SortOption[] = [
    { field: "name", label: "A - Z", reverseLabel: "Z - A" },
    { field: "displayNumber", label: "1 - 60", reverseLabel: "60 - 1" },
];

const getSortOptionLabel = (
    option: SortOption,
    sort: ExhibitorSortField,
    order: ExhibitorsFilters["order"]
): string => {
    if (sort !== option.field) return option.label;
    return order === "asc" ? option.label : option.reverseLabel;
};

const ExhibitorsNavbar = () => {
    const { filters, updateFilters } = useExhibitorsFiltersFromUrl();
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
    } = useFilterPanel<ExhibitorFilterId>();
    const categoryPanelId = useId();
    const sortPanelId = useId();

    const handleTypeSelect = (value: ExhibitorsFilterType) => {
        updateFilters({ type: value });
        closeFilter();
    };

    const handleSortSelect = (field: ExhibitorSortField) => {
        if (filters.sort === field) {
            updateFilters({
                order: filters.order === "asc" ? "desc" : "asc",
            });
            closeFilter();
            return;
        }

        updateFilters({ sort: field, order: "asc" });
        closeFilter();
    };

    return (
        <section
            aria-label="Exhibitors filters"
            className="w-full h-[var(--nav-secondary-h)] flex items-center relative overflow-visible border-b lg:border-b-2 border-[var(--black-color)] bg-[var(--white-color)] py-[12px]"

        >
            <BaseSecondNavbar
                searchValue={searchValue}
                onSearchChange={handleSearchChange}
                onSearchKeyDown={handleSearchKeyDown}
                searchInputId="exhibitors-search-filter"
                searchAriaLabel="Search exhibitors by name"
            >
                <FilterButton<ExhibitorFilterId>
                    filterId="category"
                    openFilter={openFilter}
                    panelId={categoryPanelId}
                    label="Category"
                    onToggle={handleFilterToggle}
                    onKeyDown={handleFilterKeyDown}
                />
                <FilterButton<ExhibitorFilterId>
                    filterId="sort"
                    openFilter={openFilter}
                    panelId={sortPanelId}
                    label="Sort"
                    onToggle={handleFilterToggle}
                    onKeyDown={handleFilterKeyDown}
                />
            </BaseSecondNavbar>

            <FilterDropdownPanel<ExhibitorFilterId>
                filterId="category"
                openFilter={openFilter}
                panelId={categoryPanelId}
                ariaLabel="Category options"
                className="py-[30px] lg:py-[25px] gap-[15px] lg:gap-[40px] min-h-[80px] lg:h-[81px]"
            >
                {EXHIBITOR_TYPE_OPTIONS.map((option) => {
                    const isActive = filters.type === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => handleTypeSelect(option.value)}
                            className="text-left flex items-center gap-[15px] base-text-size"
                        >
                            <RoundedNumber
                                type={
                                    option.value as
                                    | "special-program"
                                    | "up-to-three-participants"
                                    | "hub"
                                }
                                participant_n={"00"}
                            />
                            {option.label}
                        </button>
                    );
                })}
            </FilterDropdownPanel>

            <FilterDropdownPanel<ExhibitorFilterId>
                filterId="sort"
                openFilter={openFilter}
                panelId={sortPanelId}
                ariaLabel="Sort options"
                className="py-[35px] lg:py-[25px] gap-[15px] min-h-[80px] lg:h-[81px]"
            >
                {SORT_OPTIONS.map((option) => {
                    const isActive = filters.sort === option.field;
                    const label = getSortOptionLabel(
                        option,
                        filters.sort,
                        filters.order
                    );

                    return (
                        <button
                            key={option.field}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => handleSortSelect(option.field)}
                            className="text-left flex items-center gap-[20px] base-text-size"
                        >
                            {label}
                        </button>
                    );
                })}
            </FilterDropdownPanel>
        </section>
    );
};

export default ExhibitorsNavbar;
