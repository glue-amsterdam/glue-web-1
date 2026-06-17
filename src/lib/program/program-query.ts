import { EVENT_TYPES } from "@/constants";
import type { EventType } from "@/schemas/eventSchemas";
import type { ParsedProgramQuery } from "./program-types";

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;
const DEFAULT_OFFSET = 0;

const VALID_TYPES = EVENT_TYPES as readonly EventType[];

export class ProgramQueryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProgramQueryError";
  }
}

const parsePositiveInt = (
  value: string | null,
  fieldName: string
): number | undefined => {
  if (value === null || value === "") return undefined;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new ProgramQueryError(
      `Invalid ${fieldName}: must be a non-negative integer`
    );
  }

  return parsed;
};

const parseLimit = (value: string | null): number => {
  const parsed = parsePositiveInt(value, "limit");
  if (parsed === undefined) return DEFAULT_LIMIT;
  if (parsed < 1) {
    throw new ProgramQueryError("Invalid limit: must be at least 1");
  }

  return Math.min(parsed, MAX_LIMIT);
};

const parseOffset = (value: string | null): number => {
  const parsed = parsePositiveInt(value, "offset");
  return parsed ?? DEFAULT_OFFSET;
};

const parseType = (value: string | null): EventType | undefined => {
  if (value === null || value === "") return undefined;

  const match = VALID_TYPES.find(
    (t) => t.toLowerCase() === value.toLowerCase()
  );
  if (!match) {
    throw new ProgramQueryError(
      `Invalid type: must be one of ${VALID_TYPES.join(", ")}`
    );
  }

  return match;
};

const parseDay = (value: string | null): string | undefined => {
  if (value === null || value === "") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const parseSearch = (value: string | null): string | undefined => {
  if (value === null) return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const parseProgramQuery = (
  searchParams: URLSearchParams
): ParsedProgramQuery => {
  const limit = parseLimit(searchParams.get("limit"));
  const offset = parseOffset(searchParams.get("offset"));
  const type = parseType(searchParams.get("type"));
  const day = parseDay(searchParams.get("day"));
  const q = parseSearch(searchParams.get("q"));

  return {
    limit,
    offset,
    type,
    day,
    q,
  };
};
