import type { EventType } from "@/schemas/eventSchemas";

export const PROGRAM_PAGE_SIZE = 30;

export type ProgramFilterType = EventType | "all";

export type ProgramFilters = {
  type: ProgramFilterType;
  day: string;
  q: string;
};

export const DEFAULT_PROGRAM_FILTERS: ProgramFilters = {
  type: "all",
  day: "all",
  q: "",
};

export const getProgramItemKey = (item: { eventId: string }): string =>
  item.eventId;

export const getProgramLink = (eventId: string): string => `/program/${eventId}`;
