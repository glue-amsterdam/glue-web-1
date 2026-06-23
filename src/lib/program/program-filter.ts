import type { EventType } from "@/schemas/eventSchemas";
import type { ProgramFilterType } from "./program-filters";
import type { ProgramListItem } from "./program-types";

const filterProgramByType = (
  items: ProgramListItem[],
  type: ProgramFilterType
): ProgramListItem[] => {
  if (type === "all") return items;
  return items.filter((item) => item.type === type);
};

const filterProgramByDay = (
  items: ProgramListItem[],
  day: string
): ProgramListItem[] => {
  if (day === "all") return items;
  return items.filter((item) => item.date.dayId === day);
};

const filterProgramBySearch = (
  items: ProgramListItem[],
  q: string
): ProgramListItem[] => {
  const normalizedQuery = q.trim().toLowerCase();
  if (!normalizedQuery) return items;

  return items.filter((item) => {
    if (item.name.toLowerCase().includes(normalizedQuery)) return true;
    if (item.organizer.userName.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    if (item.locationAddress?.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    return item.coOrganizers.some((co) =>
      co.userName.toLowerCase().includes(normalizedQuery)
    );
  });
};

const parseTimeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
  return hours * 60 + minutes;
};

const parseDateToSortKey = (date: string | null): number => {
  if (!date) return Number.MAX_SAFE_INTEGER;
  const parsed = new Date(date).getTime();
  return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
};

const sortProgramItems = (items: ProgramListItem[]): ProgramListItem[] => {
  return [...items].sort((a, b) => {
    const dateDiff =
      parseDateToSortKey(a.date.date) - parseDateToSortKey(b.date.date);
    if (dateDiff !== 0) return dateDiff;
    return parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime);
  });
};

export const applyProgramFilters = (
  items: ProgramListItem[],
  filters: {
    type: ProgramFilterType;
    day: string;
    q: string;
  }
): ProgramListItem[] => {
  let result = filterProgramByType(items, filters.type);
  result = filterProgramByDay(result, filters.day);
  result = filterProgramBySearch(result, filters.q);
  return sortProgramItems(result);
};

export const paginateProgram = (
  items: ProgramListItem[],
  offset: number,
  limit: number
): {
  pageItems: ProgramListItem[];
  total: number;
  hasMore: boolean;
} => {
  const total = items.length;
  const pageItems = items.slice(offset, offset + limit);

  return {
    pageItems,
    total,
    hasMore: offset + pageItems.length < total,
  };
};

export type ProgramListFilters = {
  type?: EventType;
  day?: string;
  q?: string;
};

export const toProgramFilterState = (
  filters: ProgramListFilters
): { type: ProgramFilterType; day: string; q: string } => ({
  type: filters.type ?? "all",
  day: filters.day ?? "all",
  q: filters.q ?? "",
});
