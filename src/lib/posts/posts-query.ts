import type { ParsedPostsQuery } from "./posts-types";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;
const DEFAULT_OFFSET = 0;

export class PostsQueryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PostsQueryError";
  }
}

const parsePositiveInt = (
  value: string | null,
  fieldName: string,
): number | undefined => {
  if (value === null || value === "") return undefined;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new PostsQueryError(
      `Invalid ${fieldName}: must be a non-negative integer`,
    );
  }

  return parsed;
};

const parseLimit = (value: string | null): number => {
  const parsed = parsePositiveInt(value, "limit");
  if (parsed === undefined) return DEFAULT_LIMIT;
  if (parsed < 1) {
    throw new PostsQueryError("Invalid limit: must be at least 1");
  }

  return Math.min(parsed, MAX_LIMIT);
};

const parseOffset = (value: string | null): number => {
  const parsed = parsePositiveInt(value, "offset");
  return parsed ?? DEFAULT_OFFSET;
};

export const parsePostsQuery = (
  searchParams: URLSearchParams,
): ParsedPostsQuery => ({
  limit: parseLimit(searchParams.get("limit")),
  offset: parseOffset(searchParams.get("offset")),
});
