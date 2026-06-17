import type {
  ExhibitorSortField,
  ExhibitorSortOrder,
  ExhibitorType,
  ParsedExhibitorsQuery,
} from "./exhibitor-types";

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;
const DEFAULT_OFFSET = 0;
const DEFAULT_SORT: ExhibitorSortField = "displayNumber";
const DEFAULT_ORDER: ExhibitorSortOrder = "asc";

const VALID_TYPES: ExhibitorType[] = [
  "special-program",
  "up-to-three-participants",
  "hub",
];

const VALID_SORT_FIELDS: ExhibitorSortField[] = ["name", "displayNumber"];
const VALID_ORDERS: ExhibitorSortOrder[] = ["asc", "desc"];

export class ExhibitorsQueryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExhibitorsQueryError";
  }
}

const parsePositiveInt = (
  value: string | null,
  fieldName: string
): number | undefined => {
  if (value === null || value === "") return undefined;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new ExhibitorsQueryError(`Invalid ${fieldName}: must be a non-negative integer`);
  }

  return parsed;
};

const parseLimit = (value: string | null): number => {
  const parsed = parsePositiveInt(value, "limit");
  if (parsed === undefined) return DEFAULT_LIMIT;
  if (parsed < 1) {
    throw new ExhibitorsQueryError("Invalid limit: must be at least 1");
  }

  return Math.min(parsed, MAX_LIMIT);
};

const parseOffset = (value: string | null): number => {
  const parsed = parsePositiveInt(value, "offset");
  return parsed ?? DEFAULT_OFFSET;
};

const parseType = (value: string | null): ExhibitorType | undefined => {
  if (value === null || value === "") return undefined;

  if (!VALID_TYPES.includes(value as ExhibitorType)) {
    throw new ExhibitorsQueryError(
      `Invalid type: must be one of ${VALID_TYPES.join(", ")}`
    );
  }

  return value as ExhibitorType;
};

const parseSort = (value: string | null): ExhibitorSortField => {
  if (value === null || value === "") return DEFAULT_SORT;

  if (!VALID_SORT_FIELDS.includes(value as ExhibitorSortField)) {
    throw new ExhibitorsQueryError(
      `Invalid sort: must be one of ${VALID_SORT_FIELDS.join(", ")}`
    );
  }

  return value as ExhibitorSortField;
};

const parseOrder = (value: string | null): ExhibitorSortOrder => {
  if (value === null || value === "") return DEFAULT_ORDER;

  if (!VALID_ORDERS.includes(value as ExhibitorSortOrder)) {
    throw new ExhibitorsQueryError(
      `Invalid order: must be one of ${VALID_ORDERS.join(", ")}`
    );
  }

  return value as ExhibitorSortOrder;
};

const parseSearch = (value: string | null): string | undefined => {
  if (value === null) return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const parseExhibitorsQuery = (
  searchParams: URLSearchParams
): ParsedExhibitorsQuery => {
  const limit = parseLimit(searchParams.get("limit"));
  const offset = parseOffset(searchParams.get("offset"));
  const type = parseType(searchParams.get("type"));
  const sort = parseSort(searchParams.get("sort"));
  const order = parseOrder(searchParams.get("order"));
  const q = parseSearch(searchParams.get("q"));

  return {
    limit,
    offset,
    type,
    sort,
    order,
    q,
  };
};
