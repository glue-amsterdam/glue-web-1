import { z } from "zod";

const uuidSchema = z.string().uuid();

/** Fail-closed UUID parse for route/query params. Does not strip junk suffixes. */
export const parseUuidParam = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = uuidSchema.safeParse(trimmed);
  return parsed.success ? parsed.data : null;
};
