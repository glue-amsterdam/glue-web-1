import type { AttendanceReportRow } from "@/lib/scan/get-attendance-report-data";

const csvHeaders = [
  "Report type",
  "Visitor name",
  "First name",
  "Last name",
  "Email",
  "Birth date",
  "Area",
  "Scanned at",
  "Event title",
  "Event type",
  "Day",
  "Day date",
  "Location",
  "Location address",
];

const escapeCsvValue = (value: string | number | null | undefined): string => {
  const text = value === null || value === undefined ? "" : String(value);
  if (!/[",\n\r]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
};

const formatScope = (scope: AttendanceReportRow["scope"]) =>
  scope === "event" ? "Event attendance" : "Location day attendance";

export const buildAttendanceReportCsv = (rows: AttendanceReportRow[]): string => {
  const csvRows = rows.map((row) => [
    formatScope(row.scope),
    row.visitorName,
    row.firstName,
    row.lastName,
    row.email,
    row.birthDate,
    row.areaName,
    row.scannedAt,
    row.eventTitle,
    row.eventType,
    row.dayLabel ?? row.dayId,
    row.dayDate,
    row.locationName,
    row.locationAddress,
  ]);

  return [csvHeaders, ...csvRows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");
};

const sanitizeFilename = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export const downloadAttendanceReportCsv = (
  rows: AttendanceReportRow[],
  reportName: string,
) => {
  const filename = `${sanitizeFilename(reportName) || "attendance-report"}.csv`;
  const csv = buildAttendanceReportCsv(rows);
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
