import { ExhibitorNotFoundError } from "@/lib/participants/exhibitor-detail-types";
import { parseUuidParam } from "@/lib/validation/uuid";

/** Fail-closed hub id gate used before any hubs Supabase query. */
export const requireHubUuid = (hubId: string): string => {
  const parsed = parseUuidParam(hubId);
  if (!parsed) {
    throw new ExhibitorNotFoundError();
  }
  return parsed;
};
