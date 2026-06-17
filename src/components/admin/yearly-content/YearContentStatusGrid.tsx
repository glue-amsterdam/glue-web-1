"use client";

import { Button } from "@/components/ui/button";
import type {
  YearlyContentSection,
  YearlyContentYearStatus,
} from "@/lib/admin/yearly-content-types";
import { YEARLY_CONTENT_SECTION_LABELS } from "@/lib/admin/yearly-content-types";

type YearContentStatusGridProps = {
  status: YearlyContentYearStatus;
  onEdit: (section: YearlyContentSection) => void;
};

const getStatusText = (
  section: YearlyContentSection,
  status: YearlyContentYearStatus
): string => {
  switch (section) {
    case "year-numbers":
      return status.year_numbers.configured ? "✓ configured" : "✗ not configured";
    case "sticky": {
      if (!status.sticky.available && !status.sticky.has_photo) {
        return "✗ not configured";
      }
      const parts: string[] = [];
      if (status.sticky.count > 0) {
        parts.push(`${status.sticky.count} member${status.sticky.count === 1 ? "" : "s"}`);
      }
      if (status.sticky.has_photo) {
        parts.push("photo");
      }
      return `✓ ${parts.join(", ") || "group exists"}`;
    }
    case "citizens":
      return status.citizens.available
        ? `✓ ${status.citizens.count} citizen${status.citizens.count === 1 ? "" : "s"}`
        : "✗ not configured";
    case "archive":
      if (!status.archive.configured) {
        return "✗ not configured";
      }
      return status.archive.has_media
        ? "✓ configured with media"
        : "✓ configured (no media)";
    default:
      return "";
  }
};

const SECTIONS: YearlyContentSection[] = [
  "year-numbers",
  "sticky",
  "citizens",
  "archive",
];

export const YearContentStatusGrid = ({
  status,
  onEdit,
}: YearContentStatusGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {SECTIONS.map((section) => (
        <div
          key={section}
          className="border border-gray-100 rounded-lg p-4 flex flex-col gap-3"
        >
          <div>
            <h3 className="font-medium text-sm">
              {YEARLY_CONTENT_SECTION_LABELS[section]}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {getStatusText(section, status)}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => onEdit(section)}
          >
            Edit
          </Button>
        </div>
      ))}
    </div>
  );
};
