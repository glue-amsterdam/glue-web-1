import type { AdminUserListItem } from "@/types/admin-user";

export type AdminUserReportCategory =
  | "all"
  | "participant"
  | "visitor"
  | "moderator";

export type AdminUserReportCriteria = {
  category: AdminUserReportCategory;
  participantStatus: "all" | "pending" | "accepted" | "declined";
  /** Inclusive YYYY-MM-DD start of createdAt range; empty = no lower bound */
  createdFrom: string;
  /** Inclusive YYYY-MM-DD end of createdAt range; empty = no upper bound */
  createdTo: string;
  /** Visitor area filter: all | none (no area) | specific area id */
  visitorAreaId: "all" | "none" | string;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const getCreatedAtTimestamp = (createdAt: string | null | undefined): number | null => {
  if (!createdAt) return null;
  const timestamp = new Date(createdAt).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
};

/** Effective registration timestamp for report date filters. */
export const getReportCreatedAtTimestamp = (
  user: AdminUserListItem
): number | null => {
  if (user.visitorCreatedAt) {
    return getCreatedAtTimestamp(user.visitorCreatedAt);
  }
  return getCreatedAtTimestamp(user.createdAt);
};

/** Start of local calendar day for YYYY-MM-DD, or null if empty/invalid. */
const parseInclusiveDayStart = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 0, 0, 0, 0);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date.getTime();
};

/** End of local calendar day for YYYY-MM-DD (inclusive), or null if empty/invalid. */
const parseInclusiveDayEnd = (value: string): number | null => {
  const start = parseInclusiveDayStart(value);
  if (start === null) return null;
  return start + MS_PER_DAY - 1;
};

export const filterAdminUsers = (
  users: AdminUserListItem[],
  criteria: AdminUserReportCriteria
): AdminUserListItem[] => {
  const {
    category,
    participantStatus,
    createdFrom,
    createdTo,
    visitorAreaId,
  } = criteria;
  const fromTs = parseInclusiveDayStart(createdFrom);
  const toTs = parseInclusiveDayEnd(createdTo);

  return users.filter((user) => {
    if (category === "participant" && user.entityType !== "participant") {
      return false;
    }
    if (category === "visitor") {
      if (user.entityType !== "visitor" || !user.hasVisitorData) {
        return false;
      }
    }
    if (category === "moderator" && !user.isMod) {
      return false;
    }

    if (participantStatus !== "all") {
      if (user.entityType !== "participant") {
        return false;
      }
      if (user.participantStatus !== participantStatus) {
        return false;
      }
    }

    if (visitorAreaId !== "all") {
      const areaId = user.visitorAreaId?.trim() ?? "";
      if (visitorAreaId === "none") {
        if (areaId) return false;
      } else if (areaId !== visitorAreaId) {
        return false;
      }
    }

    if (fromTs !== null || toTs !== null) {
      const createdAtTimestamp = getReportCreatedAtTimestamp(user);
      if (createdAtTimestamp === null) {
        return false;
      }
      if (fromTs !== null && createdAtTimestamp < fromTs) {
        return false;
      }
      if (toTs !== null && createdAtTimestamp > toTs) {
        return false;
      }
    }

    return true;
  });
};
