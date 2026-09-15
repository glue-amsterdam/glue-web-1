import type { AdminUserListItem } from "@/types/admin-user";
import type { AdminUserReportCategory } from "@/lib/admin/filter-admin-users";

export type UsersReportField =
  | "displayName"
  | "email"
  | "entityType"
  | "createdAt"
  | "participantStatus"
  | "participantIsActive"
  | "participantIsSticky"
  | "participantCategory"
  | "participantSlug"
  | "participantReactivationStatus"
  | "visitorFirstName"
  | "visitorLastName"
  | "visitorBirthDate"
  | "visitorAreaName"
  | "userId"
  | "isMod";

export const USERS_REPORT_FIELDS: {
  key: UsersReportField;
  label: string;
}[] = [
  { key: "displayName", label: "Name" },
  { key: "email", label: "Email" },
  { key: "entityType", label: "Type" },
  { key: "createdAt", label: "Created At" },
  { key: "participantStatus", label: "Status" },
  { key: "participantIsActive", label: "Active" },
  { key: "participantIsSticky", label: "Sticky" },
  { key: "participantCategory", label: "Category" },
  { key: "participantSlug", label: "Slug" },
  { key: "participantReactivationStatus", label: "Reactivation" },
  { key: "visitorFirstName", label: "First name" },
  { key: "visitorLastName", label: "Last name" },
  { key: "visitorBirthDate", label: "Birth date" },
  { key: "visitorAreaName", label: "Area" },
  { key: "userId", label: "User ID" },
  { key: "isMod", label: "Moderator" },
];

const FIELD_LABELS: Record<UsersReportField, string> = Object.fromEntries(
  USERS_REPORT_FIELDS.map(({ key, label }) => [key, label])
) as Record<UsersReportField, string>;

const SHARED_FIELDS: UsersReportField[] = [
  "displayName",
  "email",
  "createdAt",
  "userId",
  "isMod",
];

const PARTICIPANT_FIELDS: UsersReportField[] = [
  "participantStatus",
  "participantIsActive",
  "participantIsSticky",
  "participantCategory",
  "participantSlug",
  "participantReactivationStatus",
];

const VISITOR_FIELDS: UsersReportField[] = [
  "visitorFirstName",
  "visitorLastName",
  "visitorBirthDate",
  "visitorAreaName",
];

export const getReportFieldsForCategory = (
  category: AdminUserReportCategory
): { key: UsersReportField; label: string }[] => {
  const allowed = new Set<UsersReportField>(SHARED_FIELDS);

  if (category === "participant") {
    for (const field of PARTICIPANT_FIELDS) allowed.add(field);
  } else if (category === "visitor") {
    for (const field of VISITOR_FIELDS) allowed.add(field);
  } else {
    allowed.add("entityType");
    for (const field of PARTICIPANT_FIELDS) allowed.add(field);
    for (const field of VISITOR_FIELDS) allowed.add(field);
  }

  return USERS_REPORT_FIELDS.filter(({ key }) => allowed.has(key));
};

export const getDefaultReportFieldsForCategory = (
  category: AdminUserReportCategory
): UsersReportField[] => {
  if (category === "visitor") {
    return ["displayName", "email", "visitorAreaName", "createdAt"];
  }
  if (category === "participant") {
    return ["displayName", "email", "participantStatus", "createdAt"];
  }
  return ["displayName", "email", "entityType", "createdAt"];
};

const formatBoolean = (value: boolean | undefined): string => {
  if (value === undefined) return "";
  return value ? "yes" : "no";
};

const formatReportCreatedAt = (user: AdminUserListItem): string => {
  if (user.visitorCreatedAt) return user.visitorCreatedAt;
  return user.createdAt ?? "";
};

export const getUsersReportFieldValue = (
  user: AdminUserListItem,
  field: UsersReportField
): string => {
  switch (field) {
    case "displayName":
      return user.displayName;
    case "email":
      return user.email ?? "";
    case "entityType":
      return user.entityType;
    case "createdAt":
      return formatReportCreatedAt(user);
    case "participantStatus":
      return user.participantStatus ?? "";
    case "participantIsActive":
      return formatBoolean(user.participantIsActive);
    case "participantIsSticky":
      return formatBoolean(user.participantIsSticky);
    case "participantCategory":
      return user.participantCategory ?? "";
    case "participantSlug":
      return user.participantSlug ?? "";
    case "participantReactivationStatus":
      return user.participantReactivationStatus ?? "";
    case "visitorFirstName":
      return user.visitorFirstName ?? "";
    case "visitorLastName":
      return user.visitorLastName ?? "";
    case "visitorBirthDate":
      return user.visitorBirthDate ?? "";
    case "visitorAreaName":
      return user.visitorAreaName ?? "";
    case "userId":
      return user.userId;
    case "isMod":
      return formatBoolean(user.isMod);
    default: {
      const _exhaustive: never = field;
      return _exhaustive;
    }
  }
};

const escapeCsvValue = (value: string): string => {
  if (!/[",\n\r]/.test(value)) return value;
  return `"${value.replace(/"/g, '""')}"`;
};

export const buildUsersReportCsv = (
  rows: AdminUserListItem[],
  fields: UsersReportField[]
): string => {
  const headers = fields.map((field) => FIELD_LABELS[field]);
  const csvRows = rows.map((user) =>
    fields.map((field) => escapeCsvValue(getUsersReportFieldValue(user, field)))
  );

  return [headers.map(escapeCsvValue), ...csvRows]
    .map((row) => row.join(","))
    .join("\n");
};

const sanitizeFilename = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const formatDateStamp = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const downloadUsersReportCsv = (
  rows: AdminUserListItem[],
  fields: UsersReportField[],
  category: AdminUserReportCategory
): void => {
  const categoryPart = category === "all" ? "all" : category;
  const filename = `${sanitizeFilename(
    `users-report-${categoryPart}-${formatDateStamp(new Date())}`
  ) || "users-report"}.csv`;
  const csv = buildUsersReportCsv(rows, fields);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
